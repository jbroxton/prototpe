import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getLinks, getPR } from '@/app/lib/demo/lifecycleStore';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const numStr = parts[parts.length - 1] || parts[parts.length - 2];
  const prNumber = Number(numStr);
  if (!Number.isFinite(prNumber)) return NextResponse.json({ ok: false, error: 'Invalid PR number' }, { status: 400 });
  if (process.env.LIFECYCLE_DEMO === '1') {
    // In demo mode, we may have multiple repos with same PR number; return all matches
    const links = getLinks().filter((l) => l.prNumber === prNumber);
    const repos = Array.from(new Set(links.map((l) => l.repo)));
    const prs = repos
      .map((repo) => getPR(repo, prNumber))
      .filter(Boolean);
    if (!prs.length) return NextResponse.json({ ok: false, error: 'PR not found' }, { status: 404 });
    const stories = Array.from(new Set(links.filter((l) => l.sourceType === 'story').map((l) => l.sourceId)));
    const acs = Array.from(new Set(links.filter((l) => l.sourceType === 'ac').map((l) => l.sourceId)));
    return NextResponse.json({ ok: true, pr: prs, stories, acs });
  }
  const prs = await prisma.githubPr.findMany({ where: { prNumber } });
  if (!prs.length) return NextResponse.json({ ok: false, error: 'PR not found' }, { status: 404 });
  // Include any stories linked to this PR
  const links = await prisma.link.findMany({ where: { prNumber } });
  const stories = Array.from(new Set(links.filter(l=>l.sourceType==='story').map(l=>l.sourceId)));
  const acs = Array.from(new Set(links.filter(l=>l.sourceType==='ac').map(l=>l.sourceId)));
  return NextResponse.json({ ok: true, pr: prs, stories, acs });
}
