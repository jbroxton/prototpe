"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { TabsBar } from "../../components/TabsBar";
import { EditableTitle } from "../../components/EditableTitle";
import { AlertTriangle, Bell, MoreVertical, Play, Pause as PauseIcon, CheckCircle2, Clock } from "lucide-react";

export default function LaunchPage() {
  const { launchId } = useParams<{ launchId: string }>();
  const router = useRouter();
  const defaultTitle = useMemo(() => (
    String(launchId) === '9001' ? 'Sample Launch: Intelligent Search' : 'New Launch'
  ), [launchId]);

  // Register this Launch as an open tab and keep title in session
  useEffect(() => {
    try {
      let title = defaultTitle;
      try { const saved = sessionStorage.getItem(`title:launch:${launchId}`); if (saved) title = saved; } catch {}
      const k = "openTabs";
      const list = JSON.parse(sessionStorage.getItem(k) || "[]");
      const arr = Array.isArray(list) ? list : [];
      const idx = arr.findIndex((t: any) => t && t.type === "launch" && String(t.id) === String(launchId));
      if (idx === -1) {
        arr.push({ type: "launch", id: String(launchId), title });
      } else if (arr[idx].title !== title) {
        arr[idx].title = title;
      }
      sessionStorage.setItem(k, JSON.stringify(arr));
      sessionStorage.setItem(`tabTitle:${launchId}`, title);
      window.dispatchEvent(new Event("openTabs:changed"));
    } catch {}
  }, [launchId, defaultTitle]);

  type Status = "Todo" | "In Progress" | "Done";
  type ACStatus = "Open" | "Passed" | "Failed";
  type Epic = { id: string; title: string; status: Status; jiraKey?: string };
  type CodeStatus = 'dev' | 'review' | 'merged';
  type QAStatus = 'not_started' | 'in_qa' | 'passed' | 'failed';
  type DeployInfo = { sha: string; ts: number };
  type Story = {
    id: string;
    epicId: string;
    title: string;
    status: Status; // legacy high-level
    jiraKey?: string;
    slices?: StorySlice[]; // per-release state
  };
  type AC = { id: string; storyId: string; text: string; status: ACStatus; testrailCaseId?: string; defectKey?: string };
  type UATRun = { id: string; status: "Not Started" | "In Progress" | "Completed"; pass: number; fail: number } | null;
  type Cohort = 'Global' | 'US' | 'EU';
  type WaveStatus = 'scheduled' | 'in_progress' | 'paused' | 'completed';
  type Wave = { id: string; label: string; cohort: Cohort; targetPercent: number; status: WaveStatus; startedAt?: number; endedAt?: number; plannedStartAt?: number; plannedEndAt?: number };
  type Rollout = { waves: Wave[]; currentPercent: number; paused?: boolean; note?: string; scheduleSource?: 'local' | 'external'; sourceName?: string };
  type Release = { id: string; label: string; version: string; freezeAt?: number; gaAt?: number };
  type StorySlice = { releaseId: string; milestone?: string; release?: string; progress?: { code: CodeStatus; qa: QAStatus; deploy?: { staging?: DeployInfo; prod?: DeployInfo } } };
  type ACSlice = { releaseId: string; status: ACStatus; defectKey?: string };

  const storageKey = useMemo(()=>`launch:data:${launchId}`,[launchId]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [acs, setAcs] = useState<AC[]>([]);
  const [uat, setUat] = useState<UATRun>(null);
  const [flash, setFlash] = useState<string>("");
  const [filter, setFilter] = useState<'all'|'dev'|'review'|'qa'|'uat'|'ready'|'prod'|'blocked'>('all');
  const [finalizedAt, setFinalizedAt] = useState<number | undefined>(undefined);
  const [releaseNotes, setReleaseNotes] = useState<string>("");
  const [finalizeSummary, setFinalizeSummary] = useState<{ shipped: string[]; partial: string[]; deferred: string[] } | null>(null);
  const [rollout, setRollout] = useState<Rollout | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [currentReleaseId, setCurrentReleaseId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rolloutMenuOpen, setRolloutMenuOpen] = useState(false);
  const [collapsedEpics, setCollapsedEpics] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<null | { type: 'story'|'ac'; id: string }>(null);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);

  const CodeMirror = useMemo(() => dynamic(() => import("@uiw/react-codemirror"), { ssr: false }), []);
  const [cmExtensions, setCmExtensions] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const { markdown } = await import("@codemirror/lang-markdown");
        const { EditorView } = await import("@codemirror/view");
        const theme = EditorView.theme(
          { "&": { backgroundColor: "transparent", color: "#e5e7eb" }, ".cm-gutters": { backgroundColor: "transparent", color: "#9ca3af", border: "none" } },
          { dark: true }
        );
        setCmExtensions([markdown(), EditorView.lineWrapping, theme]);
      } catch {}
    })();
  }, []);

  function seedDemo() {
    const EP1 = genId('EP');
    const EP2 = genId('EP');
    const US1 = genId('US');
    const US2 = genId('US');
    const US3 = genId('US');
    const US4 = genId('US');
    const US5 = genId('US');
    const ac = (sid:string, text:string, status:ACStatus) => ({ id: genId('AC'), storyId: sid, text, status, testrailCaseId: genId('CASE') });
    const seededEpics: Epic[] = [
      { id: EP1, title: "Search Backend Improvements", status: 'In Progress', jiraKey: 'DEMO-1201' },
      { id: EP2, title: "Search UX Enhancements", status: 'In Progress', jiraKey: 'DEMO-1202' }
    ];
    const rel1: Release = { id: genId('R'), label: 'M1', version: '1.0.0', gaAt: Date.now() - 86400000 };
    const rel2: Release = { id: genId('R'), label: 'M2', version: '1.1.0' };
    setReleases([rel1, rel2]);
    setCurrentReleaseId(rel1.id);
    const seededStories: Story[] = [
      { id: US1, epicId: EP1, title: "Indexing pipeline for content", status: 'Done', jiraKey: 'DEMO-2211', slices: [
        { releaseId: rel1.id, milestone: 'M1', release: rel1.version, progress: { code: 'merged', qa: 'passed', deploy: { prod: { sha: demoSha(), ts: Date.now()-86400000 } } } },
        { releaseId: rel2.id, milestone: 'M2', release: rel2.version, progress: { code: 'merged', qa: 'passed' } }
      ] },
      { id: US2, epicId: EP1, title: "Typo tolerance and synonyms", status: 'In Progress', jiraKey: 'DEMO-2212', slices: [
        { releaseId: rel1.id, milestone: 'M1', release: rel1.version, progress: { code: 'merged', qa: 'passed' } },
        { releaseId: rel2.id, milestone: 'M2', release: rel2.version, progress: { code: 'merged', qa: 'in_qa' } }
      ] },
      { id: US3, epicId: EP1, title: "Ranking: recency + popularity", status: 'Todo', jiraKey: 'DEMO-2213', slices: [
        { releaseId: rel1.id, milestone: 'M1', release: rel1.version, progress: { code: 'review', qa: 'not_started' } },
      ] },
      { id: US4, epicId: EP2, title: "Search box with autocomplete", status: 'Done', jiraKey: 'DEMO-2311', slices: [
        { releaseId: rel1.id, milestone: 'M1', release: rel1.version, progress: { code: 'merged', qa: 'passed', deploy: { staging: { sha: demoSha(), ts: Date.now()-3600000 } } } }
      ] },
      { id: US5, epicId: EP2, title: "Results page with filters", status: 'In Progress', jiraKey: 'DEMO-2312', slices: [
        { releaseId: rel1.id, milestone: 'M1', release: rel1.version, progress: { code: 'merged', qa: 'in_qa' } },
      ] }
    ];
    const seededAcs: AC[] = [
      // US1 (Prod)
      ac(US1, "Index runs daily and completes < 15m", 'Passed'),
      ac(US1, "Manual reindex can be triggered from admin", 'Passed'),
      // US2 (UAT failed)
      ac(US2, "Queries with 1-char typo still return intended result", 'Failed'),
      ac(US2, "Synonyms (login=sign in) applied", 'Passed'),
      // US3 (Dev/Review)
      ac(US3, "Fresh content ranks above older unless engagement high", 'Open'),
      // US4 (Ready - all passed, staging deployed)
      ac(US4, "Autocomplete suggests within 300ms", 'Passed'),
      ac(US4, "Arrow keys navigate suggestions with screen reader labels", 'Passed'),
      // US5 (In QA with a failure and open)
      ac(US5, "Filters: Type, Owner, Updated date", 'Open'),
      ac(US5, "Applying filters updates results without full reload", 'Failed')
    ];
    const pass = seededAcs.filter(a=>a.status==='Passed').length;
    const fail = seededAcs.filter(a=>a.status==='Failed').length;
    const seededUat: UATRun = { id: genId('RUN'), status: (pass+fail>0 ? 'In Progress':'Not Started'), pass, fail };
    const now = Date.now();
    const seededRollout: Rollout = {
      currentPercent: 25,
      note: 'Halted at 25% due to error-rate spike in EU; resume after fix',
      scheduleSource: 'local',
      sourceName: 'Local schedule',
      waves: [
        { id: genId('W'), label: 'Internal 1%', cohort: 'Global', targetPercent: 1, status: 'completed', startedAt: now-72*3600*1000, endedAt: now-71*3600*1000, plannedStartAt: now-73*3600*1000, plannedEndAt: now-71*3600*1000 },
        { id: genId('W'), label: '5% Global', cohort: 'Global', targetPercent: 5, status: 'completed', startedAt: now-70*3600*1000, endedAt: now-60*3600*1000, plannedStartAt: now-70*3600*1000, plannedEndAt: now-60*3600*1000 },
        { id: genId('W'), label: '25% Global', cohort: 'Global', targetPercent: 25, status: 'paused', startedAt: now-48*3600*1000, plannedStartAt: now-48*3600*1000 },
        { id: genId('W'), label: 'EU hold', cohort: 'EU', targetPercent: 0, status: 'paused', plannedStartAt: now-48*3600*1000 },
        { id: genId('W'), label: '100% Global', cohort: 'Global', targetPercent: 100, status: 'scheduled', plannedStartAt: now+24*3600*1000 },
      ]
    };
    setEpics(seededEpics); setStories(seededStories); setAcs(seededAcs); setUat(seededUat); setRollout(seededRollout);
    try { localStorage.setItem(storageKey, JSON.stringify({ epics: seededEpics, stories: seededStories, acs: seededAcs, uat: seededUat, rollout: seededRollout, releases: [rel1, rel2], currentReleaseId: rel1.id })); } catch {}
    try {
      const tkey = `title:launch:${launchId}`; const saved = sessionStorage.getItem(tkey);
      if (!saved || saved === 'New Launch') { sessionStorage.setItem(tkey, 'Sample Launch: Intelligent Search'); window.dispatchEvent(new Event('openTabs:changed')); }
    } catch {}
    setFlash("Loaded demo data"); setTimeout(()=>setFlash(""), 2000);
  }

  // Seed a default rollout for brand-new launches (waves only)
  function seedDefaultRollout() {
    const now = Date.now();
    const r: Rollout = {
      currentPercent: 0,
      scheduleSource: 'local',
      sourceName: 'Local schedule',
      waves: [
        { id: genId('W'), label: 'Internal 1%', cohort: 'Global', targetPercent: 1, status: 'scheduled', plannedStartAt: now+6*3600*1000 },
        { id: genId('W'), label: '5% Global', cohort: 'Global', targetPercent: 5, status: 'scheduled', plannedStartAt: now+24*3600*1000 },
        { id: genId('W'), label: '25% Global', cohort: 'Global', targetPercent: 25, status: 'scheduled', plannedStartAt: now+48*3600*1000 },
        { id: genId('W'), label: 'EU 10%', cohort: 'EU', targetPercent: 10, status: 'scheduled', plannedStartAt: now+72*3600*1000 },
        { id: genId('W'), label: '100% Global', cohort: 'Global', targetPercent: 100, status: 'scheduled', plannedStartAt: now+96*3600*1000 },
      ]
    };
    setRollout(r);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const isDemo = ['9001','demo','search-demo'].includes(String(launchId));
      if (raw) {
        const parsed = JSON.parse(raw);
        setEpics(parsed.epics || []);
        setStories(parsed.stories || []);
        setAcs(parsed.acs || []);
        setUat(parsed.uat || null);
        setFinalizedAt(parsed.finalizedAt);
        setReleaseNotes(parsed.releaseNotes || "");
        setRollout(parsed.rollout || null);
        setReleases(parsed.releases || []);
        setCurrentReleaseId(parsed.currentReleaseId || (parsed.releases && parsed.releases[0]?.id) || null);
        const empty = (!parsed.epics || parsed.epics.length===0) && (!parsed.stories || parsed.stories.length===0) && (!parsed.acs || parsed.acs.length===0);
        if (isDemo && empty) seedDemo();
      } else if (isDemo) {
        seedDemo();
      } else {
        // For brand-new launches, always seed a default rollout schedule
        seedDefaultRollout();
      }
    } catch {}
  }, [storageKey, launchId]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ epics, stories, acs, uat, finalizedAt, releaseNotes, rollout, releases, currentReleaseId })); } catch {}
  }, [storageKey, epics, stories, acs, uat, finalizedAt, releaseNotes, rollout, releases, currentReleaseId]);

  function genId(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }

  const totalAC = acs.length || 0;
  const passedAC = acs.filter(a=>a.status==='Passed').length;
  const percentComplete = totalAC ? Math.round((passedAC/totalAC)*100) : 0;

  function demoSha() {
    return Math.random().toString(16).slice(2, 9);
  }

  // Per-release helpers
  function sliceFor(story: Story, relId: string | null): StorySlice {
    const rid = relId || releases[0]?.id || '';
    const found = (story.slices || []).find(s => s.releaseId === rid);
    return found || { releaseId: rid, progress: { code: 'dev', qa: 'not_started' } };
  }

  // Rollout helpers (demo only)
  const currentCoverage = rollout?.currentPercent ?? 0;
  // Quick stats for the StatusBoard stepper
  // Story-centric stage classification
  type StoryStage = 'draft'|'tickets'|'qa'|'rollout';
  function storyStage(story: Story): StoryStage {
    const prog = sliceFor(story, currentReleaseId).progress || { code:'dev', qa:'not_started' };
    const sAcs = acs.filter(a=>a.storyId===story.id);
    const anyAcTouched = sAcs.some(a=> a.status==='Passed' || a.status==='Failed');
    const rollout = !!prog.deploy?.prod;
    if (rollout) return 'rollout';
    if (prog.qa==='in_qa' || prog.qa==='passed' || prog.qa==='failed' || anyAcTouched) return 'qa';
    if (prog.code==='review' || prog.code==='merged') return 'tickets';
    return 'draft';
  }
  const stageCounts = useMemo(() => {
    const c = { draft:0, tickets:0, qa:0, rollout:0 } as Record<StoryStage, number>;
    for (const s of stories) c[storyStage(s)]++;
    return c;
  }, [stories, currentReleaseId, releases, acs]);
  function advanceWave() {
    if (!rollout) return;
    const idx = rollout.waves.findIndex(w => w.status==='scheduled' || w.status==='paused' || w.status==='in_progress');
    if (idx === -1) return;
    const waves = rollout.waves.map((w,i)=> i===idx ? { ...w, status: 'in_progress', startedAt: w.startedAt || Date.now() } : w);
    setRollout({ ...rollout, waves, paused: false, note: undefined });
    toast(`Advanced to wave: ${waves[idx].label}`);
  }
  function pauseRollout(reason?: string) {
    if (!rollout) return;
    const idx = rollout.waves.findIndex(w => w.status==='in_progress');
    if (idx === -1) return;
    const waves = rollout.waves.map((w,i)=> i===idx ? { ...w, status: 'paused' } : w);
    setRollout({ ...rollout, waves, paused: true, note: reason || 'Paused by PM' });
    toast('Rollout paused');
  }
  function completeWave() {
    if (!rollout) return;
    const idx = rollout.waves.findIndex(w => w.status==='in_progress');
    if (idx === -1) return;
    const completed = { ...rollout.waves[idx], status: 'completed', endedAt: Date.now() };
    let waves = rollout.waves.slice();
    waves[idx] = completed;
    // Bump coverage to this wave's target
    const nextPercent = Math.max(rollout.currentPercent, completed.targetPercent);
    // Move next scheduled to in_progress if any
    const nextIdx = waves.findIndex((w,i)=> i>idx && w.status==='scheduled');
    if (nextIdx !== -1) waves[nextIdx] = { ...waves[nextIdx], status: 'in_progress', startedAt: Date.now() };
    setRollout({ ...rollout, waves, currentPercent: nextPercent, paused: false, note: undefined });
    toast('Wave completed');
  }

  function Step({ label, meta, onClick }: { label: string; meta: string; onClick?: ()=>void }) {

  function formatDate(ts?: number) {
    if (!ts) return "—";
    try {
      const d = new Date(ts);
      return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return "—"; }
  }

  function addEpic() {
    const e = { id: genId('EP'), title: `New Epic ${epics.length+1}`, status: 'Todo' as Status };
    setEpics(prev => [...prev, e]);
  }
  function addStory(epicId: string) {
    const count = stories.filter(s=>s.epicId===epicId).length + 1;
    const s = { id: genId('US'), epicId, title: `New story ${count}`, status: 'Todo' as Status, slices: [{ releaseId: currentReleaseId || releases[0]?.id || 'R', progress: { code: 'dev', qa: 'not_started' } }] } as Story;
    setStories(prev => [...prev, s]);
  }
    return (
      <button onClick={onClick} className="text-left px-3 py-2 rounded-md border border-white/10 bg-transparent hover:bg-white/5">
        <div className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</div>
        <div className="mt-0.5 text-neutral-200">{meta}</div>
      </button>
    );
  }

  function formatDate(ts?: number) {
    if (!ts) return "—";
    try {
      const d = new Date(ts);
      return d.toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return "—"; }
  }
  // simple approval submit via storage (dropdown action)
  function submitForApproval() {
    try {
      localStorage.setItem(`approval:${launchId}:status`, JSON.stringify('InReview'));
      sessionStorage.setItem(`approval:${launchId}:status`, JSON.stringify('InReview'));
      toast('Submitted for approval');
    } catch {}
    setMenuOpen(false);
  }

  // Release tabs (M1/M2/M3-like) under the header
  function addRelease() {
    const idx = (releases?.length || 0) + 1;
    const r = { id: genId('R'), label: `M${idx}`, version: `1.${idx-1}.0` } as Release;
    setReleases(prev => [...prev, r]);
    setCurrentReleaseId(r.id);
  }
  function ReleaseTabs() {
    return (
      <div className="px-1 py-1 flex items-center gap-2 overflow-x-auto">
        {(releases||[]).map(r => (
          <button key={r.id} onClick={()=> setCurrentReleaseId(r.id)}
            className={`px-3 py-1.5 rounded-md border text-sm whitespace-nowrap ${currentReleaseId===r.id? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200' : 'bg-neutral-900 border-white/10 text-neutral-300 hover:bg-neutral-800'}`}
            title={`${r.label} • ${r.version}`}
          >
            {r.label} • {r.version}
          </button>
        ))}
        <button onClick={addRelease} className="px-2 py-1.5 rounded-md border border-white/10 bg-neutral-900 text-neutral-300 hover:bg-neutral-800" title="Add release">+</button>
      </div>
    );
  }

  function createDemoRollout() {
    const seeded: Rollout = {
      currentPercent: 1,
      note: 'Demo rollout seeded',
      waves: [
        { id: genId('W'), label: 'Internal 1%', cohort: 'Global', targetPercent: 1, status: 'completed', startedAt: Date.now()-3*3600*1000, endedAt: Date.now()-2*3600*1000 },
        { id: genId('W'), label: '5% Global', cohort: 'Global', targetPercent: 5, status: 'completed', startedAt: Date.now()-2*3600*1000, endedAt: Date.now()-90*60*1000 },
        { id: genId('W'), label: '25% Global', cohort: 'Global', targetPercent: 25, status: 'in_progress', startedAt: Date.now()-60*60*1000 },
        { id: genId('W'), label: 'EU hold', cohort: 'EU', targetPercent: 0, status: 'paused' },
        { id: genId('W'), label: '100% Global', cohort: 'Global', targetPercent: 100, status: 'scheduled' },
      ]
    };
    setRollout(seeded);
    toast('Added demo rollout');
  }

  function storyUatSummary(story: Story) {
    const sAcs = acs.filter(a=>a.storyId===story.id);
    const pass = sAcs.filter(a=>a.status==='Passed').length;
    const fail = sAcs.filter(a=>a.status==='Failed').length;
    const total = sAcs.length;
    const status: 'not_started'|'in_progress'|'passed'|'failed' = total===0 ? 'not_started' : (fail>0 ? 'failed' : (pass===total ? 'passed' : pass>0 ? 'in_progress' : 'not_started'));
    return { status, pass, fail, total };
  }

  function storyState(story: Story): 'dev'|'review'|'qa'|'uat'|'ready'|'prod'|'blocked' {
    const prog = sliceFor(story, currentReleaseId).progress || { code: 'dev', qa: 'not_started' };
    if (prog?.deploy?.prod) return 'prod';
    const u = storyUatSummary(story);
    if (u.status==='failed') return 'blocked';
    if (u.status==='passed') return 'ready';
    if (u.status==='in_progress') return 'uat';
    if (prog.qa==='in_qa' || prog.qa==='passed' || prog.qa==='failed') return 'qa';
    if (prog.code==='review') return 'review';
    return 'dev';
  }

  const breakdown = useMemo(() => {
    const initial = { dev:0, review:0, qa:0, uat:0, ready:0, prod:0, blocked:0 } as Record<'dev'|'review'|'qa'|'uat'|'ready'|'prod'|'blocked', number>;
    for (const s of stories) initial[storyState(s)]++;
    return initial;
  }, [stories, acs]);

  function computeStage(): string {
    if (uat && uat.status !== 'Not Started' && acs.some(a=>a.status==='Failed')) return 'In QA';
    if (stories.some(s=>s.status==='In Progress')) return 'In Dev';
    if (passedAC>0 && passedAC===totalAC) return 'Ready';
    return 'Draft';
  }
  const stage = computeStage();

  // Stubs
  function pushToJira() {
    let nextEpics = epics.map(e=> e.jiraKey ? e : ({...e, jiraKey: `DEMO-${1000 + Math.floor(Math.random()*9000)}`}));
    let nextStories = stories.map(s=> s.jiraKey ? s : ({...s, jiraKey: `DEMO-${1000 + Math.floor(Math.random()*9000)}`}));
    setEpics(nextEpics); setStories(nextStories);
    toast(`Pushed ${nextEpics.filter(e=>e.jiraKey).length} epics and ${nextStories.filter(s=>s.jiraKey).length} stories to Jira (stub)`);
  }
  function createUatRun() {
    const run: UATRun = { id: genId('RUN'), status: 'In Progress', pass: 0, fail: 0 };
    // assign testrail case ids if missing
    setAcs(prev => prev.map(a => a.testrailCaseId ? a : { ...a, testrailCaseId: genId('CASE') }));
    setUat(run);
    toast(`Created UAT run with ${acs.length} cases (stub)`);
  }
  function markAcStatus(id: string, status: ACStatus) {
    setAcs(prev => prev.map(a => a.id===id ? { ...a, status, defectKey: status==='Failed' ? (a.defectKey || `BUG-${1000+Math.floor(Math.random()*9000)}`) : undefined } : a));
    if (uat) {
      const pass = acs.filter(a=> (a.id===id? status: a.status) === 'Passed').length;
      const fail = acs.filter(a=> (a.id===id? status: a.status) === 'Failed').length;
      setUat({ ...uat, pass, fail, status: pass+fail===acs.length? 'Completed': 'In Progress' });
    }
  }
  function toast(msg: string) {
    setFlash(msg); setTimeout(()=>setFlash(""), 2500);
  }
  function updateStory(id: string, mut: (s: Story)=>Story) {
    setStories(prev => prev.map(s => s.id===id ? mut(s) : s));
  }
  function setCodeStatus(id: string, code: CodeStatus) { updateStory(id, s => ({ ...s, progress: { ...(s.progress||{}), code } })); }
  function setQaStatus(id: string, qa: QAStatus) { updateStory(id, s => ({ ...s, progress: { ...(s.progress||{}), qa } })); }
  function deploy(id: string, env: 'staging'|'prod') {
    const info: DeployInfo = { sha: demoSha(), ts: Date.now() };
    updateStory(id, s => ({ ...s, progress: { ...(s.progress||{ code:'merged', qa:'passed' }), deploy: { ...(s.progress?.deploy||{}), [env]: info } } }));
    toast(`Deployed ${id} to ${env}`);
  }

  function FailuresChip({ count, onClick }: { count: number; onClick?: ()=>void }) {
    const color = count>0 ? 'bg-rose-600/20 text-rose-200 border-rose-500/30' : 'bg-neutral-900 text-neutral-300 border-white/20';
    return (
      <button onClick={onClick} className={`px-2 py-1 rounded-md border inline-flex items-center gap-1 text-xs ${color}`} title={count>0? `${count} failing AC${count>1?'s':''}`:'No failures'}>
        <AlertTriangle className={`w-3.5 h-3.5 ${count>0? 'text-rose-300':'text-neutral-400'}`} />
        {count>0 ? `${count} fail` : 'No fails'}
      </button>
    );
  }

  // Simple bell with context-aware notifications for PM
  function LaunchNotifications({ launchId, stories, acs, uat, onJump }: { launchId: string; stories: Story[]; acs: AC[]; uat: UATRun; onJump?: (t: 'blockers'|'review'|'ready')=>void }) {
    const [open, setOpen] = useState(false);
    const failing = acs.filter(a=>a.status==='Failed');
    const inReview = stories.filter(s=> (sliceFor(s, currentReleaseId).progress?.code||'dev')==='review');
    const readyForProd = stories.filter(s=> storyState(s)==='ready');
    const approvalStatus = (()=>{
      try { return (localStorage.getItem(`approval:${launchId}:status`)||sessionStorage.getItem(`approval:${launchId}:status`)||'NotSubmitted').replaceAll('"',''); } catch { return 'NotSubmitted'; }
    })();
    const items: { id:string; title:string; sub?:string; action?: ()=>void }[] = [];
    if (failing.length) items.push({ id:'uat_fail', title:`UAT failing on ${failing.length} AC${failing.length>1?'s':''}`, sub:failing.slice(0,3).map(a=>a.id).join(', '), action: ()=> onJump?.('blockers') });
    if (inReview.length) items.push({ id:'pr_review', title:`PRs awaiting review: ${inReview.length}`, sub: inReview.slice(0,3).map(s=>s.title).join(' • '), action: ()=> onJump?.('review') });
    if (readyForProd.length) items.push({ id:'ready_prod', title:`Ready for prod: ${readyForProd.length} story${readyForProd.length>1?'ies':''}`, sub: readyForProd.slice(0,3).map(s=>s.title).join(' • '), action: ()=> onJump?.('ready') });
    if (uat && uat.status==='Completed' && !failing.length) items.push({ id:'uat_pass', title:'UAT completed', sub:`Pass ${uat.pass} / Fail ${uat.fail}` });
    if (approvalStatus==='Approved') items.push({ id:'legal_ok', title:'Approvals: Approved', sub:'All approval gates passed' });
    if (approvalStatus==='ChangesRequested') items.push({ id:'appr_changes', title:'Approvals: Changes requested', sub:'See approval details' });

    return (
      <div className="relative">
        <button onClick={()=>setOpen(v=>!v)} className="p-2 rounded-md border border-white/10 bg-neutral-900 hover:bg-neutral-800" title="Notifications">
          <div className="relative">
            <Bell className="w-4 h-4 text-neutral-300" />
            {items.length>0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] leading-4 text-center">{items.length}</span>}
          </div>
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-[360px] rounded-xl border border-white/10 bg-neutral-900/95 shadow-2xl p-2 z-40">
            <div className="px-1 py-1 text-sm font-medium">Notifications</div>
            {items.length===0 ? (
              <div className="px-2 py-2 text-sm text-neutral-400">No alerts</div>
            ) : (
              <div className="max-h-64 overflow-auto">
                {items.map((n)=> (
                  <button key={n.id} onClick={()=>{ setOpen(false); n.action?.(); }} className="w-full text-left px-2 py-2 rounded-md border border-white/10 bg-neutral-800/40 hover:bg-neutral-800 mb-2">
                    <div className="text-sm text-neutral-200">{n.title}</div>
                    {n.sub && <div className="text-xs text-neutral-400 mt-0.5">{n.sub}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Finalize + Rollover + Release Notes
  function classifyStories() {
    const shipped: string[] = []; const partial: string[] = []; const deferred: string[] = [];
    for (const s of stories) {
      const prog = sliceFor(s, currentReleaseId).progress || { code:'dev', qa:'not_started' };
      const sAcs = acs.filter(a=>a.storyId===s.id);
      const hasFailed = sAcs.some(a=>a.status==='Failed');
      const anyOpen = sAcs.some(a=>a.status==='Open');
      const prod = !!prog.deploy?.prod;
      const staging = !!prog.deploy?.staging;
      if (prod && !hasFailed && !anyOpen) shipped.push(s.id);
      else if (staging || prog.code==='merged') partial.push(s.id);
      else deferred.push(s.id);
    }
    return { shipped, partial, deferred };
  }
  function generateReleaseNotes(cls: { shipped: string[]; partial: string[]; deferred: string[] }) {
    const lines: string[] = [];
    lines.push(`# Release Notes — ${defaultTitle}`);
    lines.push("");
    lines.push(`Launched: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push(`## Shipped`);
    const shippedStories = stories.filter(s=> cls.shipped.includes(s.id));
    if (shippedStories.length===0) lines.push("- None");
    for (const s of shippedStories) {
      const passed = acs.filter(a=>a.storyId===s.id && a.status==='Passed').slice(0,3);
      const bullets = passed.length ? ` — ${passed.map(a=>a.text).join('; ')}` : '';
      lines.push(`- ${s.title} (${s.id})${bullets}`);
    }
    lines.push("");
    lines.push(`## Deferred or Partial`);
    const deferredStories = stories.filter(s=> cls.deferred.includes(s.id) || cls.partial.includes(s.id));
    if (deferredStories.length===0) lines.push("- None");
    for (const s of deferredStories) {
      const sAcs = acs.filter(a=>a.storyId===s.id);
      const failed = sAcs.filter(a=>a.status==='Failed');
      const prog = sliceFor(s, currentReleaseId).progress || { code:'dev', qa:'not_started' };
      const reason = failed.length ? `UAT failures: ${failed.map(a=>a.id).join(', ')}` : (prog.deploy?.prod ? 'Open ACs' : (prog.deploy?.staging ? 'Staging only' : 'Not deployed'));
      lines.push(`- ${s.title} (${s.id}) — ${reason}`);
    }
    lines.push("");
    lines.push(`## Known Issues`);
    const fails = stories.flatMap(s => acs.filter(a=>a.storyId===s.id && a.status==='Failed').map(a => ({s,a})));
    if (fails.length===0) lines.push("- None");
    for (const {s,a} of fails) lines.push(`- ${s.title}: ${a.text} ${a.defectKey?`(${a.defectKey})`:''}`);
    return lines.join("\n");
  }
  function finalizeLaunch() {
    const cls = classifyStories();
    setFinalizeSummary(cls);
    const notes = generateReleaseNotes(cls);
    setReleaseNotes(notes);
    setFinalizedAt(Date.now());
    toast(`Finalized: ${cls.shipped.length} shipped, ${cls.partial.length} partial, ${cls.deferred.length} deferred`);
  }
  function copyNotes() {
    try { navigator.clipboard.writeText(releaseNotes); toast('Copied release notes'); } catch { toast('Copy failed'); }
  }
  function createRolloverLaunch() {
    const cls = finalizeSummary || classifyStories();
    const id = String(Math.floor(10000 + Math.random()*90000));
    const carryIds = new Set([...cls.partial, ...cls.deferred]);
    const newStories = stories.filter(s=> carryIds.has(s.id)).map(s => ({
      ...s,
      slices: [{ releaseId: 'R_NEXT', milestone: 'M2', release: 'TBD', progress: { code: 'review', qa: 'not_started' } }],
      jiraKey: s.jiraKey,
    }));
    const allowedStoryIds = new Set(newStories.map(s=>s.id));
    const newAcs = acs.filter(a=> allowedStoryIds.has(a.storyId) && a.status!=='Passed').map(a => ({ ...a, status: 'Open' as ACStatus }));
    const newEpics = epics.filter(e => newStories.some(s=>s.epicId===e.id));
    const payload = { epics: newEpics, stories: newStories, acs: newAcs, uat: null, finalizedAt: undefined, releaseNotes: "" };
    try { localStorage.setItem(`launch:data:${id}`, JSON.stringify(payload)); } catch {}
    try {
      const k = 'openTabs';
      const list = JSON.parse(sessionStorage.getItem(k) || '[]');
      const arr = Array.isArray(list) ? list : [];
      arr.push({ type: 'launch', id: String(id), title: 'Rollover Launch' });
      sessionStorage.setItem(k, JSON.stringify(arr));
      window.dispatchEvent(new Event('openTabs:changed'));
    } catch {}
    router.push(`/launch/${id}`);
  }

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <TabsBar />
      <div className="flex-1 min-h-0 grid grid-cols-1">
        <div className="panel-shell">
          <div className="panel-card flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 inline-flex items-center gap-1 relative">
                <EditableTitle id={String(launchId)} type="launch" initial={defaultTitle} />
                <button onClick={()=> setMenuOpen(v=>!v)} className="px-1.5 py-0.5 rounded-md border border-white/10 bg-neutral-900 text-xs">▾</button>
                {menuOpen && (
                  <div className="absolute left-0 top-8 z-40 w-56 rounded-md border border-white/10 bg-neutral-900/95 shadow-xl p-1">
                    <button onClick={submitForApproval} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-sm">Submit for approval</button>
                    <button onClick={()=>{ setMenuOpen(false); finalizeLaunch(); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-sm">Finalize launch</button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <LaunchNotifications
                  launchId={String(launchId)}
                  stories={stories}
                  acs={acs}
                  uat={uat}
                  onJump={(target)=>{
                    if (target==='blockers') { setFilter('blocked'); try{ document.getElementById('blockers-section')?.scrollIntoView({behavior:'smooth'});}catch{} }
                    if (target==='review') { setFilter('review'); }
                    if (target==='ready') { setFilter('ready'); }
                  }}
                />
                <div className="text-xs text-neutral-400">Launch ID: {String(launchId)}</div>
              </div>
            </div>

            {/* Release tabs */}
            <ReleaseTabs />

            {/* Overview */}
            <div className="p-3 rounded-md border border-white/20 bg-transparent">
              <div className="text-sm font-medium mb-2">Overview</div>
              <textarea className="w-full min-h-16 text-sm bg-neutral-950 border-none rounded-md p-2" placeholder="Explain the goal and scope of this launch" defaultValue={''} />
            </div>

            {/* If finalized, show notes up top */}
            {releaseNotes && (
              <div className="p-3 rounded-md border border-white/10 bg-neutral-900/60">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Launch notes</div>
                  <div className="flex items-center gap-2 text-xs">
                    <button onClick={()=> setReleaseNotes(generateReleaseNotes(classifyStories()))} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">Refresh</button>
                    <button onClick={copyNotes} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">Copy</button>
                  </div>
                </div>
                <textarea className="w-full min-h-32 text-sm bg-neutral-950 border border-white/10 rounded-md p-2" value={releaseNotes} onChange={(e)=> setReleaseNotes(e.target.value)} />
              </div>
            )}

            {/* Status + Rollout combined */}
            <section id="rollout-section" className="p-3 rounded-md border border-white/20 bg-transparent">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Status & rollout</div>
                <div className="text-xs text-neutral-400">Stage: {stage} • Complete: {percentComplete}% • Coverage: {currentCoverage}%{rollout?.paused? ' • Paused':''}</div>
              </div>
              {/* Flow stepper */}
              <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <Step label="Draft" meta={`${stageCounts.draft} stories`} onClick={()=>{ setFilter('dev'); document.getElementById('stories-section')?.scrollIntoView({behavior:'smooth'}); }} />
                <Step label="Tickets" meta={`${stageCounts.tickets} stories`} onClick={()=>{ setFilter('review'); document.getElementById('stories-section')?.scrollIntoView({behavior:'smooth'}); }} />
                <Step label="QA" meta={`${stageCounts.qa} stories`} onClick={()=>{ setFilter('qa'); document.getElementById('stories-section')?.scrollIntoView({behavior:'smooth'}); }} />
                <Step label="Rollout" meta={`${stageCounts.rollout} stories • ${currentCoverage}%`} onClick={()=>{ document.getElementById('rollout-section')?.scrollIntoView({behavior:'smooth'}); }} />
              </div>
              {rollout ? (
                <>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <div className="opacity-70">Rollout • {currentCoverage}% coverage {rollout.paused? '• Paused':''}</div>
                    <div className="relative">
                      <button onClick={()=> setRolloutMenuOpen(v=>!v)} className="px-2 py-1 rounded-md border border-white/10 bg-transparent hover:bg-white/5 inline-flex items-center gap-1">
                        <MoreVertical className="w-4 h-4"/>
                        Manage
                      </button>
                      {rolloutMenuOpen && (
                        <div className="absolute right-0 mt-2 w-44 rounded-md border border-white/10 bg-neutral-900/95 shadow-xl p-1 z-40">
                          <button onClick={()=>{ setRolloutMenuOpen(false); advanceWave(); }} className="w-full text-left px-2 py-1 rounded-md hover:bg-white/10 inline-flex items-center gap-2"><Play className="w-3.5 h-3.5"/> Advance wave</button>
                          <button onClick={()=>{ setRolloutMenuOpen(false); pauseRollout(); }} className="w-full text-left px-2 py-1 rounded-md hover:bg-white/10 inline-flex items-center gap-2"><PauseIcon className="w-3.5 h-3.5"/> Pause rollout</button>
                          <button onClick={()=>{ setRolloutMenuOpen(false); completeWave(); }} className="w-full text-left px-2 py-1 rounded-md hover:bg-white/10 inline-flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/> Complete wave</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {rollout.note && <div className="mb-2 text-xs text-amber-300">{rollout.note}</div>}
                  <div className="space-y-2">
                    {rollout.waves.map(w => (
                      <div key={w.id} className="grid grid-cols-[minmax(0,260px)_1fr_160px_100px] gap-2 items-center text-xs">
                        <div className="text-neutral-300 truncate">{w.label} <span className="text-neutral-500">· {w.cohort}</span></div>
                        <div className="h-1.5 rounded bg-white/10 overflow-hidden">
                          <div className={`h-full ${w.status==='completed'?'bg-emerald-500/70':w.status==='in_progress'?'bg-indigo-500/60':w.status==='paused'?'bg-amber-500/60':'bg-neutral-600/60'}`} style={{ width: `${w.targetPercent}%` }} />
                        </div>
                        <div className="text-neutral-400 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{formatDate(w.plannedStartAt)}</div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] ${w.status==='completed'?'border-emerald-400 text-emerald-200':w.status==='in_progress'?'border-indigo-400 text-indigo-200':w.status==='paused'?'border-amber-400 text-amber-200':'border-white/20 text-neutral-300'}`}>{w.status.replace('_',' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm text-neutral-300">
                  <div>No rollout configured. In a real setup, we ingest LaunchDarkly flag changes here.</div>
                  <button onClick={createDemoRollout} className="ml-2 px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Add demo rollout</button>
                </div>
              )}
            </section>

            {/* Breakdown removed; consolidated into Stories board */}


            {/* Stories • AC • UAT combined */}
            <section id="stories-section" className="p-3 rounded-md border border-white/20 bg-transparent">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Stories</div>
                <div className="flex items-center gap-2 text-xs">
                  <span>Release:</span>
                  <select className="bg-neutral-800 border border-white/10 rounded px-1 py-0.5" value={currentReleaseId||''} onChange={(e)=> setCurrentReleaseId(e.target.value)}>
                    {(releases||[]).map(r=> (<option key={r.id} value={r.id}>{r.label} • {r.version}</option>))}
                  </select>
                  <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={()=>{ const r={ id: genId('R'), label: `M${(releases.length+1)}`, version: `1.${releases.length}.0` }; setReleases([...releases, r]); setCurrentReleaseId(r.id); }}>Add release</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-neutral-400 sticky top-0 bg-neutral-950/60 backdrop-blur border-b border-white/10">
                    <tr>
                      <th className="text-left font-normal p-2"><input type="checkbox" onChange={(e)=> setSelectedStories(e.target.checked? stories.map(s=>s.id): [])} checked={selectedStories.length>0 && selectedStories.length===stories.length} aria-label="Select all"/></th>
                      <th className="text-left font-normal p-2">Story</th>
                      <th className="text-left font-normal p-2">Code</th>
                      <th className="text-left font-normal p-2">QA</th>
                      <th className="text-left font-normal p-2">UAT</th>
                      <th className="text-left font-normal p-2">Milestone</th>
                      <th className="text-left font-normal p-2">Release</th>
                      <th className="text-left font-normal p-2">Deploy</th>
                      <th className="text-left font-normal p-2">Blockers</th>
                      <th className="text-left font-normal p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stories.filter(s=> filter==='all' ? true : storyState(s)===filter).map(s => {
                      const prog = (sliceFor(s, currentReleaseId).progress) || { code:'dev', qa:'not_started' };
                      const u = storyUatSummary(s);
                      const sAcs = acs.filter(a=>a.storyId===s.id);
                      const blockers = sAcs.filter(a=>a.status==='Failed');
                      return (
                        <tr key={s.id} className="group border-t border-white/5 odd:bg-white/5 hover:bg-white/10">
                          <td className="p-2 align-top">
                            <input type="checkbox" checked={selectedStories.includes(s.id)} onChange={(e)=> setSelectedStories(prev=> e.target.checked? [...new Set([...prev, s.id])]: prev.filter(x=>x!==s.id) )} aria-label={`Select ${s.title}`}/>
                          </td>
                          <td className="p-1 align-top cursor-pointer" onClick={()=> setDetail({ type:'story', id: s.id })}>
                            <div className="font-medium text-neutral-200">{s.title}</div>
                            <div className="text-xs text-neutral-500">{s.jiraKey || '—'} • {s.id}</div>
                          </td>
                          <td className="p-2 align-top">
                            <select className="bg-neutral-800 border border-white/10 rounded px-1 py-0.5 text-xs" value={prog.code} onChange={(e)=> setCodeStatus(s.id, e.target.value as CodeStatus)}>
                              <option value="dev">Dev</option>
                              <option value="review">Review</option>
                              <option value="merged">Merged</option>
                            </select>
                          </td>
                          <td className="p-2 align-top">
                            <select className="bg-neutral-800 border border-white/10 rounded px-1 py-0.5 text-xs" value={prog.qa} onChange={(e)=> setQaStatus(s.id, e.target.value as QAStatus)}>
                              <option value="not_started">Not started</option>
                              <option value="in_qa">In QA</option>
                              <option value="passed">Passed</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                          <td className="p-2 align-top">
                            <span className={`px-2 py-0.5 rounded-md text-xs ${u.status==='failed'?'bg-rose-500/15 text-rose-300 border border-rose-500/20':u.status==='passed'?'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20':u.status==='in_progress'?'bg-amber-500/15 text-amber-300 border border-amber-500/20':'bg-neutral-800 text-neutral-300 border border-white/10'}`}>{u.status.replace('_',' ')} {u.total>0?`(${u.pass}/${u.total})`:''}</span>
                          </td>
                          <td className="p-2 align-top">
                            <select className="bg-neutral-800 border border-white/10 rounded px-1 py-0.5 text-xs" value={sliceFor(s,currentReleaseId).milestone || ''} onChange={(e)=> updateStory(s.id, st => { const rel=currentReleaseId||releases[0]?.id||''; const slices= st.slices? [...st.slices]:[]; const idx=slices.findIndex(x=>x.releaseId===rel); if(idx>-1) slices[idx]={...slices[idx], milestone:e.target.value}; else slices.push({ releaseId: rel, milestone:e.target.value }); return { ...st, slices }; })}>
                              <option value="">—</option>
                              <option value="M0">M0</option>
                              <option value="M1">M1</option>
                              <option value="M2">M2</option>
                              <option value="M3">M3</option>
                            </select>
                          </td>
                          <td className="p-2 align-top">
                            <input className="bg-neutral-800 border border-white/10 rounded px-1 py-0.5 text-xs w-28" placeholder="1.2.3" value={sliceFor(s,currentReleaseId).release || ''} onChange={(e)=> updateStory(s.id, st => { const rel=currentReleaseId||releases[0]?.id||''; const slices= st.slices? [...st.slices]:[]; const idx=slices.findIndex(x=>x.releaseId===rel); if(idx>-1) slices[idx]={...slices[idx], release:e.target.value}; else slices.push({ releaseId: rel, release:e.target.value }); return { ...st, slices }; })} />
                          </td>
                          <td className="p-2 align-top">
                            <div className="flex items-center gap-1 text-xs">
                              <span className={`px-2 py-0.5 rounded-md border ${prog.deploy?.staging?'border-indigo-500/30 text-indigo-300':'border-white/10 text-neutral-300'}`}>Staging</span>
                              <span className={`px-2 py-0.5 rounded-md border ${prog.deploy?.prod?'border-indigo-500/30 text-indigo-300':'border-white/10 text-neutral-300'}`}>Prod</span>
                            </div>
                          </td>
                          <td className="p-2 align-top text-right">
                            <div className="inline-flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-xs px-2 py-0.5 rounded-md border border-white/10 bg-transparent hover:bg-white/5" onClick={()=> deploy(s.id, 'staging')}>Stage</button>
                              <button className="text-xs px-2 py-0.5 rounded-md border border-white/10 bg-transparent hover:bg-white/5" onClick={()=> deploy(s.id, 'prod')}>Prod</button>
                              <button className="text-xs px-2 py-0.5 rounded-md border border-white/10 bg-transparent hover:bg-white/5 inline-flex items-center"><MoreVertical className="w-3.5 h-3.5"/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {selectedStories.length>0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-neutral-400">Bulk actions for {selectedStories.length}:</span>
                    <label>Milestone
                      <select className="ml-1 bg-neutral-800 border border-white/10 rounded px-1 py-0.5" onChange={(e)=>{ const v=e.target.value; if(!v) return; setStories(prev=> prev.map(s=> selectedStories.includes(s.id)? { ...s, slices:(()=>{ const rel=currentReleaseId||releases[0]?.id||''; const slices=s.slices? [...s.slices]:[]; const idx=slices.findIndex(x=>x.releaseId===rel); if(idx>-1) slices[idx]={...slices[idx], milestone:v}; else slices.push({ releaseId: rel, milestone:v }); return slices; })() } : s)); }}>
                        <option value="">—</option>
                        <option value="M0">M0</option>
                        <option value="M1">M1</option>
                        <option value="M2">M2</option>
                        <option value="M3">M3</option>
                      </select>
                    </label>
                    <label>Release
                      <input className="ml-1 bg-neutral-800 border border-white/10 rounded px-1 py-0.5 w-24" placeholder="1.2.3" onBlur={(e)=>{ const v=e.currentTarget.value; if(!v) return; setStories(prev=> prev.map(s=> selectedStories.includes(s.id)? { ...s, slices:(()=>{ const rel=currentReleaseId||releases[0]?.id||''; const slices=s.slices? [...s.slices]:[]; const idx=slices.findIndex(x=>x.releaseId===rel); if(idx>-1) slices[idx]={...slices[idx], release:v}; else slices.push({ releaseId: rel, release:v }); return slices; })() } : s)); }} />
                    </label>
                    <button className="ml-2 px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={()=> setSelectedStories([])}>Clear</button>
                  </div>
                )}
              </div>
            </section>

            {/* Blockers section removed; surfaced via bell + row flags */}
            {/* Finalize moved to header; notes shown near top */}
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={finalizeLaunch} className="px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-600/20 text-emerald-200 text-xs">Finalize launch</button>
              <button onClick={pushToJira} className="px-2 py-1 rounded-md border border-white/10 bg-indigo-600 text-white text-xs">Push to Jira (stub)</button>
              {String(launchId)==='9001' && (
                <button onClick={()=>{ try { localStorage.removeItem(storageKey); sessionStorage.removeItem(`title:launch:${launchId}`); } catch {}; seedDemo(); }} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Reset demo</button>
              )}
              {flash && <span className="text-xs text-neutral-400">{flash}</span>}
            </div>

            {/* Consolidated: Epics and UAT inline with Stories board */}
{/* Details drawer (simple) */}
            {detail && (
              <section className="p-3 rounded-md border border-white/10 bg-neutral-900/60">
                {detail.type==='story' ? (
                  (()=>{
                    const s = stories.find(x=>x.id===detail.id);
                    if (!s) return null as any;
                    const sAcs = acs.filter(a=>a.storyId===s.id);
                    return (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Story details</div>
                          <button className="text-xs px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={()=> setDetail(null)}>Close</button>
                        </div>
                        <input className="bg-neutral-800 border border-white/10 rounded px-2 py-1 text-sm" defaultValue={s.title} onBlur={(e)=> updateStory(s.id, st => ({ ...st, title: e.currentTarget.value }))} />
                        <div className="flex items-center gap-2 text-xs">
                          {(releases||[]).map(r => (
                            <button key={r.id} onClick={()=> setCurrentReleaseId(r.id)} className={`px-2 py-1 rounded-md border ${currentReleaseId===r.id? 'bg-white/10 border-white/20':'bg-neutral-800 border-white/10'}`}>{r.label} • {r.version}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <label>Milestone
                            <select className="w-full bg-neutral-800 border border-white/10 rounded px-1 py-0.5" value={(sliceFor(s,currentReleaseId).milestone)||''} onChange={(e)=> updateStory(s.id, st => { const rel=currentReleaseId||releases[0]?.id||''; const slices= st.slices? [...st.slices]:[]; const idx=slices.findIndex(x=>x.releaseId===rel); if(idx>-1) slices[idx]={...slices[idx], milestone:e.target.value}; else slices.push({ releaseId: rel, milestone:e.target.value }); return { ...st, slices }; })}>
                              <option value="">—</option><option value="M0">M0</option><option value="M1">M1</option><option value="M2">M2</option><option value="M3">M3</option>
                            </select>
                          </label>
                          <label>Release
                            <input className="w-full bg-neutral-800 border border-white/10 rounded px-1 py-0.5" value={(sliceFor(s,currentReleaseId).release)||''} onChange={(e)=> updateStory(s.id, st => { const rel=currentReleaseId||releases[0]?.id||''; const slices= st.slices? [...st.slices]:[]; const idx=slices.findIndex(x=>x.releaseId===rel); if(idx>-1) slices[idx]={...slices[idx], release:e.target.value}; else slices.push({ releaseId: rel, release:e.target.value }); return { ...st, slices }; })} />
                          </label>
                          <label>Jira
                            <input readOnly className="w-full bg-neutral-900 border border-white/10 rounded px-1 py-0.5" value={s.jiraKey||'—'} />
                          </label>
                        </div>
                        <div className="text-sm font-medium mt-1">Acceptance Criteria</div>
                        <div className="grid gap-2">
                          {sAcs.map(a => (
                            <div key={a.id} className="rounded border border-white/10 p-2">
                              <div className="flex items-center justify-between mb-2 text-xs">
                                <div className="text-neutral-400">{a.id}</div>
                                <select className="bg-neutral-800 border border-white/10 rounded px-1 py-0.5" value={a.status} onChange={(e)=> markAcStatus(a.id, e.target.value as any)}>
                                  <option>Open</option><option>Passed</option><option>Failed</option>
                                </select>
                              </div>
                              <div className="min-h-[64px]">
                                {cmExtensions.length>0 ? (
                                  <CodeMirror value={a.text} onChange={(v:any)=> setAcs(prev=> prev.map(x=> x.id===a.id? { ...x, text: v } : x))} basicSetup={{ lineNumbers:false }} height="120px" extensions={cmExtensions} />
                                ) : (
                                  <textarea className="w-full h-24 bg-neutral-900 border border-white/10 rounded p-2 text-sm" defaultValue={a.text} onBlur={(e)=> setAcs(prev=> prev.map(x=> x.id===a.id? { ...x, text: e.currentTarget.value } : x))} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : null}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
