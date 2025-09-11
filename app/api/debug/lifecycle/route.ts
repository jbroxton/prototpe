import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { ts: 'desc' }, take: 20 });
  const prs = await prisma.githubPr.findMany({ orderBy: { updatedAt: 'desc' }, take: 20 });
  const links = await prisma.link.findMany({ orderBy: { updatedAt: 'desc' }, take: 50 });
  const maps = await prisma.prMergeMap.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  return NextResponse.json({ ok: true, events, prs, links, maps });
}

