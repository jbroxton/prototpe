"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PRDEditor } from "../components/PRDEditor";
import { TabsBar } from "../components/TabsBar";
import { TestPrdSidebar } from "../components/test-prd/Sidebar";

type RowType = "epic" | "story" | "ac";
type LifecycleType = 'created' | 'pr_open' | 'pr_merged' | 'deployed' | 'metrics';
type LifecycleEvent = {
  type: LifecycleType;
  at: number; // timestamp
  prNumber?: number;
  prUrl?: string;
  mergedBy?: string;
  deployId?: string;
  environment?: string;
  errorRate?: string;
};
type Row = {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  sprint?: "M1" | "M2" | "M3" | undefined;
  release?: "R1.0" | "R1.1" | "R2.0" | undefined;
  platform?: "iOS" | "Android" | "Web" | undefined;
  referenced?: boolean; // added from Library
  // Drawer fields (mock Jira sync)
  description?: string;
  acList?: string[];
  labels?: string[];
  components?: string[];
  points?: number;
  assignee?: string;
  epicLink?: string;
  jiraProject?: string;
  issueType?: string; // Story/Bug/Task
  dependencies?: string[];
  syncStatus?: "in-sync" | "drift";
  changeLog?: string[];
  // Lifecycle + timestamps
  createdAt?: number;
  updatedAt?: number;
  lifecycle?: LifecycleEvent[];
  level: number; // 0 epic, 1 story, 2 ac
  type: RowType;
};

const now = Date.now();
const seed: Row[] = [
  { id: "EP_001", title: "Authentication & Account Management", level: 0, type: "epic" },
  // US_001 — fully deployed
  { id: "US_001", title: "As a returning user, I can sign in with email and password and stay signed in for 30 days so I don't re‑authenticate every visit", status: "In Dev", priority: "P1", level: 1, type: "story", createdAt: now - 1000*60*60*8, updatedAt: now - 1000*60*30,
    lifecycle: [
      { type:'created', at: now - 1000*60*60*8 },
      { type:'pr_open', at: now - 1000*60*60*7, prNumber: 4, prUrl: 'https://github.com/org/repo/pull/4' },
      { type:'pr_merged', at: now - 1000*60*60*4, mergedBy: '@john' },
      { type:'deployed', at: now - 1000*60*60*3, deployId: '2968618434', environment: 'Production' },
      { type:'metrics', at: now - 1000*60*60*2, errorRate: '0%' },
    ] },
  { id: "AC_001A", title: "Email + password form validates inline, keyboard navigable, and announces errors to screen readers", level: 2, type: "ac" },
  { id: "AC_001B", title: "Remember me rotates refresh token and persists session for 30 days across devices", level: 2, type: "ac" },
  // US_002 — PR merged, awaiting deploy
  { id: "US_002", title: "Guest can pay with a credit card securely and receives clear, actionable error messages on failure", status: "Draft", priority: "P0", level: 1, type: "story", createdAt: now - 1000*60*60*10, updatedAt: now - 1000*60*50,
    lifecycle: [
      { type:'created', at: now - 1000*60*60*10 },
      { type:'pr_open', at: now - 1000*60*60*9, prNumber: 12, prUrl: 'https://github.com/org/repo/pull/12' },
      { type:'pr_merged', at: now - 1000*60*60*5, mergedBy: '@sara' },
    ] },
  { id: "AC_003", title: "Valid Visa/Mastercard completes < 2s with optimistic UI and receipt id stored", level: 2, type: "ac" },
  { id: "AC_003A", title: "Card declines render non‑blocking banner with issuer message and retry affordance", level: 2, type: "ac" },
  // US_003 — PR open
  { id: "US_003", title: "As a logged‑in user, I can view my last 12 months of orders with basic search and CSV export", status: "In Review", priority: "P2", level: 1, type: "story", createdAt: now - 1000*60*60*6, updatedAt: now - 1000*60*45,
    lifecycle: [
      { type:'created', at: now - 1000*60*60*6 },
      { type:'pr_open', at: now - 1000*60*60*1, prNumber: 18, prUrl: 'https://github.com/org/repo/pull/18' },
    ] },
  { id: "AC_004A", title: "List view shows date, items, total, status; supports keyboard navigation and focus ring", level: 2, type: "ac" },
  { id: "AC_004B", title: "Download receipt as PDF or CSV with correct tax lines and order id", level: 2, type: "ac" },
  // US_004 — just created
  { id: "US_004", title: "User can update profile photo, display name and notification preferences with instant feedback", status: "Draft", priority: "P3", level: 1, type: "story", createdAt: now - 1000*60*20, updatedAt: now - 1000*60*20,
    lifecycle: [ { type:'created', at: now - 1000*60*20 } ] },
  { id: "AC_005A", title: "Upload new avatar (PNG/JPG ≤ 4MB), crop square preview, and persist to CDN", level: 2, type: "ac" },
];

const mockLibrary50 = Array.from({ length: 60 }).map((_, i) => ({
  id: `LIB_${String(i + 1).padStart(3, "0")}`,
  title: [
    "Login refresh token rotation",
    "Session timeout UX polish",
    "Profile avatar upload",
    "Forgot password email copy",
    "Two‑factor setup for mobile",
    "Notifications preferences page",
    "Billing invoices export",
    "Payment method selector",
    "Search: fuzzy matching",
    "Admin: user impersonation",
  ][i % 10] + ` #${i + 1}`,
}));

function nextId(prefix: string, existing: string[]) {
  let n = 1;
  while (existing.includes(`${prefix}_${String(n).padStart(3, "0")}`)) n++;
  return `${prefix}_${String(n).padStart(3, "0")}`;
}

type TabKey = "active" | "backlog" | "archive";
type ReleaseKey = "R1.0" | "R1.1" | "R2.0";

// Mock commenting system types
type Comment = {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  selectedText: string;
  range?: { start: number; end: number };
  replies?: { id: string; text: string; author: string; timestamp: number }[];
  rectsRel: { top: number; left: number; width: number; height: number }[];
  resolved?: boolean;
};

