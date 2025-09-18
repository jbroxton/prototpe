import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getOctokit } from '@/app/api/github/lib/octokit';

export const runtime = 'nodejs';

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw Object.assign(new Error(`Missing env ${name}`), { code: `MISSING_ENV:${name}` });
  return String(v);
}

// use Octokit instead of raw fetch

async function createIssue(owner: string, repo: string, title: string, body: string, labels: string[]) {
  const octokit = getOctokit();
  const { data } = await octokit.issues.create({ owner, repo, title, body, labels });
  return data;
}

function buildUsTitle(storyNumber: number, title: string) {
  return `US_${storyNumber}: ${title || 'Untitled'}`;
}

function buildAcTitle(n: number, desc: string) {
  return `AC_${n}: ${desc.slice(0, 80)}`;
}

function mdTask(text: string) { return `- [ ] ${text}`; }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const repoStr: string = String(body?.repo || '').trim();
    let owner = body?.owner ? String(body.owner) : '';
    let repo = body?.name ? String(body.name) : '';
    if (!owner || !repo) {
      if (!repoStr) {
        owner = requireEnv('GH_ORG');
        repo = requireEnv('GH_REPO');
      } else {
        const parts = repoStr.split('/');
        if (parts.length !== 2) return NextResponse.json({ ok: false, error: 'INVALID_REPO' }, { status: 400 });
        [owner, repo] = parts as [string, string];
      }
    }

    const story = body?.story as { id: string; storyNumber: number; title: string; description?: string };
    if (!story?.id || !story?.storyNumber) return NextResponse.json({ ok: false, error: 'MISSING_STORY' }, { status: 400 });
    const acs = Array.isArray(body?.acs) ? body.acs as Array<{ n: number; text: string }> : [];
    const breakout = Boolean(body?.breakout);
    const projectId: string | undefined = body?.projectId ? String(body.projectId) : undefined;

    const usTitle = buildUsTitle(story.storyNumber, story.title || '');
    const speqqUrl = projectId ? `${process.env.NEXT_PUBLIC_APP_BASE_URL || ''}/internal-projects/${encodeURIComponent(projectId)}/unified` : '';
    const acLines = acs.map(a => mdTask(`AC_${a.n}: ${a.text}`));
    const baseBody = [
      (story.description || '').trim(),
      '',
      '### Acceptance Criteria',
      ...acLines,
      '',
      speqqUrl ? `— [View in Speqq](${speqqUrl})` : '',
    ].filter(Boolean).join('\n');
    const labels = Array.from(new Set(['speqq', `US_${story.storyNumber}`]));

    const created: any[] = [];
    let parentIssue: any | null = null;
    if (!breakout) {
      parentIssue = await createIssue(owner, repo, usTitle, baseBody, labels);
      created.push(parentIssue);
      // Persist link for story → issue
      const sourceId = `US${story.storyNumber}`;
      const number = Number(parentIssue.number);
      const exists = await prisma.link.findFirst({ where: { sourceType: 'story', sourceId, repo: `${owner}/${repo}`, prNumber: number } });
      if (!exists) await prisma.link.create({ data: { sourceType: 'story', sourceId, repo: `${owner}/${repo}`, prNumber: number, sha: '' } });
    } else {
      // Parent + child issues
      parentIssue = await createIssue(owner, repo, usTitle, 'Tracking issue for ACs. Details follow.', labels);
      created.push(parentIssue);
      const children: any[] = [];
      for (const a of acs) {
        const child = await createIssue(owner, repo, buildAcTitle(a.n, a.text), `${mdTask(`AC_${a.n}: ${a.text}`)}\n\n${speqqUrl ? `[View in Speqq](${speqqUrl})` : ''}`, Array.from(new Set(['speqq', `US_${story.storyNumber}`, `AC_${a.n}`])));
        children.push(child);
        // persist AC link
        const acId = `AC${a.n}`;
        const exists = await prisma.link.findFirst({ where: { sourceType: 'ac', sourceId: acId, repo: `${owner}/${repo}`, prNumber: Number(child.number) } });
        if (!exists) await prisma.link.create({ data: { sourceType: 'ac', sourceId: acId, repo: `${owner}/${repo}`, prNumber: Number(child.number), sha: '' } });
      }
      // Update parent with task list referencing child issues
      const list = children.map((c: any) => mdTask(`${owner}/${repo}#${c.number}`)).join('\n');
      const parentBody = [`### Breakdown`, list, '', baseBody].join('\n');
      const octokit = getOctokit();
      await octokit.issues.update({ owner, repo, issue_number: Number(parentIssue.number), body: parentBody });
      // persist link for parent
      const sourceId = `US${story.storyNumber}`;
      const exists = await prisma.link.findFirst({ where: { sourceType: 'story', sourceId, repo: `${owner}/${repo}`, prNumber: Number(parentIssue.number) } });
      if (!exists) await prisma.link.create({ data: { sourceType: 'story', sourceId, repo: `${owner}/${repo}`, prNumber: Number(parentIssue.number), sha: '' } });
      created.push(...children);
    }

    return NextResponse.json({ ok: true, repo: `${owner}/${repo}`, created: created.map((i: any) => ({ number: i.number, html_url: i.html_url, state: i.state })) });
  } catch (err: any) {
    // Rate limit friendly mapping
    const details: string = err?.details || err?.message || '';
    if (err?.status === 403 && /rate limit/i.test(details)) {
      return NextResponse.json({ ok: false, error: 'GITHUB_RATE_LIMIT', message: 'GitHub rate limit exceeded. Please retry later.' }, { status: 429 });
    }
    const status = Number.isFinite(err?.status) ? err.status : 400;
    return NextResponse.json({ ok: false, error: err?.code || 'GITHUB_CREATE_FAILED', details }, { status });
  }
}
