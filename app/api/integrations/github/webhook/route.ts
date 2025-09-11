import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verify as verifyGithubSignature } from '@octokit/webhooks-methods';

// Ensure we run on the Node.js runtime (not Edge) so raw body handling + crypto works
export const runtime = 'nodejs';

function ok(data?: any) { return NextResponse.json({ ok: true, ...data }, { status: 200 }); }
function bad(msg: string, status = 400) { return NextResponse.json({ ok: false, error: msg }, { status }); }

// Use the official octokit verification to avoid subtle encoding/length issues
async function verifySignature(body: string, signature: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signature) return false;
  try {
    return await verifyGithubSignature(secret, body, signature);
  } catch {
    return false;
  }
}

const STORY_RE = /US_[A-Z0-9]{3,}/g;
const AC_RE = /AC_[A-Z0-9]{3,}/g;

type NormalizedEvent = {
  source: 'github';
  type: 'pr_open' | 'pr_merge' | 'deploy';
  ids: { storyIds?: string[]; acIds?: string[] };
  refs: { repo: string; prNumber?: number; prUrl?: string; sha?: string; env?: string };
  payload: any;
};

async function storeEvent(ev: NormalizedEvent) {
  await prisma.event.create({ data: { source: ev.source, type: ev.type, payload: ev } });
}

function extractIds(texts: (string | undefined)[]) {
  const stories = new Set<string>();
  const acs = new Set<string>();
  for (const t of texts) {
    if (!t) continue;
    const s = t.match(STORY_RE) || [];
    const a = t.match(AC_RE) || [];
    s.forEach((x) => stories.add(x));
    a.forEach((x) => acs.add(x));
  }
  return { storyIds: Array.from(stories), acIds: Array.from(acs) };
}

async function upsertPr(
  repo: string,
  prNumber: number,
  url: string,
  sha: string,
  status: 'open' | 'merged' | 'deployed',
  mergedAt?: Date,
  deployedAt?: Date
) {
  const existing = await prisma.githubPr.findFirst({ where: { repo, prNumber } });
  if (existing) {
    await prisma.githubPr.update({
      where: { id: existing.id },
      data: { headSha: sha, status, url, mergedAt, deployedAt },
    });
  } else {
    await prisma.githubPr.create({
      data: { repo, prNumber, url, headSha: sha, status, mergedAt, deployedAt },
    });
  }
}

async function linkIdsToPr(
  repo: string,
  prNumber: number,
  sha: string,
  storyIds: string[],
  acIds: string[]
) {
  const entries: { sourceType: 'story' | 'ac'; sourceId: string; repo: string; prNumber: number; sha: string }[] = [];
  storyIds.forEach((id) => entries.push({ sourceType: 'story', sourceId: id, repo, prNumber, sha }));
  acIds.forEach((id) => entries.push({ sourceType: 'ac', sourceId: id, repo, prNumber, sha }));
  for (const e of entries) {
    const existing = await prisma.link.findFirst({
      where: { sourceType: e.sourceType, sourceId: e.sourceId, repo: e.repo, prNumber: e.prNumber },
    });
    if (existing) {
      await prisma.link.update({ where: { id: existing.id }, data: { sha: e.sha } });
    } else {
      await prisma.link.create({ data: e });
    }
  }
}

