"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { JiraStatusCell } from '@/app/components/lifecycle/JiraStatusCell';
import { JiraDataDrawer, type JiraDetails } from '@/app/components/lifecycle/JiraDataDrawer';
import { JiraEditForm } from '@/app/components/lifecycle/JiraEditForm';
import { SyncLogPanel, type SyncLogEntry } from '@/app/components/lifecycle/SyncLogPanel';
import { ConflictDiffViewer } from '@/app/components/lifecycle/ConflictDiffViewer';

type PrItem = {
  repo: string;
  prNumber: number;
  url: string;
  status: "open" | "merged" | "deployed" | string;
  mergedAt?: string;
  deployedAt?: string;
  deploymentId?: string | null;
  updatedAt?: string;
};

type StoryItem = {
  id: string;
  status: "draft" | "in_pr" | "merged" | "deployed" | string;
  prs: PrItem[];
  acs?: string[];
  jiraKey?: string | null;
  jiraStatus?: string | null;
  jiraSyncedAt?: string | null;
  jiraSyncStatus?: 'synced' | 'pending' | 'error' | 'not-synced';
  hasConflict?: boolean;
};

function classNames(...xs: (string | false | undefined)[]) { return xs.filter(Boolean).join(" "); }

function statusLabel(s: string) {
  if (s === 'draft') return 'Draft';
  if (s === 'in_pr') return 'In Development';
  if (s === 'merged') return 'In Review';
  if (s === 'deployed') return 'Deployed';
  return s;
}

function statusColor(s: string) {
  if (s === 'draft') return 'text-neutral-400 border-neutral-500';
  if (s === 'in_pr') return 'text-amber-300 border-amber-400';
  if (s === 'merged') return 'text-sky-300 border-sky-400';
  if (s === 'deployed') return 'text-emerald-300 border-emerald-400';
  return 'text-neutral-300 border-white/20';
}

