import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { aggregateStories } from '@/app/lib/demo/lifecycleStore';

export const runtime = 'nodejs';

type StoryStatus = 'draft' | 'in_pr' | 'merged' | 'deployed';

function deriveStatus(prs: { status: string }[]): StoryStatus {
  if (!prs.length) return 'draft';
  const statuses = new Set(prs.map((p) => p.status));
  if (statuses.has('deployed')) return 'deployed';
  if (statuses.has('merged')) return 'merged';
  if (statuses.has('open')) return 'in_pr';
  return 'draft';
}

export async function GET() {
  if (process.env.LIFECYCLE_DEMO === '1') {
    const { stories } = aggregateStories();
    const enhanced = stories.map((s: any) => {
      const jiraSyncStatus = s.jiraKey ? 'synced' : 'not-synced';
      return { ...s, jiraKey: s.jiraKey || null, jiraStatus: null, jiraSyncedAt: null, jiraSyncStatus };
    });
    return NextResponse.json({ ok: true, stories: enhanced });
  }
  // Aggregate stories from Link table (sourceType='story')
  const links = await prisma.link.findMany({});
  const storyIds = Array.from(new Set(links.filter(l => l.sourceType === 'story').map(l => l.sourceId)));
  const stories: any[] = [];
  for (const sid of storyIds) {
    const lks = links.filter(l => l.sourceType === 'story' && l.sourceId === sid);
    const prsRaw = await prisma.githubPr.findMany({ where: { repo: { in: lks.map(l => l.repo) }, prNumber: { in: lks.map(l => l.prNumber) } } });
    const prs = prsRaw.map(p => ({
      repo: p.repo,
      prNumber: p.prNumber,
      url: p.url,
      status: p.status,
      mergedAt: p.mergedAt,
      deployedAt: p.deployedAt,
      deploymentId: p.deploymentId !== null && p.deploymentId !== undefined ? String(p.deploymentId) : null,
      updatedAt: p.updatedAt,
    }));
    // Linked ACs for this story (IDs only)
    const acIds = Array.from(new Set(
      links
        .filter(l => l.sourceType === 'ac')
        .filter(l => lks.some(slk => slk.repo === l.repo && slk.prNumber === l.prNumber))
        .map(l => l.sourceId)
    ));
    const status = deriveStatus(prs);
    stories.push({ id: sid, status, prs, acs: acIds });
  }
  // Enrich with Jira mapping/status
  if (storyIds.length) {
    let jiraRows: Array<{ storyId: string; jiraKey: string | null; lastStatus: string | null; labels: string[]; updatedAt: Date | null; jiraUpdatedAt: Date | null; localUpdatedAt?: Date | null }> = [];
    try {
      jiraRows = await prisma.jiraStory.findMany({
        where: { storyId: { in: storyIds } },
        select: { storyId: true, jiraKey: true, lastStatus: true, labels: true, updatedAt: true, jiraUpdatedAt: true, localUpdatedAt: true },
      });
    } catch (e) {
      // Fallback in case of schema drift: try minimal selection
      jiraRows = await prisma.jiraStory.findMany({
        where: { storyId: { in: storyIds } },
        select: { storyId: true, jiraKey: true, lastStatus: true, updatedAt: true },
      }) as any;
    }
    const byId = new Map(jiraRows.map((r: any) => [r.storyId, r]));
    for (const s of stories) {
      const row: any = byId.get(s.id);
      const jiraKey = row?.jiraKey || null;
      const jiraStatus = row?.lastStatus || null;
      const syncedAt = row?.updatedAt || row?.jiraUpdatedAt || null;
      const jiraSyncStatus = jiraKey ? 'synced' : 'not-synced';
      const hasConflict = row?.localUpdatedAt && row?.jiraUpdatedAt ? (new Date(row.jiraUpdatedAt).getTime() > new Date(row.localUpdatedAt).getTime()) : false;
      s.jiraKey = jiraKey;
      s.jiraStatus = jiraStatus;
      s.jiraSyncedAt = syncedAt;
      s.jiraSyncStatus = jiraSyncStatus;
      (s as any).hasConflict = hasConflict;
    }
  }
  return NextResponse.json({ ok: true, stories });
}
