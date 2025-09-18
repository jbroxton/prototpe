import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

function idVariants(storyId: string) {
  const m = storyId.match(/^US_?(\d+)/i);
  const n = m ? Number(m[1]) : NaN;
  const pad = (v: number) => String(v).padStart(3, '0');
  return Array.from(new Set([
    storyId,
    m ? `US${n}` : undefined,
    m ? `US_${n}` : undefined,
    m && Number.isFinite(n) ? `US_${pad(n)}` : undefined,
  ].filter(Boolean) as string[]));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = String(searchParams.get('storyId') || '').trim();
    if (!storyId) return NextResponse.json({ ok: false, error: 'MISSING_STORY_ID' }, { status: 400 });
    const ids = idVariants(storyId);
    const links = await prisma.link.findMany({ where: { sourceType: 'story', sourceId: { in: ids } } });
    if (!links.length) return NextResponse.json({ ok: true, items: [] });
    const byRepo: Record<string, number[]> = {};
    for (const l of links) {
      byRepo[l.repo] = byRepo[l.repo] || [];
      if (!byRepo[l.repo].includes(l.prNumber)) byRepo[l.repo].push(l.prNumber);
    }
    const items: any[] = [];
    for (const [repo, numbers] of Object.entries(byRepo)) {
      const rows = await prisma.githubPr.findMany({ where: { repo, prNumber: { in: numbers } } });
      // If some numbers don't exist in GithubPr (e.g., issue links), still return chips with unknown status
      for (const n of numbers) {
        const row = rows.find(r => r.prNumber === n);
        items.push({ repo, number: n, url: row?.url || `https://github.com/${repo}/pull/${n}`, status: row?.status || 'unknown', mergedAt: row?.mergedAt || null, updatedAt: row?.updatedAt || null });
      }
    }
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'PRS_FETCH_FAILED', details: err?.message }, { status: 400 });
  }
}

