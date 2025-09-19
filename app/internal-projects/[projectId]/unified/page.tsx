"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import NextDynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Timeline, type TimelineEvent as UiTimelineEvent } from "@/components/ui/timeline";
import { getTestLabel } from "@/app/internal-projects/helpers/testLinkLabel";
import { EditorView } from "@codemirror/view";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/app/components/ui/toggle";
import MarkdownIt from "markdown-it";

interface AcceptanceCriteria {
  id: string;
  criteriaNumber: number;
  description: string;
  status: string;
  testLink?: string | null;
}

interface UserStory {
  id: string; // DB cuid (global unique) — use for Jira mapping
  storyNumber: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  acceptanceCriteria: AcceptanceCriteria[];
}

interface Project {
  id: string;
  name: string;
  about: string;
  status: string;
  userStories: UserStory[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectUnifiedView() {
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  // About field (Markdown editor + preview)
  const [aboutMd, setAboutMd] = useState<string>("");
  const [aboutMode, setAboutMode] = useState<"markdown" | "preview">("preview");
  const [aboutSaving, setAboutSaving] = useState<boolean>(false);
  const CodeMirror = useMemo(() => NextDynamic(() => import("@uiw/react-codemirror"), { ssr: false }), []);
  const [cmExtensions, setCmExtensions] = useState<any[]>([]);
  const md = useMemo(() => new MarkdownIt({ html: false, linkify: true, breaks: true }), []);
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [groupByRelease, setGroupByRelease] = useState<boolean>(false);
  const [releaseFilter, setReleaseFilter] = useState<string>('all');
  const [releases, setReleases] = useState<Array<{ id: string; releaseNumber: number; name: string; status: string; about?: string }>>([]);
  const [editingReleaseId, setEditingReleaseId] = useState<string | null>(null);
  const [releaseAboutDraft, setReleaseAboutDraft] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Minimal Jira mapping cache by story DB id
  const [jiraMap, setJiraMap] = useState<Record<string, { key?: string; lastStatus?: string; loading?: boolean; error?: string }>>({});
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview'|'jira'|'github'|'timeline'|'audit'|'actions'>('overview');
  const [drawerStory, setDrawerStory] = useState<UserStory | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [jiraDetails, setJiraDetails] = useState<null | {
    key: string;
    jira: { summary: string; descriptionText: string; labels: string[]; status: string; assignee: string | null; updated: string | null } | null;
    local: any;
    hasConflict: boolean;
  }>(null);
  const [auditItems, setAuditItems] = useState<Array<{ id: string; source: string; status: string; jiraKey: string; createdAt: string; diff?: any }>>([]);
  const [suppressUntil, setSuppressUntil] = useState<number>(0);
  // GitHub drawer state
  const [ghRepo, setGhRepo] = useState<string>('');
  const [ghDefaultRepo, setGhDefaultRepo] = useState<string>('');
  const [ghBreakout, setGhBreakout] = useState<boolean>(false);
  const [ghPreview, setGhPreview] = useState<null | { items: Array<{ title: string; labels: string[]; body: string }> }>(null);
  const [ghLinks, setGhLinks] = useState<Array<{ repo: string; number: number }>>([]);
  const [ghPrs, setGhPrs] = useState<Array<{ repo: string; number: number; status: string; url: string }>>([]);
  const [ghTimeline, setGhTimeline] = useState<UiTimelineEvent[]>([]);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeDrawer(); }
    if (drawerOpen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (renaming) {
      setNameDraft(project?.name || "");
      requestAnimationFrame(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      });
    }
  }, [renaming, project?.name]);

  // Load persisted GitHub settings
  useEffect(() => {
    try {
      const r = localStorage.getItem('github:repo');
      if (r) setGhRepo(r);
      const b = localStorage.getItem('github:breakout');
      if (b) setGhBreakout(b === '1');
    } catch {}
  }, []);

  // Load default repo from server config when drawer opens and no repo set
  useEffect(() => {
    (async () => {
      if (!drawerOpen) return;
      if (ghRepo) return;
      try {
        const r = await fetch('/api/github/config');
        const j = await r.json();
        if (r.ok && j?.ok) {
          if (j.defaultRepo) {
            setGhDefaultRepo(j.defaultRepo);
            // If user has not chosen a repo yet, prefill input
            setGhRepo((prev) => prev || j.defaultRepo);
          }
        }
      } catch {}
    })();
  }, [drawerOpen]);

  // Initialize CodeMirror extensions for About editor (Markdown + dark theme)
  useEffect(() => {
    (async () => {
      const mod = await import("@codemirror/lang-markdown");
      const blackTheme = EditorView.theme(
        {
          "&": { backgroundColor: "#0b0b0b", color: "#e5e7eb" },
          ".cm-scroller": { backgroundColor: "#0b0b0b" },
          ".cm-content": { caretColor: "#ffffff" },
          ".cm-gutters": { backgroundColor: "#0a0a0a", color: "#9ca3af", border: "none" },
          ".cm-activeLine": { backgroundColor: "transparent" },
          ".cm-activeLineGutter": { backgroundColor: "transparent" },
          ".cm-selectionBackground, .cm-content ::selection": { backgroundColor: "rgba(99,102,241,0.35)" },
          ".cm-lineNumbers .cm-gutterElement": { color: "#6b7280" },
        },
        { dark: true }
      );
      setCmExtensions([mod.markdown(), EditorView.lineWrapping, blackTheme]);
    })();
  }, []);

  function idVariants(story: UserStory): string[] {
    const n = Number(story.storyNumber);
    const pad = (v: number) => String(v).padStart(3, '0');
    // DB cuid first, then common US id encodings used elsewhere
    return Array.from(new Set([
      story.id,
      `US${n}`,
      `US_${n}`,
      `US_${pad(n)}`,
    ]));
  }

  // getTestLabel imported from helper

  useEffect(() => {
    fetchProject();
    fetchReleases();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/internal-projects?projectId=${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.data);
        setAboutMd(String(data.data?.about || ""));
        // Expand all stories by default for dense view
        const storyNumbers = data.data.userStories?.map((s: UserStory) => s.storyNumber) || [];
        setExpandedStories(new Set(storyNumbers));
        // Best-effort: prefetch Jira mapping for current stories (non-blocking)
        try {
          const stories: UserStory[] = data.data.userStories || [];
          const next: Record<string, { key?: string; lastStatus?: string; loading?: boolean; error?: string }> = {};
          for (const s of stories) next[s.id] = { loading: true };
          setJiraMap((m) => ({ ...m, ...next }));
          // Limit concurrency with fallback id variants
          for (const s of stories) {
            (async () => {
              let mapped: { key?: string; lastStatus?: string } | null = null;
              for (const cand of idVariants(s)) {
                try {
                  const r = await fetch(`/api/jira/map/${encodeURIComponent(cand)}`);
                  const j = await r.json();
                  if (r.ok && j?.ok) { mapped = { key: j.key, lastStatus: j.lastStatus || undefined }; break; }
                } catch {}
              }
              if (mapped) setJiraMap((m) => ({ ...m, [s.id]: { ...mapped } }));
              else setJiraMap((m) => ({ ...m, [s.id]: { error: 'NOT_FOUND' } }));
            })();
          }
        } catch {}
      } else {
        setError(data.error || 'Failed to load project');
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setError('Unable to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  async function saveProjectName(nextName: string) {
    if (!project) return;
    const trimmed = nextName.trim();
    if (!trimmed) {
      setRenameError("Project name cannot be empty.");
      requestAnimationFrame(() => renameInputRef.current?.focus());
      return;
    }
    if (trimmed === project.name) {
      setRenaming(false);
      setRenameError(null);
      return;
    }

    const previousName = project.name;
    setSavingName(true);
    setRenameError(null);
    setProject((prev) => (prev ? { ...prev, name: trimmed } : prev));

    try {
      const response = await fetch("/api/internal-projects", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, name: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }
      await fetchProject();
      setRenaming(false);
    } catch (error) {
      setProject((prev) => (prev ? { ...prev, name: previousName } : prev));
      setRenameError(error instanceof Error ? error.message : "Failed to rename project");
      requestAnimationFrame(() => renameInputRef.current?.focus());
    } finally {
      setSavingName(false);
    }
  }

  async function saveAbout(next: string) {
    try {
      setAboutSaving(true);
      const res = await fetch('/api/internal-projects', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projectId, about: next }) });
      const j = await res.json();
      if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);
      await fetchProject();
    } catch { /* non-fatal */ }
    finally { setAboutSaving(false); }
  }

  async function fetchReleases() {
    try {
      if (!projectId) return;
      const res = await fetch(`/api/internal-projects/releases?projectId=${encodeURIComponent(projectId)}`);
      const j = await res.json();
      if (res.ok && j?.success) {
        setReleases(j.data.releases || []);
        if ((j.data.releases || []).length > 0) setGroupByRelease(true);
      } else setReleases([]);
    } catch { setReleases([]); }
  }

  async function addRelease() {
    try {
      setError(null);
      const res = await fetch('/api/internal-projects/releases', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ projectId, action: 'add' })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) throw new Error(j?.error || `Create failed (HTTP ${res.status})`);
      await fetchReleases();
    } catch (e: any) {
      setError(e?.message || 'Failed to create release');
    }
  }

  async function saveReleaseAbout(rid: string, about: string) {
    try {
      const res = await fetch('/api/internal-projects/releases', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projectId, action: 'update', release: { id: rid, about } }) });
      const j = await res.json();
      if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);
      await fetchReleases();
      setEditingReleaseId(null);
    } catch {}
  }

  function acLabel(ac: AcceptanceCriteria) {
    // Provide AC_# pattern so Jira labels include AC ids
    return `AC_${ac.criteriaNumber}: ${ac.description}`;
  }

  async function syncStoryToJira(story: UserStory) {
    try {
      setJiraMap((m) => ({ ...m, [story.id]: { ...(m[story.id] || {}), loading: true, error: undefined } }));
      const payload = {
        story: {
          id: story.id, // use DB cuid for uniqueness in JiraStory.storyId
          title: story.title || `US${story.storyNumber}`,
          description: story.description || '',
          acList: (story.acceptanceCriteria || []).map(acLabel),
          labels: [
            `US_${story.storyNumber}`,
            ...new Set((story.acceptanceCriteria || []).map((c) => `AC_${c.criteriaNumber}`)),
          ],
        },
      };
      const res = await fetch('/api/jira/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) {
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      // Refresh map
      const mapRes = await fetch(`/api/jira/map/${encodeURIComponent(story.id)}`);
      const mapJson = await mapRes.json().catch(() => ({}));
      if (mapRes.ok && mapJson?.ok) {
        setJiraMap((m) => ({ ...m, [story.id]: { key: mapJson.key, lastStatus: mapJson.lastStatus || undefined, loading: false } }));
      } else {
        setJiraMap((m) => ({ ...m, [story.id]: { loading: false } }));
      }
    } catch (e: any) {
      setJiraMap((m) => ({ ...m, [story.id]: { ...(m[story.id] || {}), error: e?.message || 'SYNC_FAILED', loading: false } }));
    }
  }

  async function refreshJiraMap(story: UserStory) {
    try {
      setJiraMap((m) => ({ ...m, [story.id]: { ...(m[story.id] || {}), loading: true, error: undefined } }));
      const r = await fetch(`/api/jira/map/${encodeURIComponent(story.id)}`);
      const j = await r.json();
      if (r.ok && j?.ok) setJiraMap((m) => ({ ...m, [story.id]: { key: j.key, lastStatus: j.lastStatus || undefined, loading: false } }));
      else setJiraMap((m) => ({ ...m, [story.id]: { ...(m[story.id] || {}), error: j?.error || 'NOT_FOUND', loading: false } }));
    } catch {
      setJiraMap((m) => ({ ...m, [story.id]: { ...(m[story.id] || {}), error: 'FETCH_FAILED', loading: false } }));
    }
  }

  async function setStoryRelease(storyDisplayId: string, relId: string | null) {
    try {
      const res = await fetch('/api/internal-projects/stories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projectId, action: 'update', story: { id: storyDisplayId, releaseId: relId } }) });
      const j = await res.json();
      if (!res.ok || !j?.success) throw new Error(j?.error || `HTTP ${res.status}`);
      await fetchProject();
      await fetchReleases();
    } catch {}
  }

  function openDrawer(story: UserStory) {
    if (Date.now() < suppressUntil) return; // guard against immediate re-open from close click
    setDrawerStory(story);
    setDrawerTab('overview');
    setDrawerOpen(true);
    loadJiraForStory(story);
    loadAuditsForStory(story);
    loadGitHubLinksForStory(story);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerStory(null);
    setJiraDetails(null);
    setAuditItems([]);
    setDrawerError(null);
    setSuppressUntil(Date.now() + 300);
  }

  async function loadJiraForStory(story: UserStory) {
    setDrawerLoading(true);
    setDrawerError(null);
    try {
      // Ensure we have mapping first — try id variants
      let key: string | undefined;
      let lastStatus: string | undefined;
      for (const cand of idVariants(story)) {
        const mapRes = await fetch(`/api/jira/map/${encodeURIComponent(cand)}`);
        const mapJson = await mapRes.json();
        if (mapRes.ok && mapJson?.ok && mapJson.key) { key = mapJson.key; lastStatus = mapJson.lastStatus || undefined; break; }
      }
      if (!key) { setJiraDetails(null); return; }
      const detailsRes = await fetch(`/api/jira/issue/${encodeURIComponent(key)}/details`);
      const detailsJson = await detailsRes.json();
      if (detailsRes.ok && detailsJson?.ok) {
        setJiraDetails({ key, jira: detailsJson.jira, local: detailsJson.local, hasConflict: !!detailsJson.hasConflict });
        setJiraMap((m) => ({ ...m, [story.id]: { key, lastStatus: detailsJson?.jira?.status || lastStatus } }));
      } else {
        setJiraDetails(null);
        setDrawerError(detailsJson?.error || 'Failed to load Jira details');
      }
    } catch (e: any) {
      setDrawerError(e?.message || 'Failed to load Jira details');
    } finally {
      setDrawerLoading(false);
    }
  }

  async function loadAuditsForStory(story: UserStory) {
    try {
      // Try appId variants first
      let items: any[] = [];
      for (const cand of idVariants(story)) {
        try {
          const r = await fetch(`/api/jira/audit?appId=${encodeURIComponent(cand)}&order=desc&limit=50`);
          const j = await r.json();
          if (r.ok && j?.ok && Array.isArray(j.items)) { items = j.items; break; }
        } catch {}
      }
      // If still empty, try by jiraKey if mapping cache has one
      if ((!items || items.length === 0) && jiraMap[story.id]?.key) {
        try {
          const r = await fetch(`/api/jira/audit?key=${encodeURIComponent(jiraMap[story.id]!.key!)}&order=desc&limit=50`);
          const j = await r.json();
          if (r.ok && j?.ok && Array.isArray(j.items)) items = j.items;
        } catch {}
      }
      setAuditItems(items || []);
    } catch {}
  }

  async function loadGitHubLinksForStory(story: UserStory) {
    try {
      const storyDisplayId = `US${story.storyNumber}`;
      const res = await fetch(`/api/github/links?storyId=${encodeURIComponent(storyDisplayId)}`);
      const json = await res.json();
      if (res.ok && json?.ok) {
        const links = (json.links || []).map((l: any) => ({ repo: l.repo, number: l.prNumber }));
        setGhLinks(links);
      }
    } catch {}
    try {
      const storyDisplayId = `US${story.storyNumber}`;
      const r = await fetch(`/api/github/prs?storyId=${encodeURIComponent(storyDisplayId)}`);
      const j = await r.json();
      if (r.ok && j?.ok) {
        const prs = (j.items || []).map((p: any) => ({ repo: p.repo, number: p.number, status: String(p.status || 'unknown'), url: p.url }));
        setGhPrs(prs);
      }
    } catch {}
    try {
      const storyDisplayId = `US${story.storyNumber}`;
      const r = await fetch(`/api/github/timeline?storyId=${encodeURIComponent(storyDisplayId)}`);
      const j = await r.json();
      if (r.ok && j?.ok) setGhTimeline((j.items || []) as UiTimelineEvent[]);
    } catch {}
  }

  function buildIssuePreviewForStory(story: UserStory) {
    const acs = (story.acceptanceCriteria || []).map((c) => ({ n: c.criteriaNumber, text: c.description }));
    const title = `US_${story.storyNumber}: ${story.title}`;
    const labels = Array.from(new Set(['speqq', `US_${story.storyNumber}`]));
    const bodyLines = [
      (story.description || '').trim(),
      '',
      '### Acceptance Criteria',
      ...acs.map((a) => `- [ ] AC_${a.n}: ${a.text}`),
    ];
    const body = bodyLines.join('\n');
    if (!ghBreakout) return { items: [{ title, labels, body }] };
    // breakout: parent + children
    const parent = { title, labels, body };
    const children = acs.map((a) => ({ title: `AC_${a.n}: ${a.text.slice(0, 80)}`, labels: Array.from(new Set(['speqq', `US_${story.storyNumber}`, `AC_${a.n}`])), body: `- [ ] AC_${a.n}: ${a.text}` }));
    return { items: [parent, ...children] };
  }

  async function pushToGitHub(story: UserStory) {
    try {
      const repo = ghRepo || ghDefaultRepo;
      if (!repo) throw new Error('Select a repo');
      const acs = (story.acceptanceCriteria || []).map((c) => ({ n: c.criteriaNumber, text: c.description }));
      const res = await fetch('/api/github/issues', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          repo,
          breakout: ghBreakout,
          projectId,
          story: { id: story.id, storyNumber: story.storyNumber, title: story.title, description: story.description },
          acs,
        }),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || `HTTP ${res.status}`);
      // Persist settings
      try { localStorage.setItem('github:repo', repo); localStorage.setItem('github:breakout', ghBreakout ? '1' : '0'); } catch {}
      // Refresh links
      await loadGitHubLinksForStory(story);
      setGhPreview(null);
    } catch (e: any) {
      setDrawerError(e?.message || 'GitHub create failed');
    }
  }

  const handleEdit = (cellId: string, value: string) => {
    setEditingCell(cellId);
    setEditValue(value);
  };

  const saveEdit = async (field: string, storyId?: string, criteriaId?: string) => {
    try {
      if (field === "storyTitle" || field === "storyDescription" || field === "storyStatus" || field === "storyPriority" || field === "storyTestLink") {
        await fetch("/api/internal-projects/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            action: "update",
            story: {
              id: storyId,
              ...(field === "storyTitle" ? { title: editValue } :
                  field === "storyDescription" ? { description: editValue } :
                  field === "storyStatus" ? { status: editValue } :
                  field === "storyPriority" ? { priority: editValue } :
                  { testLink: editValue })
            }
          })
        });
      } else if (field === "criteriaDescription" || field === "criteriaStatus" || field === "criteriaTestLink") {
        await fetch("/api/internal-projects/stories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            storyId,
            action: "update",
            acceptanceCriteria: {
              id: criteriaId,
              ...(field === "criteriaDescription" ? { description: editValue } :
                field === "criteriaStatus" ? { status: editValue } : { testLink: editValue })
            }
          })
        });
      }
      
      setEditingCell(null);
      await fetchProject();
    } catch (error) {
      console.error("Failed to save edit:", error);
    }
  };

  const addUserStory = async () => {
    try {
      setError(null);
      const res = await fetch("/api/internal-projects/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "add",
          story: {
            title: "New User Story",
            description: "As a user, I want to...",
            status: "Not Started",
            priority: "Medium"
          }
        })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to add story');
      }
      await fetchProject();
    } catch (error) {
      console.error("Failed to add user story:", error);
      setError('Unable to add story. Please try again.');
    }
  };

  const addAcceptanceCriteria = async (storyId: string) => {
    try {
      await fetch("/api/internal-projects/stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          storyId,
          action: "add",
          acceptanceCriteria: {
            description: "Given..., When..., Then...",
            status: "Not Started"
          }
        })
      });
      await fetchProject();
    } catch (error) {
      console.error("Failed to add acceptance criteria:", error);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!confirm("Delete this user story and all its acceptance criteria?")) return;
    
    try {
      await fetch("/api/internal-projects/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "delete",
          story: { id: storyId }
        })
      });
      await fetchProject();
    } catch (error) {
      console.error("Failed to delete story:", error);
    }
  };

  const deleteCriteria = async (storyId: string, criteriaId: string) => {
    try {
      await fetch("/api/internal-projects/stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          storyId,
          action: "delete",
          acceptanceCriteria: { id: criteriaId }
        })
      });
      await fetchProject();
    } catch (error) {
      console.error("Failed to delete criteria:", error);
    }
  };

  const toggleStoryExpand = (storyNumber: number) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(storyNumber)) {
      newExpanded.delete(storyNumber);
    } else {
      newExpanded.add(storyNumber);
    }
    setExpandedStories(newExpanded);
  };

  const formatPriority = (priority: string) => priority;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div>Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  const filteredStories = project.userStories?.filter(story => {
    if (filter !== "all" && story.status !== filter) return false;
    if (priorityFilter !== "all" && story.priority !== priorityFilter) return false;
    if (releaseFilter === 'backlog' && (story as any).releaseId) return false;
    if (releaseFilter !== 'all' && releaseFilter !== 'backlog' && (story as any).releaseId !== releaseFilter) return false;
    return true;
  }) || [];

  const stats = {
    total: project.userStories?.length || 0,
    completed: project.userStories?.filter(s => s.status === "Completed").length || 0,
    inProgress: project.userStories?.filter(s => s.status === "In Progress").length || 0,
    notStarted: project.userStories?.filter(s => s.status === "Not Started").length || 0,
    totalACs: project.userStories?.reduce((sum, s) => sum + (s.acceptanceCriteria?.length || 0), 0) || 0,
    completedACs: project.userStories?.reduce((sum, s) => 
      sum + (s.acceptanceCriteria?.filter(ac => ac.status === "Completed").length || 0), 0) || 0,
  };

  const renderStoriesTable = (stories: UserStory[]) => (
    <div className="bg-neutral-900 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/70">
            <th className="p-2 text-left w-16">#</th>
            <th className="p-2 text-left">Story / Acceptance Criteria</th>
            <th className="p-2 text-left w-28">Status</th>
            <th className="p-2 text-left w-56">Test</th>
            <th className="p-2 text-left w-24">Priority</th>
            <th className="p-2 text-left w-40">Release</th>
            <th className="p-2 text-left w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((story) => (
            <React.Fragment key={story.storyNumber}>
              <tr className="border-b border-neutral-800 hover:bg-neutral-800/40" data-llm-id={`US${story.storyNumber}`}>
                <td className="p-2 font-mono text-xs cursor-pointer" data-llm-col="id" title="Open details" onClick={() => openDrawer(story)}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStoryExpand(story.storyNumber); }}
                    className="mr-1 text-neutral-500 hover:text-neutral-300"
                  >
                    {expandedStories.has(story.storyNumber) ? '-' : '+'}
                  </button>
                  US{story.storyNumber}
                </td>
                <td className="p-2 cursor-pointer" data-llm-col="title" onClick={() => openDrawer(story)}>
                  {editingCell === `story-${story.storyNumber}-title` ? (
                    <Input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit("storyTitle", `US${story.storyNumber}`)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit("storyTitle", `US${story.storyNumber}`)}
                      className="w-full"
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span onClick={() => handleEdit(`story-${story.storyNumber}-title`, story.title)} className="cursor-pointer hover:text-indigo-400 font-medium">
                        {story.title}
                      </span>
                      {!expandedStories.has(story.storyNumber) && story.acceptanceCriteria?.length > 0 && (
                        <span className="ml-2 text-xs text-neutral-500">({story.acceptanceCriteria.length} ACs)</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-2" data-llm-col="status">
                  {editingCell === `story-${story.storyNumber}-status` ? (
                    <Select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEdit("storyStatus", `US${story.storyNumber}`)} className="w-full" autoFocus>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                    </Select>
                  ) : (
                    <Badge
                      onClick={() => handleEdit(`story-${story.storyNumber}-status`, story.status)}
                      className="cursor-pointer"
                      variant={
                        story.status === 'Completed' ? 'success' :
                        story.status === 'In Progress' ? 'warning' :
                        story.status === 'In Review' ? 'default' : 'secondary'
                      }
                    >
                      {story.status}
                    </Badge>
                  )}
                </td>
                <td className="p-2" data-llm-col="test">
                  {editingCell === `story-${story.storyNumber}-testlink` ? (
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEdit("storyTestLink", `US${story.storyNumber}`)} onKeyDown={(e) => e.key === "Enter" && saveEdit("storyTestLink", `US${story.storyNumber}`)} className="bg-neutral-800 px-1 py-0.5 rounded w-full text-xs" placeholder="https://…" autoFocus />
                  ) : (
                    <span onClick={() => handleEdit(`story-${story.storyNumber}-testlink`, (story as any).testLink || "")} className="cursor-pointer text-xs text-neutral-300 hover:text-indigo-400">
                      {(story as any).testLink ? (
                        <a href={(story as any).testLink} target="_blank" rel="noreferrer" className="underline underline-offset-2">{getTestLabel((story as any).testLink)}</a>
                      ) : (
                        <span className="italic text-neutral-500">Add link</span>
                      )}
                    </span>
                  )}
                </td>
                <td className="p-2" data-llm-col="priority">
                  {editingCell === `story-${story.storyNumber}-priority` ? (
                    <Select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEdit("storyPriority", `US${story.storyNumber}`)} className="w-full" autoFocus>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Select>
                  ) : (
                    <span onClick={() => handleEdit(`story-${story.storyNumber}-priority`, story.priority)} className="cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300">{story.priority}</span>
                  )}
                </td>
                <td className="p-2" data-llm-col="release">
                  <Select
                    value={(story as any).releaseId || 'backlog'}
                    onChange={(e) => setStoryRelease(`US${story.storyNumber}`, e.target.value === 'backlog' ? null : e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="backlog">Backlog</option>
                    {releases.map((r) => (
                      <option key={r.id} value={r.id}>{`R${r.releaseNumber}: ${r.name}`}</option>
                    ))}
                  </Select>
                </td>
                <td className="p-2" data-llm-col="actions">
                  <button onClick={() => addAcceptanceCriteria(`US${story.storyNumber}`)} className="text-xs px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded mr-1">+AC</button>
                  <button onClick={() => deleteStory(`US${story.storyNumber}`)} className="text-xs px-2 py-0.5 bg-red-900 hover:bg-red-800 rounded text-red-200">Del</button>
                </td>
              </tr>
              {expandedStories.has(story.storyNumber) && story.acceptanceCriteria?.map((ac) => (
                <tr key={ac.criteriaNumber} className="border-b border-neutral-800/50 hover:bg-neutral-800/20" data-llm-id={`AC${ac.criteriaNumber}`}>
                  <td className="p-2 pl-8 font-mono text-xs text-neutral-500" data-llm-col="id">AC{ac.criteriaNumber}</td>
                  <td className="p-2 pl-8" data-llm-col="description">
                    {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-desc` ? (
                      <Input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEdit("criteriaDescription", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)} onKeyDown={(e) => e.key === "Enter" && saveEdit("criteriaDescription", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)} className="w-full text-sm" autoFocus />
                    ) : (
                      <span onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-desc`, ac.description)} className="cursor-pointer hover:text-indigo-400 text-sm text-neutral-300">{ac.description}</span>
                    )}
                  </td>
                  <td className="p-2" data-llm-col="status">
                    {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-status` ? (
                      <Select value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEdit("criteriaStatus", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)} className="w-full" autoFocus>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed</option>
                      </Select>
                    ) : (
                      <Badge
                        onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-status`, ac.status)}
                        className="cursor-pointer"
                        variant={
                          ac.status === 'Completed' ? 'success' :
                          ac.status === 'In Progress' ? 'warning' :
                          ac.status === 'In Review' ? 'default' : 'secondary'
                        }
                      >
                        {ac.status}
                      </Badge>
                    )}
                  </td>
                  <td className="p-2" colSpan={3} data-llm-col="testLink">
                    {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-testlink` ? (
                      <Input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveEdit("criteriaTestLink", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)} onKeyDown={(e) => e.key === "Enter" && saveEdit("criteriaTestLink", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)} className="w-full text-sm" autoFocus />
                    ) : (
                      (ac as any).testLink ? (
                        <a href={(ac as any).testLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-300 hover:text-indigo-200 underline">{getTestLabel((ac as any).testLink as string)}</a>
                      ) : (
                        <span onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-testlink`, (ac as any).testLink || "")} className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer">+ add test link</span>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-screen overflow-y-auto bg-neutral-950 text-neutral-200">
      <div className="max-w-[1800px] mx-auto p-4 pb-24">
        {/* Header */}
        <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <span
            data-testid="project-title-rename"
            className="flex items-center gap-2"
          >
            {renaming ? (
              <Input
                ref={renameInputRef}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => saveProjectName(nameDraft)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saveProjectName(nameDraft);
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setRenaming(false);
                    setRenameError(null);
                    setNameDraft(project?.name || '');
                  }
                }}
                disabled={savingName}
                className="h-9 w-72 max-w-full rounded-md border-neutral-700 bg-neutral-900/70 text-lg font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRenaming(true);
                  setRenameError(null);
                }}
                className="text-left text-2xl font-bold text-neutral-100 transition hover:text-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                {project.name}
              </button>
            )}
            {savingName && <span className="text-xs text-neutral-400">Saving…</span>}
          </span>
          <span className="text-lg font-normal text-neutral-500">— Dense View</span>
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setExpandedStories(new Set())}>Collapse All</Button>
        </div>
      </div>
      {renameError && (
        <div className="mb-3 text-sm text-rose-300" role="status">
          {renameError}
        </div>
      )}

          <div className="mb-6 rounded-xl border border-transparent bg-transparent p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
              <h2 className="text-sm font-medium text-neutral-200">About</h2>
                  <div className="inline-flex items-center gap-1 rounded-full border border-neutral-700/60 bg-neutral-900/60 p-1">
                    <Toggle
                      pressed={aboutMode === 'markdown'}
                      onPressedChange={() => setAboutMode('markdown')}
                      className="h-6 rounded-full px-2.5 text-[11px] transition data-[state=on]:bg-neutral-800 data-[state=on]:text-neutral-50"
                      data-testid="about-mode-markdown"
                    >
                      Markdown
                    </Toggle>
                    <Toggle
                      pressed={aboutMode === 'preview'}
                      onPressedChange={async () => {
                        if (aboutMode !== 'preview' && aboutMd !== (project?.about || '')) await saveAbout(aboutMd);
                        setAboutMode('preview');
                      }}
                      className="h-6 rounded-full px-2.5 text-[11px] transition data-[state=on]:bg-neutral-800 data-[state=on]:text-neutral-50"
                      data-testid="about-mode-preview"
                    >
                      Preview{aboutSaving ? '…' : ''}
                    </Toggle>
                  </div>
            </div>
            <div className="rounded-lg border border-transparent bg-neutral-950/40 transition focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/40 focus-within:bg-neutral-900">
              {aboutMode === 'markdown' ? (
                <ScrollArea data-testid="about-scroll" className="max-h-64 rounded-lg pr-2">
                  <CodeMirror
                    value={aboutMd || project.about}
                    height="auto"
                    theme={undefined}
                    basicSetup={{ lineNumbers: false, foldGutter: false }}
                    extensions={cmExtensions}
                    onChange={(v: string) => setAboutMd(v)}
                    onBlur={() => { if (aboutMd !== (project?.about || '')) saveAbout(aboutMd); }}
                  />
                </ScrollArea>
              ) : (
                <ScrollArea data-testid="about-scroll" className="max-h-64 rounded-lg pr-2">
                      <div
                        className="space-y-4 p-3 text-sm leading-6 text-neutral-200"
                        dangerouslySetInnerHTML={{ __html: md.render(aboutMd || project.about || "") }}
                      />
                </ScrollArea>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded bg-red-900/40 text-red-200 border border-red-800 text-sm">
              {error}
            </div>
          )}
          
          {/* Stats Bar */}
          <div className="flex gap-4 text-sm mt-4">
            <span>Stories: {stats.total}</span>
            <span className="text-green-400">Completed: {stats.completed}</span>
            <span className="text-yellow-400">In Progress: {stats.inProgress}</span>
            <span className="text-neutral-400">Not Started: {stats.notStarted}</span>
            <span className="ml-4">ACs: {stats.completedACs}/{stats.totalACs}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1"
          >
            <option value="all">All status</option>
            <option value="Not Started">Not started</option>
            <option value="In Progress">In progress</option>
            <option value="In Review">In review</option>
            <option value="Completed">Completed</option>
          </Select>

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2 py-1"
          >
            <option value="all">All priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>

          <Select
            value={releaseFilter}
            onChange={(e) => setReleaseFilter(e.target.value)}
            className="px-2 py-1"
          >
            <option value="all">All Releases</option>
            <option value="backlog">Backlog</option>
            {releases.map((r) => (
              <option key={r.id} value={r.id}>{`R${r.releaseNumber}: ${r.name}`}</option>
            ))}
          </Select>

          <button
            onClick={() => setGroupByRelease((v) => !v)}
            className={`px-3 py-1 rounded text-sm border ${groupByRelease ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200' : 'border-white/10 bg-neutral-900'}`}
            title="Group stories by release"
          >
            {groupByRelease ? 'Grouped by Release' : 'Flat List'}
          </button>

          <button
            onClick={() => {
              if (expandedStories.size === filteredStories.length) {
                setExpandedStories(new Set());
              } else {
                setExpandedStories(new Set(filteredStories.map(s => s.storyNumber)));
              }
            }}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
          >
            {expandedStories.size === filteredStories.length ? "Collapse All" : "Expand All"}
          </button>

              <button
                onClick={addRelease}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-sm text-white"
              >
                + Release
              </button>
              <Button
                variant="default"
                size="sm"
                onClick={addUserStory}
                data-testid="requirements-add-story"
              >
                Add Story
              </Button>
            </div>

        {/* Dense Table */}
        {!groupByRelease && (
        <div className="bg-neutral-900 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/70">
                <th className="p-2 text-left w-16">#</th>
                <th className="p-2 text-left">Story / Acceptance Criteria</th>
                <th className="p-2 text-left w-28">Status</th>
                <th className="p-2 text-left w-56">Test</th>
                <th className="p-2 text-left w-24">Priority</th>
                <th className="p-2 text-left w-40">Release</th>
                <th className="p-2 text-left w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStories.map((story) => (
                <React.Fragment key={story.storyNumber}>
                  <tr className="border-b border-neutral-800 hover:bg-neutral-800/40" data-llm-id={`US${story.storyNumber}`}>
                  <td className="p-2 font-mono text-xs cursor-pointer" data-llm-col="id" title="Open details" onClick={() => openDrawer(story)}>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleStoryExpand(story.storyNumber); }}
                        className="mr-1 text-neutral-500 hover:text-neutral-300"
                      >
                        {expandedStories.has(story.storyNumber) ? "-" : "+"}
                      </button>
                      US{story.storyNumber}
                  </td>
                    
                    <td className="p-2 cursor-pointer" data-llm-col="title" onClick={() => openDrawer(story)}>
                      {editingCell === `story-${story.storyNumber}-title` ? (
                        <Input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyTitle", `US${story.storyNumber}`)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit("storyTitle", `US${story.storyNumber}`)}
                          className="w-full"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <span 
                            onClick={() => handleEdit(`story-${story.storyNumber}-title`, story.title)}
                            className="cursor-pointer hover:text-indigo-400 font-medium"
                          >
                            {story.title}
                          </span>
                          {!expandedStories.has(story.storyNumber) && story.acceptanceCriteria?.length > 0 && (
                            <span className="ml-2 text-xs text-neutral-500">
                              ({story.acceptanceCriteria.length} ACs)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="p-2" data-llm-col="status">
                      {editingCell === `story-${story.storyNumber}-status` ? (
                        <Select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyStatus", `US${story.storyNumber}`)}
                          className="w-full"
                          autoFocus
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
                        </Select>
                      ) : (
                        <Badge
                          onClick={() => handleEdit(`story-${story.storyNumber}-status`, story.status)}
                          className="cursor-pointer"
                          variant={
                            story.status === 'Completed' ? 'success' :
                            story.status === 'In Progress' ? 'warning' :
                            story.status === 'In Review' ? 'default' : 'secondary'
                          }
                        >
                          {story.status}
                        </Badge>
                      )}
                    </td>
                    {/* Test link column */}
                    <td className="p-2" data-llm-col="test">
                      {editingCell === `story-${story.storyNumber}-testlink` ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyTestLink", `US${story.storyNumber}`)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit("storyTestLink", `US${story.storyNumber}`)}
                          className="bg-neutral-800 px-1 py-0.5 rounded w-full text-xs"
                          placeholder="https://…"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => handleEdit(`story-${story.storyNumber}-testlink`, (story as any).testLink || "")}
                          className="cursor-pointer text-xs text-neutral-300 hover:text-indigo-400"
                        >
                          {(story as any).testLink ? (
                            <a href={(story as any).testLink} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                              {getTestLabel((story as any).testLink)}
                            </a>
                          ) : (
                            <span className="italic text-neutral-500">Add link</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="p-2" data-llm-col="priority">
                      {editingCell === `story-${story.storyNumber}-priority` ? (
                        <Select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyPriority", `US${story.storyNumber}`)}
                          className="w-full"
                          autoFocus
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </Select>
                      ) : (
                        <span onClick={() => handleEdit(`story-${story.storyNumber}-priority`, story.priority)} className="cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300">
                          {formatPriority(story.priority)}
                        </span>
                      )}
                    </td>
                    {/* Release assignment */}
                    <td className="p-2" data-llm-col="release">
                      <Select
                        value={(story as any).releaseId || 'backlog'}
                        onChange={(e) => setStoryRelease(`US${story.storyNumber}`, e.target.value === 'backlog' ? null : e.target.value)}
                        className="w-full text-xs"
                      >
                        <option value="backlog">Backlog</option>
                        {releases.map((r) => (
                          <option key={r.id} value={r.id}>{`R${r.releaseNumber}: ${r.name}`}</option>
                        ))}
                      </Select>
                    </td>
                    <td className="p-2" data-llm-col="actions">
                      <button
                        onClick={() => addAcceptanceCriteria(`US${story.storyNumber}`)}
                        className="text-xs px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded mr-1"
                      >
                        +AC
                      </button>
                      <button
                        onClick={() => deleteStory(`US${story.storyNumber}`)}
                        className="text-xs px-2 py-0.5 bg-red-900 hover:bg-red-800 rounded text-red-200"
                      >
                        Del
                      </button>
                      {/* Jira actions */}
                      <span className="inline-flex items-center gap-1 ml-2">
                        {jiraMap[story.id]?.key ? (
                          <>
                            <a
                              className="text-xs text-indigo-300 hover:underline"
                              href={(process.env.NEXT_PUBLIC_JIRA_BASE_URL ? String(process.env.NEXT_PUBLIC_JIRA_BASE_URL).replace(/\/$/, '') : '') + (jiraMap[story.id]?.key ? `/browse/${jiraMap[story.id]!.key}` : '')}
                              target="_blank"
                              rel="noreferrer"
                              title={jiraMap[story.id]?.lastStatus || ''}
                            >
                              {jiraMap[story.id]?.key}
                            </a>
                            <button
                              className="text-xs px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded"
                              onClick={() => refreshJiraMap(story)}
                              title="Refresh Jira mapping"
                            >
                              ↻
                            </button>
                          </>
                        ) : (
                          <button
                            className="text-xs px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50"
                            disabled={!!jiraMap[story.id]?.loading}
                            onClick={() => syncStoryToJira(story)}
                            title={jiraMap[story.id]?.error || 'Sync to Jira'}
                          >
                            {jiraMap[story.id]?.loading ? 'Syncing…' : 'Sync Jira'}
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                  
                  {/* Acceptance Criteria */}
                  {expandedStories.has(story.storyNumber) && story.acceptanceCriteria?.map((ac) => (
                    <tr key={ac.criteriaNumber} className="border-b border-neutral-800/50 hover:bg-neutral-800/20" data-llm-id={`AC${ac.criteriaNumber}`}>
                      <td className="p-2 pl-8 font-mono text-xs text-neutral-500" data-llm-col="id">
                        AC{ac.criteriaNumber}
                      </td>
                      <td className="p-2 pl-8" data-llm-col="description">
                        {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-desc` ? (
                          <Input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit("criteriaDescription", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit("criteriaDescription", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            className="w-full text-sm"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-desc`, ac.description)}
                            className="cursor-pointer hover:text-indigo-400 text-sm text-neutral-300"
                          >
                            {ac.description}
                          </span>
                        )}
                      </td>
                      <td className="p-2" data-llm-col="status">
                        {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-status` ? (
                          <Select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit("criteriaStatus", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            className="w-full"
                            autoFocus
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                            <option value="Completed">Completed</option>
                          </Select>
                        ) : (
                          <Badge
                            onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-status`, ac.status)}
                            className="cursor-pointer"
                            variant={
                              ac.status === 'Completed' ? 'success' :
                              ac.status === 'In Progress' ? 'warning' :
                              ac.status === 'In Review' ? 'default' : 'secondary'
                            }
                          >
                            {ac.status}
                          </Badge>
                        )}
                      </td>
                      <td className="p-2" data-llm-col="testLink">
                        {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-testlink` ? (
                          <Input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit("criteriaTestLink", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit("criteriaTestLink", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            className="w-full text-sm"
                            autoFocus
                          />
                        ) : (
                          ac.testLink ? (
                            <a
                              href={ac.testLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-indigo-300 hover:text-indigo-200 underline"
                            >
                              {getTestLabel(ac.testLink)}
                            </a>
                          ) : (
                            <span
                              onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-testlink`, ac.testLink || "")}
                              className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
                            >
                              + add test link
                            </span>
                          )
                        )}
                      </td>
                      <td className="p-2"></td>
                      <td className="p-2" data-llm-col="actions">
                        <button
                          onClick={() => deleteCriteria(`US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                          className="text-xs px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {filteredStories.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No user stories found. Click &quot;Add Story&quot; to create one.
            </div>
          )}
        </div>
        )}

        {groupByRelease && (
          <div className="grid gap-6">
            <div className="bg-neutral-900 rounded border border-neutral-800">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <div className="font-semibold">Backlog</div>
                <div className="text-xs text-neutral-400">{project.userStories?.filter((s:any)=>!s.releaseId).length || 0} stories</div>
              </div>
              <div className="p-2">
                {renderStoriesTable(filteredStories.filter((s:any)=>!s.releaseId))}
              </div>
            </div>

            {releases.map((r) => {
              const rStories = filteredStories.filter((s:any)=>s.releaseId === r.id);
              const storyCount = rStories.length;
              const acTotal = rStories.reduce((sum, s:any)=> sum + (s.acceptanceCriteria?.length || 0), 0);
              const acDone = rStories.reduce((sum, s:any)=> sum + (s.acceptanceCriteria?.filter((a:any)=>a.status==='Completed').length || 0), 0);
              const about = (r as any).about || '';
              const isEditing = editingReleaseId === r.id;
              return (
                <div key={r.id} className="bg-neutral-900 rounded border border-neutral-800">
                  <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">R{r.releaseNumber}: {r.name}</div>
                      <Badge
                        variant={
                          r.status === 'Completed' ? 'success' :
                          r.status === 'In Progress' ? 'warning' :
                          r.status === 'In Review' ? 'default' : 'secondary'
                        }
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-neutral-400">{storyCount} stories • {acDone}/{acTotal} ACs</div>
                  </div>
                  <div className="px-4 py-3 border-b border-neutral-800">
                    {!isEditing ? (
                      <div>
                        {about ? (
                              <div className="prose prose-invert prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: md.render(about || "") }} />
                          </div>
                        ) : (
                          <div className="text-neutral-500 text-sm">No About yet. Add context for this release.</div>
                        )}
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={()=>{ setEditingReleaseId(r.id); setReleaseAboutDraft(about || ''); }}>Edit</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Textarea rows={6} value={releaseAboutDraft} onChange={(e)=>setReleaseAboutDraft(e.target.value)} placeholder="Write release About (Markdown supported)" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={()=>saveReleaseAbout(r.id, releaseAboutDraft)}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={()=>setEditingReleaseId(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    {renderStoriesTable(rStories)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Add Section */}
        <div className="mt-4 text-xs text-neutral-500">
          Tip: Click on any text to edit inline. Press Enter to save, Escape to cancel.
        </div>

        {/* Right-side Drawer + overlay */}
        {drawerOpen && drawerStory && (
          <>
            <div className="fixed inset-0 bg-black/30" style={{ zIndex: 39 }} onClick={(e)=>{ e.stopPropagation(); closeDrawer(); }} />
            <div className="fixed top-0 right-0 h-full bg-neutral-950/95 border-l border-white/10 shadow-lg" style={{ width: 420, zIndex: 40 }}>
              <div className="relative p-3 border-b border-white/10">
                <div className="text-sm text-neutral-300 pr-10">Tracking Details — US{drawerStory.storyNumber}</div>
                <button aria-label="Close drawer" className="absolute top-2 right-2 px-2 py-1 border border-white/10 rounded" onClick={(e)=>{ e.stopPropagation(); closeDrawer(); }}>×</button>
              </div>
              <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
                <button className={`px-2 py-1 text-xs rounded ${drawerTab==='overview'?'bg-white/10':''}`} onClick={()=>setDrawerTab('overview')}>Overview</button>
                <button className={`px-2 py-1 text-xs rounded ${drawerTab==='jira'?'bg-white/10':''}`} onClick={()=>setDrawerTab('jira')}>Jira</button>
                <button className={`px-2 py-1 text-xs rounded ${drawerTab==='github'?'bg-white/10':''}`} onClick={()=>setDrawerTab('github')}>GitHub</button>
                <button className={`px-2 py-1 text-xs rounded ${drawerTab==='timeline'?'bg-white/10':''}`} onClick={()=>setDrawerTab('timeline')}>Timeline</button>
                <button className={`px-2 py-1 text-xs rounded ${drawerTab==='audit'?'bg-white/10':''}`} onClick={()=>setDrawerTab('audit')}>Audit</button>
                <button className={`px-2 py-1 text-xs rounded ${drawerTab==='actions'?'bg-white/10':''}`} onClick={()=>setDrawerTab('actions')}>Actions</button>
              </div>
              {drawerLoading && <div className="p-3 text-sm">Loading…</div>}
              {drawerError && <div className="p-3 text-sm text-rose-400">{drawerError}</div>}
              {!drawerLoading && !drawerError && (
                <div className="p-3 text-sm overflow-auto" style={{ maxHeight: 'calc(100vh - 90px)' }}>
                  {drawerTab === 'overview' && (
                    <div className="grid gap-3">
                      <div>
                        <div className="text-xs text-neutral-400 mb-1">Speqq Status</div>
                        <div>{drawerStory.status}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 mb-1">Jira</div>
                      {jiraMap[drawerStory.id]?.key ? (
                        <div>
                          <div>Key: {jiraMap[drawerStory.id]?.key}</div>
                          {jiraMap[drawerStory.id]?.lastStatus && <div>Status: {jiraMap[drawerStory.id]?.lastStatus}</div>}
                        </div>
                      ) : (
                        <div className="text-neutral-500">Not Synced</div>
                      )}
                    </div>
                  </div>
                )}
                {drawerTab === 'jira' && (
                  <div className="grid gap-3">
                    {!jiraMap[drawerStory.id]?.key && (
                      <div className="text-neutral-500">Not synced to Jira. Use Actions → Sync to Jira.</div>
                    )}
                    {jiraMap[drawerStory.id]?.key && jiraDetails && (
                      <div className="grid gap-2">
                        {jiraDetails.hasConflict && (
                          <div className="px-2 py-1 rounded border border-rose-500/40 text-rose-300">Conflict detected — Jira updated since last sync.</div>
                        )}
                        <div><strong>Key:</strong> {jiraDetails.key}</div>
                        {jiraDetails.jira && (
                          <>
                            <div><strong>Summary:</strong> {jiraDetails.jira.summary}</div>
                            <div><strong>Status:</strong> {jiraDetails.jira.status}</div>
                            <div><strong>Assignee:</strong> {jiraDetails.jira.assignee || 'Unassigned'}</div>
                            <div><strong>Labels:</strong> {(jiraDetails.jira.labels || []).join(', ') || '—'}</div>
                            <div><strong>Description:</strong> {jiraDetails.jira.descriptionText || '—'}</div>
                          </>
                        )}
                        {!jiraDetails.jira && <div className="text-neutral-500">Jira details unavailable</div>}
                      </div>
                    )}
                  </div>
                )}
                {drawerTab === 'github' && (
                  <div className="grid gap-3">
                    <div className="grid gap-1">
                      <div className="text-xs text-neutral-400">Repository</div>
                      <input value={ghRepo} onChange={(e)=>setGhRepo(e.target.value)} placeholder={ghDefaultRepo || 'owner/repo'} className="bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                      <label className="text-xs text-neutral-400 inline-flex items-center gap-2"><input type="checkbox" checked={ghBreakout} onChange={(e)=>setGhBreakout(e.target.checked)} /> Break out ACs into separate issues</label>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <button className="px-2 py-1 rounded bg-neutral-800 text-xs" onClick={()=> setGhPreview(buildIssuePreviewForStory(drawerStory!)) }>Preview</button>
                      <button className="px-2 py-1 rounded bg-indigo-600 text-white text-xs" onClick={()=> pushToGitHub(drawerStory!) }>Push to GitHub</button>
                    </div>
                    {ghPreview && (
                      <div className="border border-white/10 rounded p-2">
                        <div className="text-xs text-neutral-400 mb-1">Preview ({ghPreview.items.length} issue{ghPreview.items.length>1?'s':''})</div>
                        <div className="grid gap-2">
                          {ghPreview.items.map((it, idx) => (
                            <div key={idx} className="border border-white/10 rounded p-2">
                              <div className="font-medium">{it.title}</div>
                              <div className="text-xs text-neutral-400">Labels: {it.labels.join(', ')}</div>
                              <pre className="text-xs mt-1 whitespace-pre-wrap">{it.body}</pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-neutral-400 mb-1">Created Issues</div>
                      {ghLinks.length === 0 && <div className="text-neutral-500">None yet</div>}
                      {ghLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ghLinks.map((l, i) => (
                            <a key={`${l.repo}#${l.number}-${i}`} className="px-2 py-0.5 rounded border border-white/10 text-xs text-indigo-300 hover:underline" href={`https://github.com/${l.repo}/issues/${l.number}`} target="_blank" rel="noreferrer">{l.repo}#{l.number}</a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 mb-1">Pull Requests</div>
                      {ghPrs.length === 0 && <div className="text-neutral-500">No PRs linked</div>}
                      {ghPrs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {ghPrs.map((p, i) => (
                            <a key={`${p.repo}#${p.number}-${i}`} className="px-2 py-0.5 rounded border border-white/10 text-xs hover:underline" href={p.url} target="_blank" rel="noreferrer">
                              <span className="text-indigo-300">{p.repo}#{p.number}</span>
                              <span className={`ml-1 px-1 rounded ${p.status==='merged'?'bg-emerald-600/20 text-emerald-300': p.status==='open'?'bg-amber-600/20 text-amber-300':'bg-neutral-600/20 text-neutral-300'}`}>{p.status}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {drawerTab === 'timeline' && (
                  <div className="grid gap-3">
                    {ghTimeline.length === 0 && auditItems.length === 0 && <div className="text-neutral-500">No events.</div>}
                    {ghTimeline.length > 0 && <Timeline events={ghTimeline} />}
                    {auditItems.length > 0 && (
                      <div>
                        <div className="text-xs text-neutral-400 mb-1">Jira Activity</div>
                        <div className="grid gap-2">
                          {auditItems.map((a) => (
                            <div key={a.id} className="border border-white/10 rounded p-2">
                              <div className="text-xs text-neutral-400">{a.createdAt}</div>
                              <div>{a.source} — {a.status} {a.jiraKey ? `(${a.jiraKey})` : ''}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {drawerTab === 'audit' && (
                  <div className="grid gap-2">
                    {auditItems.length === 0 && <div className="text-neutral-500">No audit entries.</div>}
                    {auditItems.map((a) => (
                      <div key={a.id} className="text-xs">
                        <div><span>{a.createdAt}</span> — <span>{a.source}</span> / <span>{a.status}</span></div>
                        {Array.isArray(a?.diff?.changes) && a.diff.changes.length > 0 && (
                          <ul className="ml-3 list-disc">
                            {a.diff.changes.map((c: any, idx: number) => (
                              <li key={idx}>{c.field}: {String(c.from)} → {String(c.to)}{c.skipped ? ` (skipped: ${c.skipped})` : ''}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {drawerTab === 'actions' && (
                  <div className="grid gap-2">
                    {!jiraMap[drawerStory.id]?.key ? (
                      <button className="px-2 py-1 rounded bg-indigo-600 text-white text-xs" onClick={()=>syncStoryToJira(drawerStory)}>Sync to Jira</button>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <button className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>loadJiraForStory(drawerStory)}>Refresh Jira</button>
                        <a className="px-2 py-1 rounded border border-white/10 text-xs" href={(process.env.NEXT_PUBLIC_JIRA_BASE_URL ? String(process.env.NEXT_PUBLIC_JIRA_BASE_URL).replace(/\/$/, '') : '') + `/browse/${jiraMap[drawerStory.id]!.key}` } target="_blank" rel="noreferrer">Open in Jira</a>
                      </div>
                    )}
                  </div>
                )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