export async function POST(req: NextRequest) {
  // Allow bypass for deploy action callback without GH signature
  const bypass = req.headers.get('x-gh-bypass') === '1';
  const raw = await req.text();
  // Header lookup should be case-insensitive; Next headers are normalized
  const sig = req.headers.get('x-hub-signature-256') || req.headers.get('X-Hub-Signature-256');
  const event = req.headers.get('x-github-event');

  if (!bypass) {
    const okSig = await verifySignature(raw, sig);
    if (!okSig) return bad('Invalid signature', 401);
  }

  const body = raw ? JSON.parse(raw) : {};
  const DEBUG = process.env.WEBHOOK_DEBUG === '1';

  // Synthetic deploy callback (option B)
  if (bypass && body?.type === 'deploy') {
    const repo = body.repo as string;
    const sha = body.sha as string;
    await storeEvent({ source: 'github', type: 'deploy', ids: {}, refs: { repo, sha, env: body.env }, payload: body });
    // Find PR by sha
    const pr = await prisma.githubPr.findFirst({ where: { headSha: sha, repo } });
    if (pr) {
      await upsertPr(repo, pr.prNumber, pr.url, sha, 'deployed', pr.mergedAt || undefined, new Date());
    }
    return ok();
  }

  // GitHub-native events
  if (event === 'ping') return ok({ pong: true });

  if (event === 'pull_request') {
    const pr = body.pull_request;
    const action = body.action as string;
    const repo = `${body.repository?.owner?.login}/${body.repository?.name}`;
    const prNumber = pr?.number as number;
    const prUrl = pr?.html_url as string;
    const headSha = pr?.head?.sha as string;
    const branch = pr?.head?.ref as string;
    const { storyIds, acIds } = extractIds([pr?.title, pr?.body, branch]);

    if (['opened', 'edited', 'synchronize'].includes(action)) {
      await upsertPr(repo, prNumber, prUrl, headSha, 'open');
      if (storyIds.length || acIds.length) await linkIdsToPr(repo, prNumber, headSha, storyIds, acIds);
      await storeEvent({ source: 'github', type: 'pr_open', ids: { storyIds, acIds }, refs: { repo, prNumber, prUrl, sha: headSha }, payload: body });
      return ok();
    }
    if (action === 'closed' && pr?.merged) {
      await upsertPr(repo, prNumber, prUrl, headSha, 'merged', new Date());
      // Store merge mapping for reliable deployment → PR linking
      const mergeSha: string | undefined = pr?.merge_commit_sha || headSha;
      if (mergeSha) {
        const existing = await prisma.prMergeMap.findFirst({ where: { repo, prNumber, mergeSha } });
        if (!existing) await prisma.prMergeMap.create({ data: { repo, prNumber, mergeSha } });
      }
      await storeEvent({ source: 'github', type: 'pr_merge', ids: { storyIds, acIds }, refs: { repo, prNumber, prUrl, sha: headSha }, payload: body });
      return ok();
    }
    return ok();
  }

  if (event === 'deployment_status') {
    // Prefer GitHub Deployments API linkage over custom SHA tracking
    const repo = `${body.repository?.owner?.login}/${body.repository?.name}`;
    const state = body.deployment_status?.state as string;
    const env = body.deployment?.environment as string;
    const sha = body.deployment?.sha as string;
    const deploymentId = body.deployment?.id as number | undefined;
    // Normalize payload: GitHub may deliver payload as object or JSON string
    let payload = body.deployment?.payload;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch { /* ignore */ }
    }
    if (DEBUG) console.log('[deploy] payload:', JSON.stringify(payload));
    // Try to find PR numbers from deployment payload or ref
    const prNumsA: number[] = Array.isArray(payload?.pr_numbers)
      ? (payload.pr_numbers as any[]).map((n) => Number(n)).filter((n) => Number.isFinite(n))
      : [];
    const prNumsB: number[] = Array.isArray(payload?.pull_requests)
      ? (payload.pull_requests as any[]).map((pr) => Number((pr?.number ?? pr?.id))).filter((n) => Number.isFinite(n))
      : [];
    const ref: string = body.deployment?.ref || '';
    // Only extract PR numbers from refs that look like PR refs (e.g. refs/pull/123/merge)
    const prNumsC: number[] = [];
    const prRefMatch = ref.match(/refs\/pull\/(\d+)/);
    if (prRefMatch) {
      prNumsC.push(Number(prRefMatch[1]));
    }
    let prNumbers: number[] = Array.from(new Set([ ...prNumsA, ...prNumsB, ...prNumsC ]));
    // Additional fallback: parse deployment description e.g., "Merge pull request #123"
    const commitMessage: string = body.deployment?.description || '';
    const mergeMatch = commitMessage.match(/Merge pull request #(\d+)/);
    if (mergeMatch) prNumbers.push(Number(mergeMatch[1]));
    prNumbers = Array.from(new Set(prNumbers));
    // Fallback to PR→SHA mapping if still nothing
    if (prNumbers.length === 0 && sha) {
      const mappings = await prisma.prMergeMap.findMany({ where: { mergeSha: sha, repo } });
      if (mappings.length) prNumbers = Array.from(new Set([...prNumbers, ...mappings.map((m) => m.prNumber)]));
    }
    if (DEBUG) console.log('[deploy] repo:', repo, 'env:', env, 'state:', state, 'prNumbers:', prNumbers, 'sha:', sha, 'deploymentId:', deploymentId);

    if (state === 'success' && /prod/i.test(env || '')) {
      await storeEvent({ source: 'github', type: 'deploy', ids: {}, refs: { repo, sha, env }, payload: body });
      if (prNumbers.length > 0) {
        await prisma.githubPr.updateMany({
          where: { repo, prNumber: { in: prNumbers } },
          data: { status: 'deployed', deployedAt: new Date(), deploymentId: deploymentId ?? null },
        });
      } else {
        // Transitional fallback: attempt by sha (in case the workflow didn’t pass pr_numbers)
        const existing = await prisma.githubPr.findMany({ where: { repo, headSha: sha } });
        for (const pr of existing) {
          await upsertPr(repo, pr.prNumber, pr.url, sha, 'deployed', pr.mergedAt || undefined, new Date());
        }
      }
    }
    return ok();
  }

  // Unknown but valid
  await storeEvent({ source: 'github', type: 'pr_open', ids: {}, refs: { repo: body?.repository?.full_name || 'unknown' }, payload: body });
  return ok();
}
