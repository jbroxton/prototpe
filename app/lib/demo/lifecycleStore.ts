// Demo-only in-memory lifecycle store. Enabled via LIFECYCLE_DEMO=1

export type Link = {
  sourceType: 'story' | 'ac';
  sourceId: string;
  repo: string;
  prNumber: number;
  sha?: string;
};

export type PR = {
  repo: string;
  prNumber: number;
  url: string;
  headSha: string;
  status: 'open' | 'merged' | 'deployed';
  mergedAt?: string;
  deployedAt?: string;
  deploymentId?: string | null;
  updatedAt?: string;
};

export type MergeMap = {
  repo: string;
  prNumber: number;
  mergeSha: string;
};

export type JiraMap = Record<string, { key: string; lastStatus: string } | undefined>;

type State = {
  links: Link[];
  prs: PR[];
  merges: MergeMap[];
  jira: JiraMap;
};

const state: State = {
  links: [],
  prs: [],
  merges: [],
  jira: {},
};

function nowIso() {
  return new Date().toISOString();
}

export function reset() {
  state.links = [];
  state.prs = [];
  state.merges = [];
  state.jira = {};
}

export function addLink(link: Link) {
  const idx = state.links.findIndex(
    (l) => l.sourceType === link.sourceType && l.sourceId === link.sourceId && l.repo === link.repo && l.prNumber === link.prNumber
  );
  if (idx >= 0) state.links[idx] = { ...state.links[idx], ...link };
  else state.links.push({ ...link });
}

export function linkIdsToPr(repo: string, prNumber: number, sha: string, storyIds: string[], acIds: string[]) {
  for (const sid of storyIds) addLink({ sourceType: 'story', sourceId: sid, repo, prNumber, sha });
  for (const aid of acIds) addLink({ sourceType: 'ac', sourceId: aid, repo, prNumber, sha });
}

export function upsertPR(input: Partial<PR> & { repo: string; prNumber: number }) {
  const idx = state.prs.findIndex((p) => p.repo === input.repo && p.prNumber === input.prNumber);
  const existing = idx >= 0 ? state.prs[idx] : undefined;
  const merged: PR = {
    repo: input.repo,
    prNumber: input.prNumber,
    url: input.url || existing?.url || '',
    headSha: input.headSha || existing?.headSha || '',
    status: (input.status as PR['status']) || existing?.status || 'open',
    mergedAt: input.mergedAt || existing?.mergedAt,
    deployedAt: input.deployedAt || existing?.deployedAt,
    deploymentId: input.deploymentId ?? existing?.deploymentId ?? null,
    updatedAt: nowIso(),
  };
  if (idx >= 0) state.prs[idx] = merged; else state.prs.push(merged);
  return merged;
}

export function recordMergeSha(repo: string, prNumber: number, mergeSha: string) {
  const exists = state.merges.find((m) => m.repo === repo && m.prNumber === prNumber && m.mergeSha === mergeSha);
  if (!exists) state.merges.push({ repo, prNumber, mergeSha });
}

export function markPRMerged(repo: string, prNumber: number, mergedAtIso: string, mergeSha?: string) {
  const pr = upsertPR({ repo, prNumber, status: 'merged', mergedAt: mergedAtIso });
  if (mergeSha) recordMergeSha(repo, prNumber, mergeSha);
  return pr;
}

export function markPRDeployedByNumber(repo: string, prNumber: number, deploymentId: string, deployedAtIso: string) {
  const pr = upsertPR({ repo, prNumber, status: 'deployed', deployedAt: deployedAtIso, deploymentId });
  return pr;
}

export function upsertJiraMapping(storyId: string, key: string, lastStatus = 'In Progress') {
  state.jira[storyId] = { key, lastStatus };
}

export function getJiraByStory(storyId: string) {
  return state.jira[storyId];
}

export function getPR(repo: string, prNumber: number) {
  return state.prs.find((p) => p.repo === repo && p.prNumber === prNumber);
}

export function getLinks() {
  return state.links.slice();
}

export function aggregateStories() {
  type StoryStatus = 'draft' | 'in_pr' | 'merged' | 'deployed';
  function deriveStatus(prs: { status: string }[]): StoryStatus {
    if (!prs.length) return 'draft';
    const statuses = new Set(prs.map((p) => p.status));
    if (statuses.has('deployed')) return 'deployed';
    if (statuses.has('merged')) return 'merged';
    if (statuses.has('open')) return 'in_pr';
    return 'draft';
  }

  const storyIds = Array.from(new Set(state.links.filter((l) => l.sourceType === 'story').map((l) => l.sourceId)));
  const stories: any[] = [];
  for (const sid of storyIds) {
    const lks = state.links.filter((l) => l.sourceType === 'story' && l.sourceId === sid);
    const prs = state.prs
      .filter((p) => lks.some((lk) => lk.repo === p.repo && lk.prNumber === p.prNumber))
      .map((p) => ({
        repo: p.repo,
        prNumber: p.prNumber,
        url: p.url,
        status: p.status,
        mergedAt: p.mergedAt,
        deployedAt: p.deployedAt,
        deploymentId: p.deploymentId ?? null,
        updatedAt: p.updatedAt,
      }));
    const acIds = Array.from(
      new Set(
        state.links
          .filter((l) => l.sourceType === 'ac')
          .filter((l) => lks.some((slk) => slk.repo === l.repo && slk.prNumber === l.prNumber))
          .map((l) => l.sourceId)
      )
    );
    const status = deriveStatus(prs);
    const jira = getJiraByStory(sid);
    stories.push({ id: sid, jiraKey: jira?.key, status, prs, acs: acIds });
  }
  return { stories };
}

// For tests/debugging
export function _dumpState() {
  return JSON.parse(JSON.stringify(state));
}

