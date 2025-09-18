import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

// POST /api/lifecycle/items
// Body: { storyId: string, acIds?: string[]|string, repo?: string, prNumber?: number }
// Creates Link rows so the story appears on /lifecycle with status 'draft'.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const rawStoryId = String(body?.storyId || '').trim();
    if (!rawStoryId) return bad('MISSING_STORY_ID');
    const storyId = rawStoryId;
    const repo = String(body?.repo || 'speqq/prod');
    let prNumber: number | undefined = Number(body?.prNumber);

    // Normalize AC ids from array or comma/space separated string
    let acIds: string[] = [];
    if (Array.isArray(body?.acIds)) {
      acIds = body.acIds.map((x: any) => String(x).trim()).filter(Boolean);
    } else if (typeof body?.acIds === 'string') {
      acIds = String(body.acIds)
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Allocate a PR number for grouping if not supplied
    if (!Number.isFinite(prNumber)) {
      const agg = await prisma.link.aggregate({ where: { repo }, _max: { prNumber: true } });
      prNumber = (agg._max.prNumber || 1000) + 1;
    }

    // Idempotent upsert: create if absent
    async function ensureLink(sourceType: 'story'|'ac', sourceId: string) {
      const existing = await prisma.link.findFirst({ where: { sourceType, sourceId, repo, prNumber: prNumber! } });
      if (!existing) {
        await prisma.link.create({ data: { sourceType, sourceId, repo, prNumber: prNumber!, sha: '' } });
      }
    }

    await ensureLink('story', storyId);
    for (const aid of acIds) await ensureLink('ac', aid);

    return NextResponse.json({ ok: true, storyId, acCount: acIds.length, repo, prNumber });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'SEED_FAILED', details: err?.message }, { status: 400 });
  }
}