export default function LifecycleDashboard() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [statusFilter, setStatusFilter] = useState<'all'|'draft'|'in_pr'|'merged'|'deployed'>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');
  const [searchId, setSearchId] = useState<string>('');
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [logEntries, setLogEntries] = useState<SyncLogEntry[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [drawerData, setDrawerData] = useState<JiraDetails | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [diffData, setDiffData] = useState<any | null>(null);
  const prevSnapshot = useRef<Record<string, string>>({}); // storyId -> status
  const changed = useRef<Record<string, boolean>>({});
  const firstSeen = useRef<Record<string, number>>({});

  async function fetchStories(signal?: AbortSignal) {
    try {
      const r = await fetch('/api/lifecycle/stories', { signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const list: StoryItem[] = (j?.stories || []).map((s: any) => ({
        ...s,
        prs: (s.prs || []).map((p: any) => ({
          ...p,
          mergedAt: p.mergedAt ? new Date(p.mergedAt).toISOString() : undefined,
          deployedAt: p.deployedAt ? new Date(p.deployedAt).toISOString() : undefined,
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        })),
      }));

      // Compute changed since last snapshot
      const nextSnapshot: Record<string, string> = {};
      list.forEach(s => { nextSnapshot[s.id] = s.status; });
      const c: Record<string, boolean> = {};
      list.forEach(s => { if (prevSnapshot.current[s.id] && prevSnapshot.current[s.id] !== s.status) c[s.id] = true; });
      changed.current = c;
      prevSnapshot.current = nextSnapshot;

      // First seen
      const now = Date.now();
      list.forEach(s => { if (!(s.id in firstSeen.current)) firstSeen.current[s.id] = now; });

      setStories(list);
      setLastUpdated(Date.now());
      setError(null);
      setLoading(false);
      setCountdown(30);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
      setLoading(false);
    }
  }

  useEffect(() => {
    const ctrl = new AbortController();
    fetchStories(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  async function openDrawer(key: string) {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError(null);
    setEditMode(false);
    try {
      const res = await fetch(`/api/jira/issue/${encodeURIComponent(key)}/details`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDrawerData(data);
    } catch (e: any) {
      setDrawerError(e?.message || 'Failed to load Jira details');
    } finally {
      setDrawerLoading(false);
    }
  }

  async function saveEdit(payload: { summary: string; description?: string; labels?: string[]; baselineUpdated: string }) {
    if (!drawerData?.key) return;
    setDrawerLoading(true);
    setDrawerError(null);
    try {
      const res = await fetch(`/api/jira/issue/${encodeURIComponent(drawerData.key)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      await openDrawer(drawerData.key);
      await fetchStories();
      setEditMode(false);
    } catch (e: any) {
      setDrawerError(e?.message || 'Save failed');
    } finally {
      setDrawerLoading(false);
    }
  }


  // Auto-refresh every 30s with countdown
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 30)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (countdown === 0) fetchStories();
  }, [countdown]);

  async function openDrawer(key: string) {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError(null);
    setEditMode(false);
    setShowDiff(false);
    setDiffData(null);
    try {
      const res = await fetch(`/api/jira/issue/${encodeURIComponent(key)}/details`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDrawerData(data);
    } catch (e: any) {
      setDrawerError(e?.message || 'Failed to load Jira details');
    } finally {
      setDrawerLoading(false);
    }
  }

  async function fetchDiff(key: string) {
    setDiffLoading(true);
    setDiffError(null);
    try {
      const res = await fetch(`/api/jira/issue/${encodeURIComponent(key)}/diff`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const fieldsApi = data?.fields || {};
      const fields: Array<{ field: string; local: any; jira: any; isDifferent: boolean }> = [];
      if (fieldsApi.summary) fields.push({ field: 'summary', local: fieldsApi.summary.local, jira: fieldsApi.summary.jira, isDifferent: !fieldsApi.summary.equal });
      if (fieldsApi.description) fields.push({ field: 'description', local: fieldsApi.description.localText, jira: fieldsApi.description.jiraText, isDifferent: !fieldsApi.description.equal });
      if (fieldsApi.labels) {
        const localLabels = drawerData?.local?.labels || [];
        const jiraLabels = drawerData?.jira?.labels || [];
        const isDiff = (fieldsApi.labels.added?.length || 0) + (fieldsApi.labels.removed?.length || 0) > 0;
        fields.push({ field: 'labels', local: localLabels, jira: jiraLabels, isDifferent: isDiff });
      }
      if (fieldsApi.status) fields.push({ field: 'status', local: fieldsApi.status.local, jira: fieldsApi.status.jira, isDifferent: !fieldsApi.status.equal });
      setDiffData({ hasConflict: true, fields });
    } catch (e: any) {
      setDiffError(e?.message || 'Failed to load diff');
    } finally {
      setDiffLoading(false);
    }
  }

  // Poll audit log every 5s
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const from = new Date(Date.now() - 60_000 * 60).toISOString();
        const r = await fetch(`/api/jira/audit?from=${encodeURIComponent(from)}&limit=100`);
        if (!r.ok) return;
        const j = await r.json();
        if (Array.isArray(j?.items)) setLogEntries(j.items);
      } catch { /* ignore polling errors */ }
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const repos = useMemo(() => {
    const set = new Set<string>();
    stories.forEach(s => s.prs.forEach(p => set.add(p.repo)));
    return ['all', ...Array.from(set)];
  }, [stories]);

  const filtered = useMemo(() => {
    let list = [...stories];
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (repoFilter !== 'all') list = list.filter(s => s.prs.some(p => p.repo === repoFilter));
    if (searchId.trim()) list = list.filter(s => s.id.toLowerCase().includes(searchId.trim().toLowerCase()));
    // Sort by most recent activity (deployedAt, mergedAt, updatedAt)
    list.sort((a, b) => {
      const at = latestTs(a);
      const bt = latestTs(b);
      return bt - at;
    });
    return list;
  }, [stories, statusFilter, repoFilter, searchId]);

  function latestTs(s: StoryItem) {
    const times = s.prs.flatMap(p => [p.deployedAt, p.mergedAt, p.updatedAt].filter(Boolean)).map(t => Date.parse(t as string));
    return times.length ? Math.max(...times) : 0;
  }

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 p-4 flex flex-col gap-3">
      <HeaderBar lastUpdated={lastUpdated} countdown={countdown} onRefresh={()=>fetchStories()} />
      <FilterBar
        status={statusFilter}
        onStatus={setStatusFilter}
        repo={repoFilter}
        repos={repos}
        onRepo={setRepoFilter}
        search={searchId}
        onSearch={setSearchId}
      />
      {error && <div className="p-2 rounded-md border border-rose-500/40 bg-rose-600/10 text-rose-200 text-sm">{error}</div>}
      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-md border border-white/10 bg-neutral-900/60 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <StoryList stories={filtered} changed={changed.current} firstSeen={firstSeen.current} onSync={async (id) => {
          try {
            setSyncing((m) => ({ ...m, [id]: true }));
            const body = { story: { id, title: id, description: '', acList: [], labels: [] } };
            const r = await fetch('/api/jira/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
            // Optimistically refresh
            await fetchStories();
          } catch {}
          finally { setSyncing((m) => ({ ...m, [id]: false })); }
        }} syncing={syncing} onOpen={openDrawer} />
      )}
      <div className="mt-6">
        <div className="text-sm text-neutral-400 mb-2">Sync Log</div>
        <SyncLogPanel entries={logEntries} />
      </div>
      {drawerOpen && (
        <div className="fixed top-0 right-0 h-full bg-neutral-950/95 border-l border-white/10 shadow-lg" style={{ width: 400 }}>
          <div className="p-3 flex items-center justify-between border-b border-white/10">
            <div className="text-sm text-neutral-300">Jira Details</div>
            <div className="inline-flex items-center gap-2">
              <label className="text-xs text-neutral-400 inline-flex items-center gap-1"><input type="checkbox" checked={showRaw} onChange={(e)=>setShowRaw(e.target.checked)} /> Raw</label>
              <button className="px-2 py-1 border border-white/10 rounded" onClick={()=>setDrawerOpen(false)}>Close</button>
            </div>
          </div>
          {drawerLoading && <div className="p-3 text-sm" aria-busy="true">Loading…</div>}
          {drawerError && <div className="p-3 text-sm text-rose-400">{drawerError}</div>}
          {!drawerLoading && !drawerError && drawerData && !editMode && (
            <div className="p-3">
              <JiraDataDrawer open={true} data={drawerData} showRaw={showRaw} onClose={()=>setDrawerOpen(false)} onEdit={()=>setEditMode(true)} />
            </div>
          )}
          {!drawerLoading && !drawerError && drawerData && editMode && (
            <div className="p-3">
              <JiraEditForm
                keyId={drawerData.key}
                initialSummary={drawerData.jira?.summary || drawerData.local?.lastSummary || ''}
                initialDescription={drawerData.jira?.descriptionText || drawerData.local?.lastDescription || ''}
                initialLabels={drawerData.jira?.labels || drawerData.local?.labels || []}
                baselineUpdated={drawerData.jira?.updated || new Date().toISOString()}
                isLoading={drawerLoading}
                error={drawerError || undefined}
                onSave={saveEdit}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HeaderBar({ lastUpdated, countdown, onRefresh }: { lastUpdated: number | null; countdown: number; onRefresh: ()=>void }) {
  const rel = lastUpdated ? Math.max(0, Math.floor((Date.now() - lastUpdated)/1000)) : null;
  return (
    <div className="flex items-center justify-between">
      <div className="text-lg font-medium">Lifecycle Tracker</div>
      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <div>Updated: {rel !== null ? `${rel}s ago` : '—'}</div>
        <div>Auto-refresh in: {countdown}s</div>
        <button onClick={onRefresh} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-900 hover:bg-neutral-800">Refresh</button>
      </div>
    </div>
  );
}

function FilterBar({ status, onStatus, repo, repos, search, onSearch }:{
  status: 'all'|'draft'|'in_pr'|'merged'|'deployed'; onStatus: (v:any)=>void;
  repo: string; repos: string[]; onRepo: (v:any)=>void;
  search: string; onSearch: (v:any)=>void;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="inline-flex items-center gap-2">Status
        <select className="bg-neutral-900 border border-white/10 rounded px-2 py-1" value={status} onChange={e=>onStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="in_pr">In Development</option>
          <option value="merged">In Review</option>
          <option value="deployed">Deployed</option>
        </select>
      </label>
      <label className="inline-flex items-center gap-2">Repo
        <select className="bg-neutral-900 border border-white/10 rounded px-2 py-1" value={repo} onChange={e=>onRepo(e.target.value)}>
          {repos.map(r=> (<option key={r} value={r}>{r}</option>))}
        </select>
      </label>
      <div className="flex-1" />
      <input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Story ID" className="bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm w-64" />
    </div>
  );
}

function StoryList({ stories, changed, firstSeen, onSync, onOpen, syncing }: { stories: StoryItem[]; changed: Record<string, boolean>; firstSeen: Record<string, number>; onSync: (id:string)=>void; onOpen: (key:string)=>void; syncing: Record<string, boolean>; }) {
  return (
    <div className="grid gap-2">
      {stories.map(s => (
        <StoryCard
          key={s.id}
          story={s}
          changed={!!changed[s.id]}
          isNew={firstSeen[s.id] ? (Date.now() - firstSeen[s.id] < 3600_000) : false}
          onSync={onSync}
          onOpen={onOpen}
          syncing={!!syncing[s.id]}
        />
      ))}
    </div>
  );
}

function StoryCard({ story, changed, isNew, onSync, onOpen, syncing }: { story: StoryItem; changed: boolean; isNew: boolean; onSync: (id:string)=>void; onOpen: (key:string)=>void; syncing: boolean; }) {
  const [open, setOpen] = useState(true);
  const badge = statusLabel(story.status);
  const color = statusColor(story.status);
  return (
    <div className="p-3 rounded-md border border-white/20 bg-transparent">
      <div className="flex items-center gap-3">
        <button onClick={()=>setOpen(o=>!o)} className="text-left font-medium hover:underline">{story.id}</button>
        <span className={classNames("px-2 py-0.5 rounded-md border text-xs", color)}>{badge}</span>
        {isNew && <span className="px-1.5 py-0.5 rounded-md border border-emerald-500/40 text-emerald-300 text-xs">NEW</span>}
        {changed && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" title="Updated in last refresh" />}
        {story.hasConflict && <span className="px-1.5 py-0.5 rounded-md border border-rose-500/40 text-rose-300 text-xxs" title="Jira updated since last local edit">CONFLICT</span>}
        <div className="ml-2">
          <JiraStatusCell
            jiraKey={story.jiraKey || undefined}
            jiraStatus={story.jiraStatus || undefined}
            jiraSyncedAt={story.jiraSyncedAt ? new Date(story.jiraSyncedAt) : undefined}
            jiraSyncStatus={story.jiraSyncStatus || (story.jiraKey ? 'synced' : 'not-synced')}
            onSync={() => onSync(story.id)}
            onOpen={(key)=>onOpen(key)}
          />
        </div>
      </div>
      {open && (
        <div className="mt-2 grid gap-2">
          <div>
            <div className="text-xs text-neutral-400 mb-1">PRs</div>
            <div className="grid gap-1">
              {story.prs.length === 0 && <div className="text-neutral-500 text-sm">No PRs linked</div>}
              {story.prs.map((p) => (
                <PRRow key={`${p.repo}#${p.prNumber}`} pr={p} />
              ))}
            </div>
          </div>
          {story.acs && story.acs.length > 0 && (
            <div className="text-sm text-neutral-300">ACs: {story.acs.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}

function PRRow({ pr }: { pr: PrItem }) {
  const statusClr = pr.status === 'deployed' ? 'text-emerald-300' : pr.status === 'merged' ? 'text-sky-300' : pr.status === 'open' ? 'text-amber-300' : 'text-neutral-300';
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="inline-flex items-center gap-2">
        <a className="text-indigo-300 hover:underline" href={pr.url} target="_blank" rel="noreferrer">{pr.repo}#${pr.prNumber}</a>
        <span className={statusClr}>{pr.status}</span>
      </div>
      <div className="text-xs text-neutral-400 inline-flex items-center gap-3">
        {pr.deploymentId && <span>Deployment: #{pr.deploymentId}</span>}
        {pr.deployedAt && <span>Deployed: {formatTime(pr.deployedAt)}</span>}
        {!pr.deployedAt && pr.mergedAt && <span>Merged: {formatTime(pr.mergedAt)}</span>}
      </div>
    </div>
  );
}

function formatTime(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch { return iso || ''; }
}
