import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ ok: false, error: 'Missing story id' }, { status: 400 });
  const links = await prisma.link.findMany({ where: { sourceType: 'story', sourceId: id } });
  const prs = await prisma.githubPr.findMany({ where: { repo: { in: links.map(l => l.repo) }, prNumber: { in: links.map(l => l.prNumber) } } });
  const status: 'draft'|'in_pr'|'merged'|'deployed' = prs.length === 0 ? 'draft' : (prs.some(p=>p.status==='deployed') ? 'deployed' : prs.some(p=>p.status==='merged') ? 'merged' : 'in_pr');
  return NextResponse.json({ ok: true, story: { id, status, prs } });
}

