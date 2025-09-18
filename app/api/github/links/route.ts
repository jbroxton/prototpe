import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId') || '';
    if (!storyId) return NextResponse.json({ ok: false, error: 'MISSING_STORY_ID' }, { status: 400 });
    const idVariants = Array.from(new Set([storyId, storyId.replace(/^US_?/, 'US')]));
    const links = await prisma.link.findMany({ where: { sourceType: 'story', sourceId: { in: idVariants } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ ok: true, links });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'LINKS_FETCH_FAILED', details: err?.message }, { status: 400 });
  }
}