export default function UserStoryTreeTable() {
  // Header state
  const [documentTitle, setDocumentTitle] = useState("Product Manager Study #1");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // Library + tabs state
  const [library] = useState(mockLibrary50);
  const [tab, setTab] = useState<TabKey>("active");
  const [active, setActive] = useState<Row[]>(() => seed.map(r => r.id==='US_001' ? { ...r, release: 'R1.0' } : r.id==='US_002' ? { ...r, release: 'R1.1' } : r));
  const [backlog, setBacklog] = useState<Row[]>([]);
  const [archive] = useState<Row[]>([]);
  const [view, setView] = useState<"table"|"release">("table");
  const [instances, setInstances] = useState<Record<string, ReleaseKey[]>>({ US_001: ['R2.0'] });
  const [releaseOverrides, setReleaseOverrides] = useState<Record<string, Partial<Record<ReleaseKey, { id: string; title: string }[]>>>>({
    US_001: {
      'R2.0': [
        { id: 'AC_001A', title: 'Can login with email (SSO only)' },
        { id: 'AC_001C', title: 'Remember me persists 30 days' },
      ],
    }
  });
  const [compare, setCompare] = useState(false);

  // UI state
  const [message, setMessage] = useState<string>("Drag from Library → Active; right‑click rows for actions.");
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [contextAt, setContextAt] = useState<{ x: number; y: number; ids: string[] } | null>(null);
  const [splitOpen, setSplitOpen] = useState<{ rowId: string; mode: "ac" | "platform" } | null>(null);
  const [drag, setDrag] = useState<{ id: string; title: string; x: number; y: number } | null>(null);
  const [detailsIds, setDetailsIds] = useState<string[] | null>(null);
  const [detailsTab, setDetailsTab] = useState<'properties'|'lifecycle'|'history'>('properties');
  const [showFieldMap, setShowFieldMap] = useState(false);
  const [libOpen, setLibOpen] = useState(true);
  const [editorText, setEditorText] = useState<string>(
    `# Add-on Recommendations\n\n## Overview\nBoost average order value (AOV) and delight guests with relevant, low‑friction add‑ons during the order journey. Keep the experience fast and respectful (no spammy dialogs).\n\n- Goal: +3–5% AOV on mobile within 6 weeks.\n- Positioning: Lightweight, contextual suggestions that feel like a barista's helpful nudge.\n- Surfaces: Order Summary, Item Details, Checkout (fallback).\n- Constraints: keep total decision time < **2s**; never block payment; fully accessible.\n\n## Users\nPrimary: Returning buyers placing coffee on their commute.\nSecondary: New buyers browsing seasonal or featured items.\n\n- Needs: fast checkout, relevant pairings (pastry, alt milk, extra shot).\n- Pain points: too many choices; add‑ons easy to miss; interruptions feel pushy.\n- JTBD: "When I order a latte, help me quickly add what I usually enjoy."\n\n## Solution\nContextual, inline suggestions the guest can accept in one tap with instant total update.\n\n\u0060\u0060\u0060flow title=Recommendations user flow\n\u0060\u0060\u0060\n\n### Entry Points\n1) **Order Summary** — up to 2 inline suggestions beneath the cart list.\n2) **Item Details** — during customization, surface a relevant booster (e.g., extra shot).\n3) **Checkout (fallback)** — one dismissible banner if nothing shown earlier.\n\n### Ranking Inputs\n- Item pairings (espresso → croissant), time of day, guest history (repeat), seasonal, inventory.\n- Business rules: cap to **2 suggestions per session**; suppress after dismiss.\n\n### States\n- **Default**: Two compact cards (image/name/price) with one‑tap "Add".\n- **Added**: Toast "Added to order" and instant total update.\n- **Empty**: No container if confidence < threshold.\n- **Dismissed**: Do not re‑show in session.\n\n### Performance & Accessibility\n- TTI for suggestions < **400ms** after page load; tap‑to‑add total update < **100ms**.\n- Keyboard reachable, focus ring, screen‑reader labels.\n`
  );
  // Toolbar state
  const [search, setSearch] = useState("");
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showView, setShowView] = useState(false);
  const [sortKey, setSortKey] = useState<'priority'|'status'|'created'|'updated'|'none'>('none');
  const statusOrder = ['Draft','In Dev','In Review','Deployed'];
  const priorityOrder = ['P0','P1','P2','P3'];
  type FilterState = { status:Set<string>; priority:Set<string>; sprint:Set<string> };
  const [filters, setFilters] = useState<FilterState>({ status:new Set(), priority:new Set(), sprint:new Set() });
  const [draftFilters, setDraftFilters] = useState<FilterState>({ status:new Set(), priority:new Set(), sprint:new Set() });
  // Tree expansion state (default expanded for sample stories)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['US_001','US_002','US_003']));
  function toggleExpanded(id: string) {
    setExpandedRows(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  // Approval workflow state
  const [approvalStatus, setApprovalStatus] = useState<'draft'|'in_review'|'approved'|'rejected'>('draft');
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalSel, setApprovalSel] = useState<Set<number>>(new Set());
  const [approvalNote, setApprovalNote] = useState('');
  const [apprSearch, setApprSearch] = useState('');
  const [apprTab, setApprTab] = useState<'people'|'teams'>('people');

  // Commenting system state (mock)
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [commentMenu, setCommentMenu] = useState<{
    x: number; y: number;
    selection: { text: string; rects: { top:number; left:number; width:number; height:number }[] };
  } | null>(null);
  const [commentDraft, setCommentDraft] = useState<{
    top: number;
    rectsRel: { top:number; left:number; width:number; height:number }[];
    selectedText: string;
    text: string;
  } | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<{ id: string; text: string } | null>(null);

  // Jira connect modal state
  const [connectOpen, setConnectOpen] = useState(false);
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [connectStatus, setConnectStatus] = useState<"idle"|"testing"|"ok"|"error">("idle");
  const [connectError, setConnectError] = useState<string>("");

  // Simple XOR + base64 obfuscation for localStorage (MVP only)
  function xorEncrypt(plain: string, key: string) {
    const data = Array.from(plain).map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
    return typeof btoa !== 'undefined' ? btoa(data) : data;
  }
  function xorDecrypt(encoded: string, key: string) {
    try {
      const bin = typeof atob !== 'undefined' ? atob(encoded) : encoded;
      return Array.from(bin).map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
    } catch {
      return "";
    }
  }
  const STORAGE_KEY = 'jira:creds';
  const STORAGE_SECRET = 'speqq-local-1';
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const json = xorDecrypt(raw, STORAGE_SECRET);
        const saved = JSON.parse(json);
        if (saved?.url) setJiraUrl(saved.url);
        if (saved?.email) setJiraEmail(saved.email);
      }
    } catch {}
  }, []);
  async function testAndSaveConnection() {
    setConnectStatus('testing');
    setConnectError("");
    try {
      const res = await fetch('/api/jira/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jiraUrl, email: jiraEmail, apiToken: jiraToken }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Connect failed');
      try {
        const payload = JSON.stringify({ url: jiraUrl, email: jiraEmail, apiToken: jiraToken });
        const enc = xorEncrypt(payload, STORAGE_SECRET);
        localStorage.setItem(STORAGE_KEY, enc);
      } catch {}
      setConnectStatus('ok');
    } catch (e: any) {
      setConnectError(e?.message || 'Failed to connect');
      setConnectStatus('error');
    }
  }

  // Helpers to read/update current tab list
  const current = tab === "active" ? active : tab === "backlog" ? backlog : archive;
  const setCurrent = (fn: (prev: Row[]) => Row[]) => {
    if (tab === "active") setActive(fn);
    else if (tab === "backlog") setBacklog(fn);
    // archive is placeholder; do nothing for now
  };

  // Version control (UX only)
  const [versions, setVersions] = useState<string[]>(['v1.4','v1.3','v1.2']);
  const [currentVersion, setCurrentVersion] = useState<string>('v1.4');
  const versionBadgeRef = useRef<HTMLSpanElement | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsRailOpen, setVersionsRailOpen] = useState(false);
  const [versionsPos, setVersionsPos] = useState<{ top:number; left:number; width:number }>({ top: 0, left: 0, width: 280 });

  function updateRowById(id: string, patch: Partial<Row>) {
    setCurrent(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRowBelowById(anchorId: string, row: Row) {
    setCurrent(prev => {
      const idx = prev.findIndex(r => r.id === anchorId);
      if (idx === -1) return prev;
      const next = [...prev.slice(0, idx + 1), row, ...prev.slice(idx + 1)];
      return next;
    });
  }

  function addRowBelowKind(anchorId: string, kind: RowType) {
    setCurrent(prev => {
      const idx = prev.findIndex(r => r.id === anchorId);
      if (idx === -1) return prev;
      const existing = prev.map(r => r.id);
      const id = kind === "story" ? nextId("US", existing) : kind === "ac" ? nextId("AC", existing) : nextId("EP", existing);
      const level = kind === "epic" ? 0 : kind === "story" ? 1 : 2;
      const row: Row = { id, title: kind === "story" ? "New Story" : kind === "ac" ? "New Acceptance" : "New Epic", level, type: kind, status: kind === "story" ? "Draft" : undefined, priority: kind === "story" ? "P3" : undefined };
      const next = [...prev.slice(0, idx + 1), row, ...prev.slice(idx + 1)];
      return next;
    });
  }

  function handleKeyDown(e: React.KeyboardEvent, row: Row) {
    if (e.key === "Enter") {
      e.preventDefault();
      const kind = row.type === "ac" ? "ac" : row.type === "story" ? "story" : "story";
      addRowBelowKind(row.id, kind);
      setMessage("Added new row. Use Tab to move, /ac to add acceptance.");
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, row: Row) {
    const text = e.target.value;
    updateRowById(row.id, { title: text });
    if (/(\/)(ac|story)\b/i.test(text)) {
      const isAc = /\/ac\b/i.test(text);
      const cleaned = text.replace(/\/(ac|story)\b/gi, "").trim();
      updateRowById(row.id, { title: cleaned });
      addRowBelowKind(row.id, isAc ? "ac" : "story");
      setMessage(isAc ? "Slash command: created AC below." : "Slash command: created Story below.");
    }
  }

  // no smart paste (removed to simplify prototype)

  // Selection helpers
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function clearSelection() { setSelectedIds(new Set()); }

  // Context menu
  function openContextMenu(e: React.MouseEvent, row: Row) {
    e.preventDefault();
    const ids = selectedIds.size > 0 && selectedIds.has(row.id) ? Array.from(selectedIds) : [row.id];
    setContextAt({ x: e.clientX, y: e.clientY, ids });
  }
  function closeContextMenu() { setContextAt(null); }

  function moveToBacklog(ids: string[]) {
    if (tab !== "active") return; // only from Active
    let moved: Row[] = [];
    setActive(prev => {
      const keep: Row[] = [];
      for (const r of prev) {
        if (ids.includes(r.id)) moved.push(r); else keep.push(r);
      }
      return keep;
    });
    if (moved.length) setBacklog(prev => [...moved, ...prev]);
    setMessage(`Moved ${ids.length} to Backlog.`);
    clearSelection();
  }

  function deleteRows(ids: string[]) {
    setCurrent(prev => prev.filter(r => !ids.includes(r.id)));
    setMessage(`Deleted ${ids.length} row(s).`);
    clearSelection();
  }

  function setSprint(ids: string[], sprint: Row["sprint"]) {
    setCurrent(prev => prev.map(r => ids.includes(r.id) ? { ...r, sprint } : r));
    setMessage(`Set Sprint ${sprint} for ${ids.length}.`);
  }
  function setRelease(ids: string[], release: Row["release"]) {
    setCurrent(prev => prev.map(r => ids.includes(r.id) ? { ...r, release } : r));
    setMessage(`Set Release ${release} for ${ids.length}.`);
  }
  function duplicateToRelease(ids: string[], release: ReleaseKey) {
    setInstances(prev => {
      const copy = { ...prev };
      ids.forEach(id => {
        const arr = new Set(copy[id] || []);
        arr.add(release);
        copy[id] = Array.from(arr) as ReleaseKey[];
      });
      return copy;
    });
    setMessage(`Duplicated ${ids.length} to ${release}.`);
  }

  function duplicateForPlatforms(ids: string[]) {
    setCurrent(prev => {
      const next: Row[] = [];
      for (const r of prev) {
        next.push(r);
        if (ids.includes(r.id) && r.type === "story") {
          const existing = new Set(prev.map(x => x.id));
          const baseIdx = next.findIndex(x => x.id === r.id);
          const variants: Row[] = ["iOS", "Android", "Web"].map(p => {
            const id = (() => { let n=1; let v=''; do { v = `US_${String(n++).padStart(3,'0')}`; } while (existing.has(v)); existing.add(v); return v; })();
            return { ...r, id, title: `${r.title} — ${p}`, platform: p as any };
          });
          next.splice(baseIdx + 1, 0, ...variants);
        }
      }
      return next;
    });
    setMessage(`Duplicated ${ids.length} for platforms.`);
  }

  // Split dialog
  function openSplit(rowId: string, mode: "ac" | "platform") { setSplitOpen({ rowId, mode }); setContextAt(null); }
  function confirmSplit() {
    if (!splitOpen) return;
    const { rowId, mode } = splitOpen;
    const row = current.find(r => r.id === rowId);
    if (!row) { setSplitOpen(null); return; }
    const existing = current.map(r => r.id);
    const makeUS = (title: string): Row => ({ id: nextId("US", existing), title, type: "story", level: 1, status: "Draft", priority: "P2" });
    const children = mode === "ac"
      ? ["A", "B", "C"].map(s => makeUS(`${row.title} — Part ${s}`))
      : (["iOS", "Android", "Web"] as const).map(p => ({ ...makeUS(`${row.title} — ${p}`), platform: p }));
    setCurrent(prev => {
      const idx = prev.findIndex(r => r.id === rowId);
      if (idx === -1) return prev;
      const next = [...prev.slice(0, idx + 1), ...children, ...prev.slice(idx + 1)];
      return next;
    });
    setSplitOpen(null);
    setMessage("Created split stories.");
  }

  // Library DnD simulation
  useEffect(() => {
    function onMove(e: MouseEvent) { if (drag) setDrag({ ...drag, x: e.clientX, y: e.clientY }); }
    function onUp(e: MouseEvent) {
      if (!drag) return;
      const area = tableRef.current?.getBoundingClientRect();
      if (area && e.clientX >= area.left && e.clientX <= area.right && e.clientY >= area.top && e.clientY <= area.bottom) {
        // Drop into Active regardless of current tab
        setActive(prev => [{ id: drag.id, title: drag.title, type: "story", level: 1, status: "Draft", priority: "P2", referenced: true }, ...prev]);
        setMessage(`Added ${drag.id} from Library → Active`);
        if (tab !== "active") setTab("active");
      }
      setDrag(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [drag, tab]);

  // Persist library sidebar state per session
  useEffect(() => {
    try {
      const v = sessionStorage.getItem('userstory:library:open');
      if (v !== null) setLibOpen(v === 'true');
    } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem('userstory:library:open', String(libOpen)); } catch {}
  }, [libOpen]);
  useEffect(() => { if (showFilter) { setDraftFilters({ status:new Set(filters.status), priority:new Set(filters.priority), sprint:new Set(filters.sprint) }); } }, [showFilter]);

  // Derived display list: search + filter + sort
  function applyFilters(list: Row[]): Row[] {
    return list.filter(r => {
      if (search && !(r.id.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filters.status.size && r.type==='story') { if (!r.status || !filters.status.has(r.status)) return false; }
      if (filters.priority.size && r.type==='story') { if (!r.priority || !filters.priority.has(r.priority)) return false; }
      if (filters.sprint.size) {
        const tag = r.sprint || 'Backlog';
        if (!filters.sprint.has(tag)) return false;
      }
      return true;
    });
  }
  function applySort(list: Row[]): Row[] {
    const next = [...list];
    if (sortKey === 'priority') next.sort((a,b)=> priorityOrder.indexOf((a.priority||'P3')) - priorityOrder.indexOf((b.priority||'P3')));
    else if (sortKey === 'status') next.sort((a,b)=> statusOrder.indexOf((a.status||'Draft')) - statusOrder.indexOf((b.status||'Draft')));
    else if (sortKey === 'created') next.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
    else if (sortKey === 'updated') next.sort((a,b)=> (b.updatedAt||0) - (a.updatedAt||0));
    return next;
  }
  const display = applySort(applyFilters(current));

  // Helper: does a story have AC children in current list
  function hasChildren(storyId: string) {
    const idx = current.findIndex(x=>x.id===storyId);
    if (idx===-1) return false;
    const parentLvl = current[idx].level;
    for (let i=idx+1;i<current.length;i++){
      const r=current[i];
      if (r.level<=parentLvl) break;
      if (r.type==='ac') return true;
    }
    return false;
  }
  // Format IDs as small badges with dash (US-1) for display
  function formatDisplayId(raw: string): string {
    const m = raw.match(/^([A-Z]{2,})_(\d+)([A-Z]?)$/);
    if (m) {
      const prefix = m[1];
      const num = String(parseInt(m[2], 10));
      const suf = m[3] || '';
      return `${prefix}-${num}${suf}`;
    }
    return raw.replace(/_/g, '-');
  }
  function IDBadge({ id, type, level }: { id: string; type: RowType; level: number }) {
    const colorClasses = {
      epic: 'bg-transparent text-purple-300 border-purple-500/40',
      story: 'bg-transparent text-blue-300 border-blue-500/40',
      ac: 'bg-transparent text-neutral-300 border-neutral-500/30'
    } as const;
    const badge = (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClasses[type]}`}>{formatDisplayId(id)}</span>
    );
    return (
      <div className="inline-flex items-center gap-2">
        <span style={{ paddingLeft: level * 16 }} />
        {type === 'story' && hasChildren(id) && (
          <button onClick={()=>toggleExpanded(id)} className="text-neutral-500 hover:text-neutral-300" aria-label="toggle">
            {expandedRows.has(id) ? '▼' : '▶'}
          </button>
        )}
        {type === 'ac' && (
          <span className="text-neutral-600">├─</span>
        )}
        {badge}
      </div>
    );
  }
  // Helper: is this AC the last among siblings
  function isLastChild(id: string) {
    const idx = current.findIndex(x=>x.id===id);
    if (idx===-1) return false;
    const lvl = current[idx].level;
    for (let i=idx+1;i<current.length;i++){
      const r=current[i];
      if (r.level<lvl) break;
      if (r.level===lvl && r.type==='ac') return false; // has a following sibling
    }
    return true;
  }
  // Helper: for an AC row in the current display order, find its parent story id by scanning upward
  function parentStoryIdForDisplayIndex(i: number): string | null {
    for (let j=i-1;j>=0;j--){
      const rr = display[j];
      if (rr.level<=1 && rr.type==='story') return rr.id;
    }
    return null;
  }

  // Lifecycle badge (no emoji)
  function LifecycleBadge({ row }: { row: Row }) {
    const last = (row.lifecycle||[]).slice(-1)[0];
    let badge = { text:'Created', cls:'bg-transparent border-neutral-500/30 text-neutral-300' };
    if (last){
      if (last.type==='metrics') badge = { text:'Metrics', cls:'bg-transparent border-emerald-500/40 text-emerald-300' };
      else if (last.type==='deployed') badge = { text:`Deployed #${last.deployId}`, cls:'bg-transparent border-blue-500/40 text-blue-300' };
      else if (last.type==='pr_merged') badge = { text:'PR merged', cls:'bg-transparent border-green-500/40 text-green-300' };
      else if (last.type==='pr_open') badge = { text:`PR #${last.prNumber}`, cls:'bg-transparent border-amber-500/40 text-amber-300' };
    }
    return (
      <button
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs border transition-all duration-200 hover:scale-105 hover:shadow-lg ${badge.cls}`}
        onClick={()=>openDetails([row.id], 'lifecycle')}
        title="Open lifecycle"
      >
        <span className="font-medium">{badge.text}</span>
        <span className="text-[10px] opacity-70">{rel(row.updatedAt)}</span>
      </button>
    );
  }

  // Tiny checkbox for table selection (compact, dark theme)
  function CircleCheck({ checked, onChange }: { checked: boolean; onChange: ()=>void }) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); onChange(); }}}
        className="h-4 w-4 rounded-full border border-white/25 bg-transparent grid place-items-center hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <span className={`h-2.5 w-2.5 rounded-full transition-transform ${checked? 'bg-indigo-500 scale-100':'bg-transparent scale-0'}`} />
      </button>
    );
  }

  // Render helpers
  function Chip({ label, tone = "default" }: { label: string; tone?: "default" | "info" | "accent" | "warn" }) {
    const toneCls = tone === "info" ? "border-cyan-600/50 bg-cyan-600/15" : tone === "accent" ? "border-indigo-600/50 bg-indigo-600/15" : tone === "warn" ? "border-amber-500/50 bg-amber-500/15" : "border-white/10 bg-white/5";
    return <span className={`text-[11px] px-1.5 py-0.5 rounded border ${toneCls}`}>{label}</span>;
  }

  // Simple badge styled like shadcn tone
  function Badge({ children, color }: { children: React.ReactNode; color: 'amber'|'green'|'blue'|'neutral' }) {
    const map: Record<string,string> = {
      amber: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
      green: 'bg-green-500/10 text-green-300 border-green-500/40',
      blue: 'bg-blue-500/10 text-blue-300 border-blue-500/40',
      neutral: 'bg-white/5 text-neutral-300 border-white/10',
    };
    return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs border ${map[color]}`}>{children}</span>;
  }

  // Approval side panel (mock) — temporarily stubbed to avoid JSX parsing issues
  function ApprovalPanel({ open, onClose }: { open: boolean; onClose: ()=>void }) { return null; }
  function rel(ts?: number) {
    if (!ts) return '';
    const d = Math.floor((Date.now()-ts)/1000);
    if (d < 60) return `${d}s ago`;
    if (d < 3600) return `${Math.floor(d/60)}m ago`;
    if (d < 86400) return `${Math.floor(d/3600)}h ago`;
    return `${Math.floor(d/86400)}d ago`;
  }
  function lifecycleBadge(r: Row) {
    const last = (r.lifecycle||[]).slice(-1)[0];
    if (!last) return { text:'Created', color:'text-neutral-300', emoji:'📝' };
    if (last.type==='metrics') return { text:'Metrics', color:'text-emerald-300', emoji:'📊' };
    if (last.type==='deployed') return { text:`Deployed #${last.deployId}`, color:'text-emerald-300', emoji:'🚀' };
    if (last.type==='pr_merged') return { text:'PR merged', color:'text-indigo-300', emoji:'✅' };
    if (last.type==='pr_open') return { text:`PR #${last.prNumber}`, color:'text-amber-300', emoji:'🟡' };
    return { text:'Created', color:'text-neutral-300', emoji:'📝' };
  }

  function openDetails(ids: string[], initialTab: 'properties'|'lifecycle'|'history' = 'properties') {
    setDetailsIds(Array.from(new Set(ids)));
    setDetailsTab(initialTab);
    setContextAt(null);
    setShowFieldMap(false);
  }
  function closeDetails() { setDetailsIds(null); }
  function applyTo(ids: string[], patch: Partial<Row>) {
    setCurrent(prev => prev.map(r => ids.includes(r.id) ? { ...r, ...patch } : r));
  }
  function pushChangeLog(id: string, entry: string) {
    setCurrent(prev => prev.map(r => r.id===id ? { ...r, changeLog: [...(r.changeLog||[]), entry] } : r));
  }

  // Context-menu capture: if there is selected text, show "Add comment" menu
  function handleGlobalContextMenuCapture(e: React.MouseEvent) {
    try {
      const sel = window.getSelection?.();
      const text = sel?.toString?.() || "";
      if (sel && !sel.isCollapsed && text.trim()) {
        const range = sel.getRangeAt(0);
        const rectList = Array.from(range.getClientRects()).map(r=>({ top:r.top, left:r.left, width:r.width, height:r.height }));
        e.preventDefault();
        e.stopPropagation();
        setContextAt(null);
        setCommentMenu({ x: (e as any).clientX, y: (e as any).clientY, selection: { text: text.trim(), rects: rectList } });
      }
    } catch {}
  }

  function beginCommentFromSelection() {
    if (!cardRef.current || !commentMenu) return;
    const cardBox = cardRef.current.getBoundingClientRect();
    const rectsRel = commentMenu.selection.rects.map(r=>({
      top: r.top - cardBox.top,
      left: Math.max(0, r.left - cardBox.left),
      width: r.width,
      height: r.height,
    }));
    const top = Math.max(0, rectsRel[0]?.top ?? 0);
    setCommentDraft({ top, rectsRel, selectedText: commentMenu.selection.text, text: "" });
    setCommentMenu(null);
  }

  function cancelCommentDraft() {
    setCommentDraft(null);
  }

  function saveCommentDraft() {
    if (!commentDraft) return;
    const id = `C_${Math.random().toString(36).slice(2,8)}`;
    const newComment: Comment = {
      id,
      text: commentDraft.text.trim(),
      author: 'Justin Broxton',
      timestamp: Date.now(),
      selectedText: commentDraft.selectedText,
      rectsRel: commentDraft.rectsRel,
      replies: [],
    };
    setComments(prev => [...prev, newComment]);
    setActiveCommentId(id);
    setCommentDraft(null);
  }

  function addReply(id: string) {
    if (!replyDraft || !replyDraft.text.trim()) return;
    setComments(prev => prev.map(c => c.id===id ? { ...c, replies:[...(c.replies||[]), { id:`R_${Math.random().toString(36).slice(2,6)}`, text: replyDraft.text.trim(), author:'Justin Broxton', timestamp: Date.now() }] } : c));
    setReplyDraft(null);
  }

  function resolveComment(id: string) {
    setComments(prev => prev.map(c => c.id===id ? { ...c, resolved: true } : c));
    if (activeCommentId === id) setActiveCommentId(null);
  }

  // Extract title from markdown content
  useEffect(() => {
    const firstLine = editorText.split('\n')[0];
    if (firstLine.startsWith('# ')) {
      const title = firstLine.substring(2).trim();
      if (title && title !== documentTitle) {
        setDocumentTitle(title);
      }
    }
  }, [editorText]);

  // Close header menu when clicking outside
  useEffect(() => {
    const handleClick = () => setShowHeaderMenu(false);
    if (showHeaderMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showHeaderMenu]);

  // Close versions popover on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      const panel = document.getElementById('versions-popover');
      if (panel && (panel === t || panel.contains(t))) return;
      if (versionBadgeRef.current && (versionBadgeRef.current === t || versionBadgeRef.current.contains(t))) return;
      setVersionsOpen(false);
    }
    if (versionsOpen) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [versionsOpen]);

  function openVersionsPopover() {
    const r = versionBadgeRef.current?.getBoundingClientRect();
    if (r) {
      const width = 280;
      let left = r.left;
      const clampLeft = Math.min(Math.max(8, left), window.innerWidth - width - 8);
      setVersionsPos({ top: r.bottom + 8, left: clampLeft, width });
    }
    setVersionsOpen(true);
  }

  function createNewVersion() {
    const m = /^(?:v)?(\d+)\.(\d+)$/.exec(currentVersion);
    const next = m ? `v${m[1]}.${Number(m[2]) + 1}` : 'v1.0';
    setVersions(v => [next, ...v.filter(x => x !== next)]);
    setCurrentVersion(next);
    setVersionsOpen(false);
  }

  return (
    <div className="fixed inset-0 bg-neutral-950 text-neutral-200 flex flex-col">
      <header className="flex-shrink-0 z-40 bg-neutral-950/95 backdrop-blur border-b border-white/10">
        <TabsBar />
      </header>
      <div className="flex-1 min-h-0 p-4 grid" style={{ gridTemplateColumns: '280px 1fr', gap: '4px' }}>
        {/* Sidebar: same as Requirements */}
        <aside className="w-[280px] flex-shrink-0 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <TestPrdSidebar />
          </div>
        </aside>

        {/* Main Area */}
        <main className="min-h-0 min-w-0 flex overflow-hidden">
          <div className="min-h-0 min-w-0 flex gap-4 w-full overflow-hidden">
              {/* Left: PRD Canvas */}
              <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          {/* Editor canvas wrapper */}
          <div className="panel-shell" onContextMenuCapture={handleGlobalContextMenuCapture}>
            <div ref={cardRef} className="panel-card flex-col overflow-hidden relative">
              {/* Canvas header (sticky, no bottom border) */}
              <div className="sticky top-0 z-10 bg-neutral-900/80 backdrop-blur">
                <div className="flex items-center justify-between px-4 py-2">
                  {/* Left: Editable Title */}
                  <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                        className="text-base font-medium bg-transparent border-b border-white/20 outline-none text-neutral-100 px-1"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 
                          className="text-base font-medium text-neutral-100 cursor-text hover:bg-white/5 px-2 py-1 rounded"
                          onClick={() => setIsEditingTitle(true)}
                        >
                          {documentTitle || "Untitled"}
                        </h1>
                        <span
                          ref={versionBadgeRef}
                          className="text-xs text-neutral-500 px-1.5 py-0.5 bg-neutral-800/50 rounded cursor-pointer hover:bg-neutral-800"
                          title="Versions"
                          onClick={(e)=>{ e.stopPropagation(); openVersionsPopover(); }}
                        >
                          {currentVersion}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm text-neutral-300 hover:bg-white/5 rounded">
                      Share
                    </button>

                    <div className="relative">
                      <button 
                        className="p-1.5 text-neutral-300 hover:bg-white/5 rounded"
                        onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(!showHeaderMenu); }}
                      >
                        <span className="text-xl">⋯</span>
                      </button>

                      {showHeaderMenu && (
                        <div className="absolute right-0 mt-1 w-48 rounded-md border border-white/10 bg-neutral-900/95 shadow-lg z-50">
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5">
                            Copy Link
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5">
                            Move to trash
                          </button>
                          <div className="border-t border-white/10" />
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5" onClick={(e)=>{ e.stopPropagation(); setConnectStatus('idle'); setConnectError(''); setConnectOpen(true); setShowHeaderMenu(false); }}>
                            Connect to Jira
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5">
                            Import
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5">
                            Export
                          </button>
                          <div className="border-t border-white/10" />
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5" onClick={(e)=>{ e.stopPropagation(); setApprovalOpen(true); setShowHeaderMenu(false); }}>
                            {approvalStatus==='draft' ? 'Submit for Approval' : 'View Approvals'}
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5" onClick={(e)=>{ e.stopPropagation(); openVersionsPopover(); setShowHeaderMenu(false); }}>
                            Versions
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5" onClick={(e)=>{ e.stopPropagation(); setVersionsRailOpen(true); setShowHeaderMenu(false); }}>
                            Version History
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5">
                            Templates
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5">
                            Integrations
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/5">
                            Properties
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Scrollable content area */}
                  <div className="flex-1 min-h-0 overflow-auto">
                    <div className="auto-editor px-3 pt-3">
                      <PRDEditor value={editorText} onChange={setEditorText} autoGrow hideTitle />
                    </div>
                  </div>
                  {/* removed old inline details
                    <div className="w-[360px] shrink-0 border-l border-white/10 bg-neutral-900/95 p-4 overflow-auto">
                      <div className="flex items-start gap-2 mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{detailsIds.length>1? `Bulk Edit (${detailsIds.length})` : (()=>{ const r=current.find(r=>r.id===detailsIds[0]); return r? `${r.id} — ${r.title}`: detailsIds[0]; })()}</div>
                          <div className="text-xs text-neutral-400">Jira sync fields and story details</div>
                        </div>
                        {detailsIds.length===1 && (()=>{ const r=current.find(x=>x.id===detailsIds[0]); if(!r) return null; const st=r.syncStatus||'drift'; return <Chip label={st==='in-sync'? 'In Sync':'Drift Detected'} tone={st==='in-sync'? 'accent':'warn'} />; })()}
                        <button className="ml-2 px-2 py-1 rounded border border-white/10 text-xs" title="Close" onClick={closeDetails}>⟩</button>
                      </div>

                      {detailsIds.length===1 && (()=>{
                        const r = current.find(x=>x.id===detailsIds[0]);
                        if(!r) return <div className="text-sm text-neutral-400">Item not found.</div>;
                        return (
                          <div className="space-y-3">
                            <div className="flex gap-1 mb-1">
                              <button className={`px-2 py-1 rounded border text-xs ${detailsTab==='properties'? 'border-white/20 bg-white/5':'border-white/10'}`} onClick={()=>setDetailsTab('properties')}>Properties</button>
                              <button className={`px-2 py-1 rounded border text-xs ${detailsTab==='lifecycle'? 'border-white/20 bg-white/5':'border-white/10'}`} onClick={()=>setDetailsTab('lifecycle')}>Lifecycle</button>
                              <button className={`px-2 py-1 rounded border text-xs ${detailsTab==='history'? 'border-white/20 bg-white/5':'border-white/10'}`} onClick={()=>setDetailsTab('history')}>History</button>
                            </div>

                            {detailsTab==='lifecycle' && (
                              <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Lifecycle Timeline</div>
                                <div className="border-t border-white/10 pt-2">
                                  {(r.lifecycle||[]).map((ev,i)=> (
                                    <div key={i} className="mb-3">
                                      <div className="flex items-start gap-2">
                                        <div className="w-5 text-center">
                                          <div className={`mx-auto mt-1.5 w-1.5 h-1.5 rounded-full ${ev.type==='created'? 'bg-neutral-500' : ev.type==='pr_open'? 'bg-amber-400' : ev.type==='pr_merged'? 'bg-indigo-400' : ev.type==='deployed'? 'bg-emerald-500' : 'bg-emerald-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-sm">
                                            {ev.type==='created'? 'Created' : ev.type==='pr_open'? `PR Opened (#${ev.prNumber})` : ev.type==='pr_merged'? 'PR Merged' : ev.type==='deployed'? `Deployed (#${ev.deployId})` : 'Metrics Available'}
                                          </div>
                                          <div className="text-xs text-neutral-400">{new Date(ev.at).toLocaleString()} • {rel(ev.at)}</div>
                                          {ev.type==='pr_open' && (
                                            <div className="text-xs text-indigo-300"><a href={ev.prUrl} target="_blank" rel="noreferrer">{ev.prUrl}</a></div>
                                          )}
                                          {ev.type==='pr_merged' && (
                                            <div className="text-xs text-neutral-300">Merged by: {ev.mergedBy}</div>
                                          )}
                                          {ev.type==='deployed' && (
                                            <div className="text-xs text-neutral-300">Environment: {ev.environment}</div>
                                          )}
                                          {ev.type==='metrics' && (
                                            <div className="text-xs text-neutral-300">Error rate: {ev.errorRate}</div>
                                          )}
                                        </div>
                                      </div>
                                      {i < (r.lifecycle||[]).length-1 && <div className="ml-5 border-l border-white/10 h-3" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {detailsTab==='history' && (
                              <div>
                                <div className="text-xs text-neutral-400 mb-1">Change Log</div>
                                {r.changeLog && r.changeLog.length>0 ? (
                                  <ul className="text-xs text-neutral-300 list-disc pl-5">
                                    {r.changeLog.map((c,i)=>(<li key={i}>{c}</li>))}
                                  </ul>
                                ) : <div className="text-xs text-neutral-500">No changes yet.</div>}
                              </div>
                            )}

                            {detailsTab==='properties' && (
                              <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Issue Type</label>
                                <select value={r.issueType||'Story'} onChange={(e)=>applyTo([r.id], { issueType: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                  <option>Story</option>
                                  <option>Bug</option>
                                  <option>Task</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Jira Project</label>
                                <input value={r.jiraProject||''} onChange={(e)=>applyTo([r.id], { jiraProject: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" placeholder="e.g., WEB" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Description</label>
                              <textarea value={r.description||''} onChange={(e)=>applyTo([r.id], { description: e.target.value })} className="w-full h-24 bg-neutral-900 border border-white/10 rounded p-2 text-sm" placeholder="User story description…" />
                            </div>

                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Acceptance Criteria</label>
                              <div className="space-y-1">
                                {(r.acList||[]).map((ac, i)=> (
                                  <div key={i} className="flex items-center gap-2">
                                    <input value={ac} onChange={(e)=>{
                                      const list=[...(r.acList||[])]; list[i]=e.target.value; applyTo([r.id], { acList: list });
                                    }} className="flex-1 bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                                    <button className="text-xs px-2 py-1 rounded border border-white/10" onClick={()=>{ const list=[...(r.acList||[])]; list.splice(i,1); applyTo([r.id], { acList: list }); }}>−</button>
                                  </div>
                                ))}
                                <button className="text-xs px-2 py-1 rounded border border-white/10" onClick={()=>applyTo([r.id], { acList: [...(r.acList||[]), ""] })}>+ Add AC</button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Labels (comma)</label>
                                <input value={(r.labels||[]).join(', ')} onChange={(e)=>applyTo([r.id], { labels: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Components (comma)</label>
                                <input value={(r.components||[]).join(', ')} onChange={(e)=>applyTo([r.id], { components: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Status</label>
                                <select value={r.status || 'Draft'} onChange={(e)=>applyTo([r.id], { status: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                  <option>Draft</option>
                                  <option>In Dev</option>
                                  <option>In Review</option>
                                  <option>Deployed</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Priority</label>
                                <select value={r.priority || 'P2'} onChange={(e)=>applyTo([r.id], { priority: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                  <option>P0</option>
                                  <option>P1</option>
                                  <option>P2</option>
                                  <option>P3</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Story Points</label>
                                <select value={String(r.points||0)} onChange={(e)=>applyTo([r.id], { points: Number(e.target.value)||0 })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                  {[0,1,2,3,5,8,13].map(n=> <option key={n} value={n}>{n}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Assignee</label>
                                <input value={r.assignee||''} onChange={(e)=>applyTo([r.id], { assignee: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Epic Link</label>
                                <input value={r.epicLink||''} onChange={(e)=>applyTo([r.id], { epicLink: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Sprint</label>
                                <div className="flex gap-1">
                                  {(["M1","M2","M3"] as const).map(s => (
                                    <button key={s} className={`px-2 py-1 rounded border text-xs ${r.sprint===s? 'border-indigo-600 bg-indigo-600/20':'border-white/10'}`} onClick={()=>applyTo([r.id], { sprint: s })}>{s}</button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Release</label>
                                <div className="flex gap-1">
                                  {(["R1.0","R1.1","R2.0"] as const).map(rv => (
                                    <button key={rv} className={`px-2 py-1 rounded border text-xs ${r.release===rv? 'border-amber-500 bg-amber-500/20':'border-white/10'}`} onClick={()=>applyTo([r.id], { release: rv })}>{rv}</button>
                                  ))}
              </div>

                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Dependencies (IDs/URLs, comma)</label>
                              <input value={(r.dependencies||[]).join(', ')} onChange={(e)=>applyTo([r.id], { dependencies: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                              <button className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>setShowFieldMap(v=>!v)}>Map Fields</button>
                              <button className="px-2 py-1 rounded border border-indigo-600 bg-indigo-600 text-white text-xs" onClick={()=>{
                                applyTo([r.id], { syncStatus: undefined });
                                setTimeout(()=>{ applyTo([r.id], { syncStatus: 'in-sync' }); pushChangeLog(r.id, `Synced at ${new Date().toLocaleTimeString()}`); }, 700);
                              }}>Sync Now</button>
                              <a href="#" className="px-2 py-1 rounded border border-white/10 text-xs">Open in Jira</a>
                              <div className="flex-1" />
                              {r.syncStatus ? <Chip label={r.syncStatus==='in-sync'? 'In Sync':'Drift'} tone={r.syncStatus==='in-sync'? 'accent':'warn'} /> : <span className="text-xs text-neutral-500">Syncing…</span>}
                            </div>

                            {showFieldMap && (
                              <div className="mt-2 p-2 rounded border border-white/10 bg-neutral-950/60">
                                <div className="text-xs text-neutral-400 mb-1">Field Mapping (mock)</div>
                                <ul className="text-xs text-neutral-300 list-disc pl-5">
                                  <li>Title → summary</li>
                                  <li>Description → description</li>
                                  <li>Labels → labels</li>
                                  <li>Points → story points</li>
                                  <li>Sprint/Release → custom fields</li>
                                </ul>
                              </div>
                            )}
                          </>
                          )}

                          <div className="mt-4 flex justify-end">
                            <button className="px-3 py-1 rounded-md border border-white/10" onClick={closeDetails}>Close</button>
                          </div>
                        </div>
                      );
                      })() : (
                        // Bulk edit inline panel
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Labels (comma)</label>
                              <input onChange={(e)=>applyTo(detailsIds, { labels: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Components (comma)</label>
                              <input onChange={(e)=>applyTo(detailsIds, { components: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Status</label>
                              <div className="flex gap-1">
                                {(['Draft','In Dev','In Review','Deployed'] as const).map(s => (
                                  <button key={s} className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>applyTo(detailsIds, { status: s as any })}>{s}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Priority</label>
                              <div className="flex gap-1">
                                {(['P0','P1','P2','P3'] as const).map(p => (
                                  <button key={p} className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>applyTo(detailsIds, { priority: p as any })}>{p}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Sprint</label>
                              <div className="flex gap-1">
                                {(["M1","M2","M3"] as const).map(s => (
                                  <button key={s} className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>applyTo(detailsIds, { sprint: s })}>{s}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-neutral-400 mb-1">Release</label>
                              <div className="flex gap-1">
                                {(["R1.0","R1.1","R2.0"] as const).map(rv => (
                                  <button key={rv} className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>applyTo(detailsIds, { release: rv })}>{rv}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button className="px-3 py-1 rounded-md border border-white/10" onClick={closeDetails}>Close</button>
                          </div>
                        </div>
                      )}
                    </div>
                  */}
              {/* Canvas controls + content (inside same panel) */}
          {/* Main content: either Table or By Release */}
          {view === 'table' && (
            <div className="p-3">
              <div className="mx-auto max-w-[900px]">
                    <div className="rounded-md border border-white/10 overflow-hidden text-[14px] leading-6">
                      {/* Header controls */}
                  <div className="px-4 py-3 flex items-center gap-2 text-xs border-b border-white/10">
                    <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search…" className="w-44 bg-transparent border border-white/10 rounded px-2 py-1 text-xs" />
                    <div className="relative">
                      <button className="px-2 py-1 rounded-md text-xs border border-white/10 bg-transparent" onClick={()=>{ setShowSort(s=>!s); setShowFilter(false); setShowView(false); }}>▼ Sort</button>
                      {showSort && (
                        <div className="absolute mt-1 z-30 min-w-[200px] p-1 rounded-md border border-white/10 bg-neutral-900/95 shadow-xl text-xs">
                          <button className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>{ setSortKey('priority'); setShowSort(false); }}>By Priority (P0→P3)</button>
                          <button className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>{ setSortKey('status'); setShowSort(false); }}>By Status (Draft→Deployed)</button>
                          <button className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>{ setSortKey('created'); setShowSort(false); }}>By Created Date</button>
                          <button className="w-full text-left px-2 py-1 rounded hover:bg-white/10" onClick={()=>{ setSortKey('updated'); setShowSort(false); }}>By Updated Date</button>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button className="px-2 py-1 rounded-md text-xs border border-white/10 bg-transparent" onClick={()=>{ setShowFilter(s=>!s); setShowSort(false); setShowView(false); }}>▼ Filter</button>
                      {showFilter && (
                        <div className="absolute mt-1 z-30 w-[240px] p-2 rounded-md border border-white/10 bg-neutral-900/95 shadow-xl text-xs">
                          <div className="mb-1 text-xs text-neutral-400">Status</div>
                          {(['Draft','In Dev','In Review','Deployed'] as const).map(s => (
                            <label key={s} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={draftFilters.status.has(s)} onChange={(e)=>{ const d=new Set(draftFilters.status); e.target.checked? d.add(s): d.delete(s); setDraftFilters({...draftFilters, status:d}); }} /> {s}</label>
                          ))}
                          <div className="mt-2 mb-1 text-xs text-neutral-400">Priority</div>
                          {(['P0','P1','P2','P3'] as const).map(p => (
                            <label key={p} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={draftFilters.priority.has(p)} onChange={(e)=>{ const d=new Set(draftFilters.priority); e.target.checked? d.add(p): d.delete(p); setDraftFilters({...draftFilters, priority:d}); }} /> {p}</label>
                          ))}
                          <div className="mt-2 mb-1 text-xs text-neutral-400">Sprint</div>
                          {(['M1','M2','M3','Backlog'] as const).map(s => (
                            <label key={s} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={draftFilters.sprint.has(s)} onChange={(e)=>{ const d=new Set(draftFilters.sprint); e.target.checked? d.add(s): d.delete(s); setDraftFilters({...draftFilters, sprint:d}); }} /> {s}</label>
                          ))}
                          <div className="mt-2 mb-1 text-xs text-neutral-400">Scope</div>
                          <div className="flex gap-1">
                            {(['active','backlog','archive'] as TabKey[]).map(t => (
                              <button key={t} className={`px-2 py-1 rounded-md text-xs border ${tab===t? 'bg-neutral-800 border-white/10' : 'border-white/10 hover:bg-neutral-800/60'}`} onClick={()=>{ setTab(t); setShowFilter(false); }}>
                                {t==='active'?'Active':t==='backlog'?'Backlog':'Archive'}
                              </button>
                            ))}
                          </div>
                          <div className="pt-2 mt-2 border-t border-white/10 flex justify-end gap-2">
                            <button className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>{ setDraftFilters({ status:new Set(), priority:new Set(), sprint:new Set() }); }}>Clear</button>
                            <button className="px-2 py-1 rounded border border-indigo-600 bg-indigo-600 text-white text-xs" onClick={()=>{ setFilters(draftFilters); setShowFilter(false); }}>Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1" />
                    {/* scope moved to Filter dropdown */}
                  </div>
                  {versionsOpen && createPortal(
                    <div id="versions-popover" className="fixed z-50 rounded-md border border-white/10 bg-neutral-900/95 shadow-xl" style={{ top: versionsPos.top, left: versionsPos.left, width: versionsPos.width }}>
                      <div className="p-2">
                        <div className="px-2 py-1 text-sm font-medium">Versions</div>
                        <div className="px-2 py-1">
                          <button onClick={createNewVersion} className="w-full text-left px-2 py-1.5 rounded-md border border-white/10 hover:bg-white/5 text-sm">Create new version</button>
                        </div>
                        <div className="max-h-56 overflow-auto">
                          {versions.map(v => (
                            <button key={v} onClick={()=>{ setCurrentVersion(v); setVersionsOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5 ${v===currentVersion? 'bg-white/5':''}`}>
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}

                  {/* Table content */}
                  <div ref={tableRef} className="overflow-x-auto p-0">
                    <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-neutral-900/50">
                  <tr>
                    <th className="text-left font-normal px-3 py-3 w-8"></th>
                    <th className="text-left font-normal px-4 py-3 w-48 text-neutral-400">ID</th>
                    <th className="text-left font-normal px-4 py-3 text-neutral-400">Title</th>
                    <th className="text-left font-normal px-4 py-3 w-48 text-neutral-400">Lifecycle</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map((r, i) => {
                    if (r.type==='ac') {
                      const pid = parentStoryIdForDisplayIndex(i);
                      if (pid && !expandedRows.has(pid)) return null;
                    }
                    return (
                    <tr key={r.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-200 ${r.type==='ac' ? 'animate-fadeIn':''}`} onKeyDown={(e)=>handleKeyDown(e as any, r)} onContextMenu={(e)=>openContextMenu(e, r)}>
                      <td className="pl-3 pr-1 py-2 align-middle w-8">
                        <CircleCheck checked={selectedIds.has(r.id)} onChange={()=>toggleSelect(r.id)} />
                      </td>
                      <td className="pl-0 pr-4 py-2 align-middle w-48">
                        <IDBadge id={r.id} type={r.type} level={r.level} />
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <textarea
                          rows={1}
                          value={r.title}
                          onChange={(e)=>handleTitleChange(e as React.ChangeEvent<HTMLTextAreaElement>, r)}
                          onKeyDown={(e)=>handleKeyDown(e as any, r)}
                          onInput={(e)=>{ const el=e.currentTarget; el.style.height='auto'; el.style.height=el.scrollHeight+'px'; }}
                          className="w-full bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 resize-none overflow-hidden whitespace-pre-wrap break-words leading-snug text-[14px]"
                        />
                      </td>
                      <td className="px-4 py-2 align-middle w-48">
                        {r.type==='story' && (r.lifecycle||[]).length>0 ? <LifecycleBadge row={r} /> : <span className="text-neutral-600">—</span>}
                      </td>
                    </tr>
                  ); })}
                </tbody>
                    </table>
                  </div>
                </div>
              </div>
      
          {/* Comment highlights (saved) */}
          {comments.filter(c=>!c.resolved).map(c => (
            <div key={c.id+':hl'} className="absolute inset-0 pointer-events-none">
              {c.rectsRel.map((r,i)=> (
                <div
                  key={i}
                  className="absolute bg-transparent border border-blue-400/40 rounded-sm pointer-events-auto cursor-pointer"
                  style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
                  title={c.selectedText}
                  onClick={()=>setActiveCommentId(c.id)}
                />
              ))}
            </div>
          ))}

          {/* Comment draft temporary highlight */}
          {commentDraft && (
            <div className="absolute inset-0 pointer-events-none">
              {commentDraft.rectsRel.map((r,i)=> (
                <div key={i} className="absolute bg-transparent border border-blue-400/40 rounded-sm" style={{ left:r.left, top:r.top, width:r.width, height:r.height }} />
              ))}
            </div>
          )}

          {/* (moved comment boxes to external rail) */}

         
          </div>)}{/* panel-card */}
          </div>{/* panel-shell */}
          </div>{/* left flex-1 */}

          {/* Right: Details Rail (conditional) */}
              {detailsIds && (
                <aside className="w-[360px] shrink-0">
                  <div className="panel-shell">
                    <div className="panel-card p-4 overflow-auto flex-col">
                      <div className="flex items-start gap-2 mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{detailsIds.length>1? `Bulk Edit (${detailsIds.length})` : (()=>{ const r=current.find(r=>r.id===detailsIds[0]); return r? `${r.id} — ${r.title}`: detailsIds[0]; })()}</div>
                          <div className="text-xs text-neutral-400">Jira sync fields and story details</div>
                        </div>
                        {detailsIds.length===1 && (()=>{ const r=current.find(x=>x.id===detailsIds[0]); if(!r) return null; const st=r.syncStatus||'drift'; return <Chip label={st==='in-sync'? 'In Sync':'Drift Detected'} tone={st==='in-sync'? 'accent':'warn'} />; })()}
                        <button className="ml-2 px-2 py-1 rounded border border-white/10 text-xs" title="Close" onClick={closeDetails}>⟩</button>
                      </div>

                      {detailsIds.length===1 && (()=>{
                        const r = current.find(x=>x.id===detailsIds[0]);
                        if(!r) return <div className="text-sm text-neutral-400">Item not found.</div>;
                        return (
                          <div className="space-y-3">
                            <div className="flex gap-1 mb-1">
                              <button className={`px-2 py-1 rounded border text-xs ${detailsTab==='properties'? 'border-white/20 bg-white/5':'border-white/10'}`} onClick={()=>setDetailsTab('properties')}>Properties</button>
                              <button className={`px-2 py-1 rounded border text-xs ${detailsTab==='lifecycle'? 'border-white/20 bg-white/5':'border-white/10'}`} onClick={()=>setDetailsTab('lifecycle')}>Lifecycle</button>
                              <button className={`px-2 py-1 rounded border text-xs ${detailsTab==='history'? 'border-white/20 bg-white/5':'border-white/10'}`} onClick={()=>setDetailsTab('history')}>History</button>
                            </div>

                            {detailsTab==='lifecycle' && (
                              <div className="space-y-2">
                                <div className="text-xs text-neutral-400">Lifecycle Timeline</div>
                                <div className="border-t border-white/10 pt-2">
                                  {(r.lifecycle||[]).map((ev,i)=> (
                                    <div key={i} className="mb-3">
                                      <div className="flex items-start gap-2">
                                        <div className="w-5 text-center">
                                          <div className={`mx-auto mt-1.5 w-1.5 h-1.5 rounded-full ${ev.type==='created'? 'bg-neutral-500' : ev.type==='pr_open'? 'bg-amber-400' : ev.type==='pr_merged'? 'bg-indigo-400' : ev.type==='deployed'? 'bg-emerald-500' : 'bg-emerald-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-sm">
                                            {ev.type==='created'? 'Created' : ev.type==='pr_open'? `PR Opened (#${ev.prNumber})` : ev.type==='pr_merged'? 'PR Merged' : ev.type==='deployed'? `Deployed (#${ev.deployId})` : 'Metrics Available'}
                                          </div>
                                          <div className="text-xs text-neutral-400">{new Date(ev.at).toLocaleString()} • {rel(ev.at)}</div>
                                          {ev.type==='pr_open' && (
                                            <div className="text-xs text-indigo-300"><a href={ev.prUrl} target="_blank" rel="noreferrer">{ev.prUrl}</a></div>
                                          )}
                                          {ev.type==='pr_merged' && (
                                            <div className="text-xs text-neutral-300">Merged by: {ev.mergedBy}</div>
                                          )}
                                          {ev.type==='deployed' && (
                                            <div className="text-xs text-neutral-300">Environment: {ev.environment}</div>
                                          )}
                                          {ev.type==='metrics' && (
                                            <div className="text-xs text-neutral-300">Error rate: {ev.errorRate}</div>
                                          )}
                                        </div>
                                      </div>
                                      {i < (r.lifecycle||[]).length-1 && <div className="ml-5 border-l border-white/10 h-3" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {detailsTab==='history' && (
                              <div>
                                <div className="text-xs text-neutral-400 mb-1">Change Log</div>
                                {r.changeLog && r.changeLog.length>0 ? (
                                  <ul className="text-xs text-neutral-300 list-disc pl-5">
                                    {r.changeLog.map((c,i)=>(<li key={i}>{c}</li>))}
                                  </ul>
                                ) : <div className="text-xs text-neutral-500">No changes yet.</div>}
                              </div>
                            )}

                            {detailsTab==='properties' && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Issue Type</label>
                                    <select value={r.issueType||'Story'} onChange={(e)=>applyTo([r.id], { issueType: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                      <option>Story</option>
                                      <option>Bug</option>
                                      <option>Task</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Jira Project</label>
                                    <input value={r.jiraProject||''} onChange={(e)=>applyTo([r.id], { jiraProject: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" placeholder="e.g., WEB" />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs text-neutral-400 mb-1">Description</label>
                                  <textarea value={r.description||''} onChange={(e)=>applyTo([r.id], { description: e.target.value })} className="w-full h-24 bg-neutral-900 border border-white/10 rounded p-2 text-sm" placeholder="User story description…" />
                                </div>

                                <div>
                                  <label className="block text-xs text-neutral-400 mb-1">Acceptance Criteria</label>
                                  <div className="space-y-1">
                                    {(r.acList||[]).map((ac, i)=> (
                                      <div key={i} className="flex items-center gap-2">
                                        <input value={ac} onChange={(e)=>{
                                          const list=[...(r.acList||[])]; list[i]=e.target.value; applyTo([r.id], { acList: list });
                                        }} className="flex-1 bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                                        <button className="text-xs px-2 py-1 rounded border border-white/10" onClick={()=>{ const list=[...(r.acList||[])]; list.splice(i,1); applyTo([r.id], { acList: list }); }}>−</button>
                                      </div>
                                    ))}
                                    <button className="text-xs px-2 py-1 rounded border border-white/10" onClick={()=>applyTo([r.id], { acList: [...(r.acList||[]), ""] })}>+ Add AC</button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Labels (comma)</label>
                                    <input value={(r.labels||[]).join(', ')} onChange={(e)=>applyTo([r.id], { labels: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Components (comma)</label>
                                    <input value={(r.components||[]).join(', ')} onChange={(e)=>applyTo([r.id], { components: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Status</label>
                                    <select value={r.status || 'Draft'} onChange={(e)=>applyTo([r.id], { status: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                      <option>Draft</option>
                                      <option>In Dev</option>
                                      <option>In Review</option>
                                      <option>Deployed</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Priority</label>
                                    <select value={r.priority || 'P2'} onChange={(e)=>applyTo([r.id], { priority: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                      <option>P0</option>
                                      <option>P1</option>
                                      <option>P2</option>
                                      <option>P3</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Assignee</label>
                                    <input value={r.assignee||''} onChange={(e)=>applyTo([r.id], { assignee: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" placeholder="@username" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Epic Link</label>
                                    <input value={r.epicLink||''} onChange={(e)=>applyTo([r.id], { epicLink: e.target.value })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" placeholder="EPIC-123" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Story Points</label>
                                    <input type="number" value={r.points||0} onChange={(e)=>applyTo([r.id], { points: Number(e.target.value) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Sync Status</label>
                                    <select value={r.syncStatus || 'drift'} onChange={(e)=>applyTo([r.id], { syncStatus: e.target.value as any })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm">
                                      <option value="in-sync">In Sync</option>
                                      <option value="drift">Drift</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs text-neutral-400 mb-1">Dependencies (comma)</label>
                                  <input value={(r.dependencies||[]).join(', ')} onChange={(e)=>applyTo([r.id], { dependencies: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1 text-sm" />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Sprint</label>
                                    <div className="flex gap-1">
                                      {["M1","M2","M3","Backlog"].map(s => (
                                        <button key={s} className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>applyTo([r.id], { sprint: s as any })}>{s}</button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-400 mb-1">Release</label>
                                    <div className="flex gap-1">
                                      {["R1.0","R1.1","R2.0"].map(rv => (
                                        <button key={rv} className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>applyTo([r.id], { release: rv as any })}>{rv}</button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="mt-4 flex justify-end">
                              <button className="px-3 py-1 rounded-md border border-white/10" onClick={closeDetails}>Close</button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </aside>
              )}

              {/* Approval rail */}
              {approvalOpen && (
                <aside className="w-[380px] shrink-0">
                  <div className="panel-shell">
                    <div className="panel-card p-4 overflow-auto flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-neutral-100">{approvalStatus==='draft' ? 'Submit for Approval' : 'Approval Status'}</div>
                        <button className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>setApprovalOpen(false)}>✕</button>
                      </div>
                      {approvalStatus==='draft' ? (
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-neutral-400 mb-2">Select Approvers</div>
                            {/* Search + Tabs */}
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                value={apprSearch}
                                onChange={(e)=>setApprSearch(e.target.value)}
                                placeholder="Search people or teams..."
                                className="flex-1 h-8 px-2 rounded-md bg-neutral-900 border border-white/10 text-sm"
                              />
                              <div className="inline-flex rounded-md border border-white/10 overflow-hidden text-xs">
                                <button className={`px-2 py-1 hover:bg-white/5 ${apprTab==='people'?'bg-white/5':''}`} onClick={()=>setApprTab('people')}>People</button>
                                <button className={`px-2 py-1 hover:bg-white/5 ${apprTab==='teams'?'bg-white/5':''}`} onClick={()=>setApprTab('teams')}>Teams</button>
                              </div>
                            </div>

                            {apprTab==='people' ? (
                              [
                                { id:1, name:'Sarah Chen', role:'Product Lead', group:'Product' },
                                { id:2, name:'Mike Johnson', role:'Engineering Manager', group:'Engineering' },
                                { id:3, name:'Emily Davis', role:'Design Lead', group:'Design' },
                                { id:4, name:'Alex Kumar', role:'QA Lead', group:'QA' },
                                { id:5, name:'Jessica Park', role:'Marketing Manager', group:'Marketing' },
                              ]
                                .filter(m=> m.name.toLowerCase().includes(apprSearch.toLowerCase()) || m.role.toLowerCase().includes(apprSearch.toLowerCase()))
                                .map(m => (
                                  <label key={m.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                                    <CircleCheck checked={approvalSel.has(m.id)} onChange={()=>{ const n=new Set(approvalSel); n.has(m.id)? n.delete(m.id): n.add(m.id); setApprovalSel(n); }} />
                                    <div className="w-7 h-7 rounded-full bg-neutral-700 grid place-items-center text-[11px]">{m.name.split(' ').map(n=>n[0]).join('')}</div>
                                    <div className="flex-1">
                                      <div className="text-sm text-neutral-200">{m.name}</div>
                                      <div className="text-xs text-neutral-400">{m.role}</div>
                                    </div>
                                  </label>
                                ))
                            ) : (
                              <div className="mt-1">
                                {['Product Leads','Design Council','Payments SteerCo']
                                  .filter(t=> t.toLowerCase().includes(apprSearch.toLowerCase()))
                                  .map((t)=> (
                                    <div key={t} className="px-2 py-1.5 rounded hover:bg-white/5 text-sm">{t}</div>
                                  ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-neutral-400 mb-1">Message (optional)</div>
                            <textarea rows={4} value={approvalNote} onChange={(e)=>setApprovalNote(e.target.value)} className="w-full bg-transparent border border-white/10 rounded p-2 text-sm" placeholder="Add context or notes for reviewers..." />
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50" disabled={approvalSel.size===0} onClick={()=>{ setApprovalStatus('in_review'); setApprovalOpen(false); }}>Submit</button>
                            <button className="px-3 py-2 rounded-md border border-white/10" onClick={()=>setApprovalOpen(false)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 rounded-lg border border-white/10 bg-neutral-800/40">
                            <div className="flex items-center justify-between text-sm"><span className="text-neutral-300">Approval Progress</span><span className="text-neutral-200">2/4 approved</span></div>
                            <div className="h-2 rounded bg-neutral-800 overflow-hidden mt-2"><div className="h-full bg-emerald-500" style={{ width: '50%' }} /></div>
                            <div className="mt-2 text-xs text-neutral-400">Submitted {new Date(Date.now()-1000*60*30).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-200 mb-1">Approvers</div>
                            <div className="space-y-2">
                              {[
                                { name:'Sarah Chen', role:'Product Lead', status:'approved' },
                                { name:'Mike Johnson', role:'Engineering Manager', status:'pending' },
                                { name:'Emily Davis', role:'Design Lead', status:'approved' },
                                { name:'Alex Kumar', role:'QA Lead', status:'reviewing' },
                              ].map(a => (
                                <div key={a.name} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/30 border border-white/5">
                                  <div className="w-8 h-8 rounded-full bg-neutral-700 grid place-items-center text-[11px]">{a.name.split(' ').map(n=>n[0]).join('')}</div>
                                  <div className="flex-1">
                                    <div className="text-sm text-neutral-200">{a.name}</div>
                                    <div className="text-xs text-neutral-400">{a.role}</div>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs border ${a.status==='approved'?'bg-transparent border-green-500/40 text-green-300': a.status==='reviewing'?'bg-transparent border-blue-500/40 text-blue-300':'bg-transparent border-neutral-500/30 text-neutral-300'}`}>{a.status==='approved'?'Approved': a.status==='reviewing'?'Reviewing':'Pending'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neutral-200 mb-1">Activity</div>
                              <div className="space-y-1 text-sm text-neutral-200">
                                <div className="flex items-start gap-2">Sarah Chen approved <span className="text-xs text-neutral-500 ml-auto">{new Date(Date.now()-1000*60*15).toLocaleTimeString()}</span></div>
                                <div className="flex items-start gap-2">Emily Davis approved <span className="text-xs text-neutral-500 ml-auto">{new Date(Date.now()-1000*60*10).toLocaleTimeString()}</span></div>
                                <div className="flex items-start gap-2">Alex Kumar is reviewing <span className="text-xs text-neutral-500 ml-auto">{new Date(Date.now()-1000*60*5).toLocaleTimeString()}</span></div>
                              </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              )}

              {/* Versions rail */}
              {versionsRailOpen && (
                <aside className="w-[360px] shrink-0">
                  <div className="panel-shell">
                    <div className="panel-card p-4 overflow-auto flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-neutral-100">Versions</div>
                        <button className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>setVersionsRailOpen(false)}>✕</button>
                      </div>
                      <div className="mb-3">
                        <button onClick={createNewVersion} className="w-full text-left px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 text-sm">Create new version</button>
                      </div>
                      <div className="text-xs uppercase tracking-wide text-neutral-400 mb-1">History</div>
                      <div className="space-y-1">
                        {versions.map(v => (
                          <button
                            key={v}
                            onClick={()=>{ setCurrentVersion(v); }}
                            className={`w-full text-left px-3 py-2 rounded-md border border-white/5 hover:bg-white/5 text-sm inline-flex items-center justify-between ${v===currentVersion? 'bg-white/5':''}`}
                          >
                            <span>{v}</span>
                            {v===currentVersion && (
                              <span className="px-2 py-0.5 rounded border border-white/10 text-[11px] text-neutral-300">current</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              )}

              {/* Comments rail (always rendered when draft or comments exist) */}
              {(commentDraft || comments.some(c=>!c.resolved)) && (
                <aside className="w-[300px] shrink-0">
                  <div className="panel-shell">
                    <div className="panel-card relative flex-col p-2" style={{ overflow: 'visible', minHeight: (cardRef.current?.getBoundingClientRect?.().height || 600) }}>
                      <div className="relative" style={{ overflow: 'visible' }}>
                        {commentDraft && (
                          <div className="absolute left-2 right-2 z-30" style={{ top: commentDraft.top }}>
                            <div className="rounded-md border border-white/10 bg-neutral-900/95 p-3 shadow-xl pointer-events-auto">
                              <div className="text-xs text-neutral-300 mb-1">👤 Justin Broxton</div>
                              <textarea value={commentDraft.text} onChange={(e)=>setCommentDraft({ ...commentDraft, text: e.target.value })} placeholder="Comment or add others with @" className="w-full h-20 bg-neutral-900 border border-white/10 rounded p-2 text-sm" />
                              <div className="flex justify-end gap-2 mt-2">
                                <button className="px-2 py-1 rounded border border-white/10" onClick={cancelCommentDraft}>Cancel</button>
                                <button className="px-2 py-1 rounded border border-indigo-600 bg-indigo-600 text-white disabled:opacity-50" disabled={!commentDraft.text.trim()} onClick={saveCommentDraft}>Comment</button>
                              </div>
                            </div>
                          </div>
                        )}
                        {comments.filter(c=>!c.resolved).map(c => (
                          <div key={c.id} className="absolute left-2 right-2 z-20" style={{ top: Math.max(0, c.rectsRel[0]?.top || 0) }}>
                            <div className="rounded-md border border-white/10 bg-neutral-900/95 p-3 shadow-xl pointer-events-auto" onClick={()=>setActiveCommentId(prev=> prev===c.id? null : c.id)}>
                              <div className="text-xs text-neutral-300 mb-1">👤 {c.author} • {new Date(c.timestamp).toLocaleTimeString()}</div>
                              <div className="text-sm text-neutral-100 whitespace-pre-wrap">{c.text}</div>
                              {activeCommentId===c.id && (
                                <div className="mt-2">
                                  {c.replies && c.replies.length>0 && (
                                    <div className="mb-2 space-y-1">
                                      {c.replies.map(r=> (<div key={r.id} className="text-xs text-neutral-300"><span className="text-neutral-100">{r.author}</span>: {r.text}</div>))}
                                    </div>
                                  )}
                                  <textarea value={replyDraft?.id===c.id? (replyDraft?.text||'') : ''} onChange={(e)=>setReplyDraft({ id:c.id, text:e.target.value })} placeholder="Reply…" className="w-full h-16 bg-neutral-900 border border-white/10 rounded p-2 text-sm" />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button className="px-2 py-1 rounded border border-white/10" onClick={()=>resolveComment(c.id)}>Resolve</button>
                                    <button className="px-2 py-1 rounded border border-indigo-600 bg-indigo-600 text-white" onClick={()=>addReply(c.id)} disabled={!replyDraft || replyDraft.id!==c.id || !replyDraft.text.trim()}>Reply</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              )}

              </div>
            </div>

          {/* overlays temporarily disabled for build sanity */}



          {/* Legacy overlays removed */}
        </main>
        <style jsx global>{`
          .auto-editor .cm-editor{height:auto !important;}
          .auto-editor .cm-scroller{height:auto !important; overflow:visible !important;}
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px);} to { opacity: 1; transform: translateY(0);} }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          /* subtle tree connector color */
          .border-white\/15{ border-color: rgba(255,255,255,0.15) !important; }
        `}</style>
        {/* Jira Connect modal */}
        <ConnectJiraModal
          open={connectOpen}
          onClose={()=>setConnectOpen(false)}
          url={jiraUrl}
          email={jiraEmail}
          token={jiraToken}
          setUrl={setJiraUrl}
          setEmail={setJiraEmail}
          setToken={setJiraToken}
          status={connectStatus}
          error={connectError}
          onConnect={testAndSaveConnection}
        />
      </div>
    </div>
  );
}

function ConnectJiraModal({ open, onClose, url, email, token, setUrl, setEmail, setToken, status, error, onConnect }: {
  open: boolean;
  onClose: ()=>void;
  url: string;
  email: string;
  token: string;
  setUrl: (v: string)=>void;
  setEmail: (v: string)=>void;
  setToken: (v: string)=>void;
  status: 'idle'|'testing'|'ok'|'error';
  error?: string;
  onConnect: ()=>Promise<void>;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[520px] rounded-xl border border-white/10 bg-neutral-900/95 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-neutral-100">Connect to Jira</div>
          <button className="px-2 py-1 rounded border border-white/10 text-xs" onClick={onClose}>✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Jira URL</label>
            <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://your-domain.atlassian.net" className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Email</label>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@company.com" className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">API Token</label>
              <input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="••••••••" className="w-full bg-neutral-900 border border-white/10 rounded px-2 py-1.5 text-sm" type="password" />
            </div>
          </div>
          {status==='ok' && <div className="text-sm text-emerald-300">Connected ✓</div>}
          {status==='error' && <div className="text-sm text-rose-300">{error || 'Failed to connect'}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button className="px-3 py-1.5 rounded border border-white/10" onClick={onClose}>Close</button>
            <button className="px-3 py-1.5 rounded border border-indigo-600 bg-indigo-600 text-white disabled:opacity-50" disabled={status==='testing'} onClick={onConnect}>{status==='testing' ? 'Testing…' : status==='ok' ? 'Reconnect' : 'Test & Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
