"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { EditorView, placeholder } from "@codemirror/view";
import { TabsBar } from "../../components/TabsBar";
import { TestPrdSidebar } from "../../components/test-prd/Sidebar";
import { PrototypeChat } from "../../components/PrototypeChat";
import { ProtoPane } from "../../components/test-prd/ProtoPane";
import { applyOps, createEmptyScene, type Op } from "../../components/wireframe/ops";
import { ApprovalPanel, getApprovalStatus } from "../../components/approvals/ApprovalPanel";
import * as Popover from "@radix-ui/react-popover";
import { EditableTitle } from "../../components/EditableTitle";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

function load<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : d; } catch { return d; } }
function save<T>(k: string, v: T) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function genId() { return "doc_" + Math.random().toString(36).slice(2, 8); }

export default function RequirementsPage() {
  const { docId } = useParams<{ docId: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const [extensions, setExtensions] = useState<any[]>([]);
  const [view, setView] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const md = await import("@codemirror/lang-markdown");
      const theme = EditorView.theme(
        { "&": { backgroundColor: "#0b0b0b", color: "#e5e7eb" }, ".cm-gutters": { backgroundColor: "#0b0b0b", color: "#9ca3af", border: "none" }, ".cm-activeLine": { backgroundColor: "transparent" }, ".cm-activeLineGutter": { backgroundColor: "transparent" } },
        { dark: true }
      );
      const { headingDecorations } = await import("../../lib/editor/heading");
      const { atMentions } = await import("../../lib/editor/at");
      setExtensions([md.markdown(), EditorView.lineWrapping, theme, headingDecorations, atMentions, placeholder("Draft your awesome PRD here...")]);
    })();
  }, []);

  const presets: Record<string, { title: string; content: string }> = {
    "1001": {
      title: "Add-on Recommendations",
      content: `# Add-on Recommendations\n\nA pre-built PRD for recommending add-ons in the coffee ordering flow.\n\n## Problem\n// Users often miss add-ons that pair well with their order.\n\n## Users\n// Returning buyers ordering during commute.\n\n## Requirements\n- [ ] Show add-on suggestions on Order Summary ::\n- [ ] Track acceptance rate ::\n\n## Acceptance Criteria\n- [ ] Suggestions appear within 400ms \n- [ ] Adding an add-on updates total instantly\n`,
    },
  };
  const sample = useMemo(() => {
    const preset = presets[String(docId)];
    if (preset) return preset.content;
    return load(`doc:${docId}`, "");
  }, [docId]);

  function onChange(v: string) { save(`doc:${docId}`, v); }

  const [protoOpen, setProtoOpen] = useState(!!search?.get("proto"));
  const [protoWide, setProtoWide] = useState(true);
  const [protoScene, setProtoScene] = useState<any>(() => load(`proto:${search?.get("proto") || ""}:scene`, null));
  const [protoScreen, setProtoScreen] = useState<string>("home");

  useEffect(() => { setProtoOpen(!!search?.get("proto")); }, [search]);
  useEffect(() => { const id = search?.get("proto"); if (id) save(`proto:${id}:scene`, protoScene); }, [protoScene, search]);
  // respond to global UI events for sidebar/prototype
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(()=>{
    try { const v = sessionStorage.getItem('ui:sidebar:visible'); return v===null? true : v==='true'; } catch { return true; }
  });
  useEffect(()=>{
    const onSidebar = (e:any)=>{ try{ const d=(e as CustomEvent).detail; setSidebarVisible(!!d?.visible);}catch{}};
    const onProto = (e:any)=>{ try{ const d=(e as CustomEvent).detail; if(typeof d?.open==='boolean') setProtoOpen(!!d.open); if(typeof d?.wide==='boolean') setProtoWide(!!d.wide);}catch{}};
    window.addEventListener('ui:sidebar:set', onSidebar as any);
    window.addEventListener('ui:proto:set', onProto as any);
    return ()=>{ window.removeEventListener('ui:sidebar:set', onSidebar as any); window.removeEventListener('ui:proto:set', onProto as any); };
  },[]);


  function ensureProto() {
    let id = search?.get("proto");
    if (!id) {
      id = genId();
      save(`docproto:${docId}`, id);
      const q = new URLSearchParams(search?.toString());
      q.set("proto", id);
      router.replace(`?${q.toString()}`);
    }
    setProtoOpen(true);
  }

  function insertTemplate(kind: "cuj" | "req" | "ac" | "milestone") {
    if (!view) return;
    const pos = view.state.selection.main.head;
    const id = genId();
    let text = "";
    if (kind === "cuj") text = `\nCUJ: Home → Login → Continue → Home <!-- id:${id} milestone:M0 -->\n`;
    if (kind === "req") text = `\n- [ ] Dropdown on [[Home]] <!-- id:${id} milestone:M1 -->\n`;
    if (kind === "ac") text = `\n- [ ] Continue navigates to [[Checkout]] <!-- id:${id} -->\n`;
    if (kind === "milestone") text = `\n### V1 <!-- id:${id} milestone:M1 -->\n`;
    view.dispatch({ changes: { from: pos, insert: text } });
    view.dispatch({ selection: { anchor: pos + text.length } });
    view.focus();
  }

  // Ensure a tab is opened (and remembered) for this PRD
  useEffect(() => {
    let title = (presets[String(docId)]?.title || 'Untitled Page');
    try { const saved = sessionStorage.getItem(`title:req:${docId}`); if (saved) title = saved; } catch {}
    try {
      const k = 'openTabs';
      const list = JSON.parse(sessionStorage.getItem(k) || '[]');
      if (!Array.isArray(list)) throw new Error('bad');
      if (!list.find((t: any) => t && t.type==='req' && String(t.id)===String(docId))) {
        list.push({ type:'req', id: String(docId), title });
        sessionStorage.setItem(k, JSON.stringify(list));
      } else {
        // update title if changed
        const idx = list.findIndex((t: any)=> t && t.type==='req' && String(t.id)===String(docId));
        if (idx>=0 && list[idx].title!==title) { list[idx].title = title; sessionStorage.setItem(k, JSON.stringify(list)); }
      }
      sessionStorage.setItem(`tabTitle:${docId}`, title);
      window.dispatchEvent(new Event('openTabs:changed'));
    } catch {}
  }, [docId]);

  const [newOpen, setNewOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [apprStatus, setApprStatus] = useState<'NotSubmitted'|'InReview'|'Approved'|'ChangesRequested'>('NotSubmitted');
  useEffect(()=>{
    setApprStatus(getApprovalStatus(String(docId)));
    const onChange = (e: any) => {
      try {
        const detail = (e as CustomEvent).detail as any;
        if (detail && String(detail.docId) === String(docId)) setApprStatus(detail.status);
      } catch {}
    };
    window.addEventListener('approval:changed', onChange as any);
    return () => window.removeEventListener('approval:changed', onChange as any);
  }, [docId]);

  const gridCols = protoOpen
    ? `260px minmax(0,1fr) ${protoWide ? 'minmax(720px,60vw)' : '520px'}`
    : `260px minmax(0,1fr)`;

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <TabsBar />
      <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: gridCols }}>
        <TestPrdSidebar onInsert={insertTemplate} pages={["Untitled Page"]} />
        <div className="min-h-0 flex flex-col relative">
          <div className="panel-shell">
            <div className="panel-card flex flex-col">
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <EditableTitle id={String(docId)} type="req" initial={presets[String(docId)]?.title || 'Untitled Page'} />
                  {apprStatus !== 'NotSubmitted' && (
                    <span className={`px-2 py-0.5 rounded-md border text-xs ${apprStatus==='InReview' ? 'border-indigo-400 text-indigo-200' : apprStatus==='Approved' ? 'border-emerald-400 text-emerald-200' : 'border-amber-400 text-amber-200'}`}>{apprStatus==='InReview'?'In review':apprStatus==='Approved'?'Approved':'Changes requested'}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={()=>setNewOpen(v=>!v)} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">New ▾</button>
                    {newOpen && (
                      <div className="absolute right-0 mt-2 w-44 rounded-md border border-white/10 bg-neutral-900/95 shadow-xl p-1 z-40" onMouseLeave={()=>setNewOpen(false)}>
                        <button onClick={()=>{ setNewOpen(false); setApprovalOpen(true); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-sm">Approval</button>
                        <button onClick={()=>{ setNewOpen(false); ensureProto(); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-sm">Prototype</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ApprovalPanel open={approvalOpen} onClose={()=>setApprovalOpen(false)} docId={String(docId)} />
              <div className="flex-1 min-h-0 overflow-hidden">
                <CodeMirror
                  className="w-full h-full"
                  value={sample}
                  height="100%"
                  theme={undefined}
                  basicSetup={{ lineNumbers: false, foldGutter: false }}
                  extensions={extensions}
                  onChange={onChange}
                  onCreateEditor={(v:any)=>setView(v)}
                />
              </div>
            </div>
          </div>
        </div>
        {protoOpen && (
          <div className="min-h-0 flex flex-col">
            <div className="panel-shell">
              <div className="panel-card flex flex-col">
              <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 480px', gridTemplateRows: 'auto minmax(0,1fr)' }}>
                <div className="px-4 py-2 text-sm text-neutral-300">Prototype (interactive)</div>
                <div className="px-4 py-2 text-sm text-neutral-300 border-l border-white/10 flex items-center gap-2 text-xs">
                  <span className="opacity-70">Device</span>
                  <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs" onClick={()=> setProtoScene((s:any)=> s ? { ...s, device:'mobile' } : s)}>Mobile</button>
                  <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs" onClick={()=> setProtoScene((s:any)=> s ? { ...s, device:'tablet' } : s)}>Tablet</button>
                  <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs" onClick={()=> setProtoScene((s:any)=> s ? { ...s, device:'web' } : s)}>Web</button>
                </div>
                  <div className="min-h-0 overflow-auto p-2">
                    <PrototypeChat
                      headless
                      scene={protoScene || undefined}
                      onBack={()=>{ const q = new URLSearchParams(search?.toString()); q.delete('proto'); router.replace(`?${q.toString()}`); }}
                      onGenerateScene={(scene)=>{ setProtoScene(scene); setProtoScreen(scene.screens[0]?.id || 'home'); }}
                      onApplyOps={(ops: Op[])=>{ setProtoScene((prev: any) => applyOps(prev || createEmptyScene('mobile'), ops)); }}
                    />
                  </div>
                  <div className="min-h-0 border-l border-white/10">
                    <ProtoPane embedded scene={protoScene || undefined} setScene={setProtoScene} currentScreenId={protoScreen} onSelectScreen={setProtoScreen} />
                  </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
