import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

// In Next.js 15 dynamic API routes, `params` may be a Promise and must be awaited
export async function GET(_req: NextRequest, ctx: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await ctx.params;
  if (!storyId) return NextResponse.json({ ok: false, error: 'MISSING_STORY_ID' }, { status: 400 });
  const row = await prisma.jiraStory.findFirst({ where: { storyId } });
  if (!row) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true, key: row.jiraKey, lastStatus: row.lastStatus || null, labels: row.labels || [] });
}
