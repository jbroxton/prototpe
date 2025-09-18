import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getOctokit } from '@/app/api/github/lib/octokit';

export const runtime = 'nodejs';

// Use Octokit for all GitHub calls

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

type TimelineEvent = {
  kind: 'issue'|'branch'|'pr_open'|'checks'|'review'|'merged'|'deploy';
  title: string;
  at: string; // ISO
  href?: string;
  meta?: Record<string, any>;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = String(searchParams.get('storyId') || '').trim();
    if (!storyId) return NextResponse.json({ ok: false, error: 'MISSING_STORY_ID' }, { status: 400 });
    const ids = idVariants(storyId);
    const links = await prisma.link.findMany({ where: { sourceType: 'story', sourceId: { in: ids } }, orderBy: { createdAt: 'asc' } });
    // Partition into issues vs PRs using GithubPr
    const events: TimelineEvent[] = [];
    const repos = Array.from(new Set(links.map(l => l.repo)));
    const octokit = getOctokit();
    for (const repo of repos) {
      const nums = links.filter(l => l.repo === repo).map(l => l.prNumber);
      const prs = await prisma.githubPr.findMany({ where: { repo, prNumber: { in: nums } } });
      const prNums = new Set(prs.map(p => p.prNumber));
      const issueNums = nums.filter(n => !prNums.has(n));
      // Use first issue as primary
      for (const n of issueNums) {
        try {
          const [owner, name] = repo.split('/');
          const { data: issue } = await octokit.issues.get({ owner, repo: name, issue_number: Number(n) });
          if (!issue.pull_request) {
            events.push({ kind: 'issue', title: `Issue #${n} created`, at: issue.created_at, href: issue.html_url });
          }
        } catch {}
      }
      for (const prRow of prs) {
        const n = prRow.prNumber;
        try {
          const [owner, name] = repo.split('/');
          const { data: pr } = await octokit.pulls.get({ owner, repo: name, pull_number: Number(n) });
          const prUrl = pr.html_url as string;
          const createdAt = pr.created_at as string;
          const mergedAt = pr.merged_at as (string|null);
          const headRef = pr.head?.ref as string | undefined;
          const headSha = pr.head?.sha as string | undefined;
          if (headRef) {
            // Approximate branch creation time as PR created time
            events.push({ kind: 'branch', title: `Branch '${headRef}' created`, at: createdAt, meta: { ref: headRef } });
          }
          events.push({ kind: 'pr_open', title: `PR #${n} opened`, at: createdAt, href: prUrl });
          // Checks (combined status)
          if (headSha) {
            try {
              const { data: status } = await octokit.repos.getCombinedStatusForRef({ owner, repo: name, ref: headSha });
              if (status?.state) {
                let label = 'Checks pending';
                if (status.state === 'success') label = 'Checks passed';
                if (status.state === 'failure') label = 'Checks failed';
                const latest = (status.statuses || [])[0]?.updated_at || createdAt;
                events.push({ kind: 'checks', title: label, at: latest, href: prUrl });
              }
            } catch {}
          }
          // Reviews
          try {
            const { data: reviews } = await octokit.pulls.listReviews({ owner, repo: name, pull_number: Number(n) });
            if (Array.isArray(reviews) && reviews.length) {
              const earliest = (reviews as any[]).map((r: any) => r.submitted_at || r.created_at).filter(Boolean).sort()[0];
              events.push({ kind: 'review', title: 'Review activity', at: earliest || createdAt, href: prUrl });
            }
          } catch {}
          if (mergedAt) events.push({ kind: 'merged', title: `PR #${n} merged`, at: mergedAt, href: prUrl });
        } catch {}
      }
    }
    events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    return NextResponse.json({ ok: true, items: events });
  } catch (err: any) {
    const details: string = err?.details || err?.message || '';
    if (err?.status === 403 && /rate limit/i.test(details)) {
      return NextResponse.json({ ok: false, error: 'GITHUB_RATE_LIMIT', message: 'GitHub rate limit exceeded. Please retry later.' }, { status: 429 });
    }
    return NextResponse.json({ ok: false, error: 'TIMELINE_FETCH_FAILED', details }, { status: 400 });
  }
}
