"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { EditorView, placeholder } from "@codemirror/view";
import { TabsBar } from "../../components/TabsBar";
import { TestPrdSidebar } from "../../components/test-prd/Sidebar";
import { PrototypeChat } from "../../components/PrototypeChat";
import { ProtoPane } from "../../components/test-prd/ProtoPane";

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
      const { protoNode } = await import("../../lib/editor/protoNode");
      const { flowNode } = await import("../../lib/editor/flowNode");
      const { atMentions } = await import("../../lib/editor/at");
      const exts: any[] = [md.markdown(), EditorView.lineWrapping, theme, headingDecorations, protoNode, flowNode, atMentions, placeholder("Draft your awesome PRD here...")];
      setExtensions(exts);
    })();
  }, [docId]);

  const presets: Record<string, { title: string; content: string }> = {
    "1001": {
      title: "Add-on Recommendations",
      content: `# Add-on Recommendations

## Overview
Boost average order value (AOV) and delight guests with relevant, low‑friction add‑ons during the order journey. Keep the experience fast and respectful (no spammy dialogs).

- Goal: +3–5% AOV on mobile within 6 weeks.
- Positioning: Lightweight, contextual suggestions that feel like a barista’s helpful nudge.
- Surfaces: Order Summary, Item Details, Checkout (fallback).
- Constraints: keep total decision time < **2s**; never block payment; fully accessible.

## Users
Primary: Returning buyers placing coffee on their commute.
Secondary: New buyers browsing seasonal or featured items.

- Needs: fast checkout, relevant pairings (pastry, alt milk, extra shot).
- Pain points: too many choices; add‑ons easy to miss; interruptions feel pushy.
- JTBD: “When I order a latte, help me quickly add what I usually enjoy.”

## Solution
Contextual, inline suggestions the guest can accept in one tap with instant total update.

\`\`\`flow title=Recommendations user flow
\`\`\`

### Entry Points
1) **Order Summary** — up to 2 inline suggestions beneath the cart list.
2) **Item Details** — during customization, surface a relevant booster (e.g., extra shot).
3) **Checkout (fallback)** — one dismissible banner if nothing shown earlier.

### Ranking Inputs
- Item pairings (espresso → croissant), time of day, guest history (repeat), seasonal, inventory.
- Business rules: cap to **2 suggestions per session**; suppress after dismiss.

### States
- **Default**: Two compact cards (image/name/price) with one‑tap “Add”.
- **Added**: Toast “Added to order” and instant total update.
- **Empty**: No container if confidence < threshold.
- **Dismissed**: Do not re‑show in session.

### Performance & Accessibility
- TTI for suggestions < **400ms** after page load; tap‑to‑add total update < **100ms**.
- Keyboard reachable, focus ring, screen‑reader labels.

### Telemetry
- impression_addon, tap_addon, add_addon_success, dismiss_addon.
- Attributes: surface, addon_id, price, currency, session_id, is_repeat_guest.

## Requirements
- [ ] Show up to two suggestions on **Order Summary** :: ranked & deduped
- [ ] **Tap to add** updates total within **100ms** :: optimistic update
- [ ] Suggestions **never** block Apple/Google Pay
- [ ] Suggestions are keyboard navigable and **screen‑reader labeled**
- [ ] **Do not re‑show** dismissed suggestions in same session
- [ ] Suppress on low confidence and low inventory

## Acceptance Criteria
- [ ] Guests can add a suggested pastry with one tap from Order Summary
- [ ] Adding an add‑on instantly increases the order total and shows a toast
- [ ] No suggestions render when confidence < threshold (no empty container)
- [ ] Suggestion never interrupts the payment sheet
- [ ] Dismissing suppresses suggestions for the remainder of the session

## Flows
1) Guest opens Order Summary → 2 suggestions render → taps “Chocolate Croissant” → toast appears, total updates.
2) Guest customizes Latte → sees “Extra shot” booster → taps → returns to Summary with updated price.
3) Guest dismisses suggestion → no more suggestions that session.

## Metrics
- **Primary**: AOV uplift (%), add‑on attach rate (%)
- **Guardrails**: Checkout conversion (no drop), time‑to‑pay (< 2s p95), dismiss rate
- **Diagnostics**: impressions/taps by surface, repeat attach rate

## Risks & Mitigations
- Overexposure feels pushy → cap frequency + easy dismissal
- Irrelevant pairings → tune model with feedback and time of day
- Performance regressions → async prefetch + light cards

## Open Questions
- Should seasonal items over‑index during morning hours?
- How do we treat guests with severe allergies?
- Is there a store‑level opt‑out for inventory concerns?

## Launch Plan
- **M0**: static rules (top pairings by item) on Order Summary only
- **M1**: add Item Details booster + checkout fallback; add telemetry
- **M2**: add lightweight personalization (time of day, repeat guest), inventory signal

---

## Requirements (Asset)
- [ ] Surface two highest‑ranked add‑ons below cart list :: Order Summary
- [ ] Tap‑to‑add latency < 100ms (optimistic) :: performance
- [ ] Dismiss suppresses suggestions for session :: UX
- [ ] Accessibility: keyboard focus + labels :: a11y
- [ ] Suppress when confidence < threshold or inventory low :: quality

## Notes
Keep the UI visually quiet; cards feel like a helpful nudge rather than a modal.
`,
    },
  };
  const sample = useMemo(() => {
    const preset = presets[String(docId)];
    if (preset) return preset.content;
    return load(`doc:${docId}`, "");
  }, [docId]);

  function onChange(v: string) { save(`doc:${docId}`, v); }

  const [protoOpen, setProtoOpen] = useState(!!search?.get("proto"));
  const [protoScene, setProtoScene] = useState<any>(null);
  const [protoScreen, setProtoScreen] = useState<string>("menu");
  const [online, setOnline] = useState<"checking"|"online"|"offline">("checking");

  useEffect(() => { setProtoOpen(!!search?.get("proto")); }, [search]);
  useEffect(() => { const id = search?.get("proto"); if (id) save(`proto:${id}:scene`, protoScene); }, [protoScene, search]);
  useEffect(()=>{
    let cancelled = false;
    async function ping(){
      try { const r = await fetch('/api/proto/agent'); const j = await r.json(); if(!cancelled) setOnline(j?.ok?'online':'offline'); }
      catch { if(!cancelled) setOnline('offline'); }
    }
    ping(); const t = setInterval(ping, 30000); return ()=>{ cancelled=true; clearInterval(t); };
  },[]);
  // respond to global UI events for sidebar/prototype
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(()=>{
    try { const v = sessionStorage.getItem('ui:sidebar:visible'); return v===null? true : v==='true'; } catch { return true; }
  });
  useEffect(()=>{
    const onSidebar = (e:any)=>{ try{ const d=(e as CustomEvent).detail; setSidebarVisible(!!d?.visible);}catch{}};
    const onProto = (e:any)=>{ try{ const d=(e as CustomEvent).detail; if(typeof d?.open==='boolean') setProtoOpen(!!d.open); }catch{}};
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

  // LLM-like typing: write PRD with sections and an embedded prototype node
  useEffect(() => {
    const onWrite = () => {
      if (!view) return;
      const prd = `# Coffee App — Add‑on Recommendations\n\n## Overview\nWe are building a mobile coffee ordering experience focused on speed and AOV (average order value). The app lets guests browse the menu, add items, review a cart, and checkout. At checkout, we surface contextual add‑on recommendations (e.g., a pastry or an extra shot) that can be added with one tap.\n\n## Problem\nGuests often miss relevant add‑ons during mobile ordering because suggestions are either not shown, shown too late, or are interruptive dialogs that slow down checkout. This leads to a lower AOV and a less delightful experience.\n\n## Users\n- Commuters re‑ordering common drinks on a time budget.\n- New guests exploring featured or seasonal items.\n- Staff who rely on clear orders (avoid confusion and long custom notes).\n\n## Solution\nA fast, distraction‑free ordering flow with inline, contextual add‑on suggestions that never block payment. Recommendations appear on the Checkout page, can be added in one tap, and update totals instantly.\n\n## User Journeys\n1) Repeat guest opens app → adds Latte → opens Cart → Checkout → sees two suggestions (Croissant, Extra shot) → taps Add → total updates → Place order.\n2) New guest explores Featured → adds Cold Brew → Cart → Checkout → ignores suggestions → Place order.\n3) Guest dismisses a suggestion → it does not reappear for the session (same surface).\n\n## Detailed Requirements\n- [ ] Menu shows items with name, price, and one‑tap Add CTA.\n- [ ] Cart lists items and total; Clear resets items.\n- [ ] Checkout page renders up to two ranked add‑on cards with image, name, price, and Add CTA.\n- [ ] Adding an add‑on updates total within 100ms (optimistic).\n- [ ] Suggestions never block Apple/Google Pay; they remain inline and dismissible.\n- [ ] Suppress suggestions if confidence is low or inventory is low.\n- [ ] Accessibility: keyboard focus order, visible focus ring, ARIA labels for recommendation cards and Add buttons.\n\n## Non‑Goals\n- Full personalization engine; we will start with simple rules and sample pairings.\n- Complex checkout flows (tips, coupons, addresses); wireframe placeholders only.\n\n## Metrics\n- Primary: AOV uplift (%), add‑on attach rate (% of orders with add‑on).\n- Guardrails: Checkout conversion rate, time‑to‑pay (p95 < 2s), dismiss rate.\n- Diagnostics: impressions/taps by surface, repeat attach rate, latency to update total.\n\n## Risks & Mitigations\n- Overexposure may feel pushy → cap suggestions to 2 per session and provide an easy Skip.\n- Irrelevant pairings → tune rules; incorporate time of day; add a fallback suggestion.\n- Latency on total updates → optimistic update with background confirmation.\n\n## Open Questions\n- Should we prefetch recommendations at Cart or wait until Checkout?\n- Do we show different suggestions for guests with past add‑on history?\n\n## Acceptance Criteria\n- [ ] From Checkout, guest can add a suggested item with one tap → total updates immediately.\n- [ ] Skip or Continue keeps guest on Checkout and does not block payment.\n- [ ] With low confidence, no suggestions appear and layout remains stable.\n- [ ] Screen readers announce suggestion name and price before the Add button.\n\n## Happy‑path Flow\n\u0060\u0060\u0060flow title=Checkout with add‑ons\n[{"id":"s1","label":"Open Cart","note":"Items present"},{"id":"s2","label":"Tap Checkout","note":"Navigate to Checkout"},{"id":"s3","label":"Render suggestions","note":"Up to two cards"},{"id":"s4","label":"Add suggestion","note":"Total updates instantly"},{"id":"s5","label":"Place order","note":"Confirmation"}]\n\u0060\u0060\u0060\n\n## Prototype\n\u0060\u0060\u0060proto\n<!-- prototype embed -->\n\u0060\u0060\u0060\n`;
      // Clear doc then type the PRD progressively
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: '' } });
      let i = 0;
      const id = setInterval(() => {
        const ch = prd[i++] || '';
        view.dispatch({ changes: { from: view.state.doc.length, insert: ch } });
        if (i >= prd.length) clearInterval(id);
      }, 10);
    };
    window.addEventListener('editor:write_prd', onWrite);
    return () => window.removeEventListener('editor:write_prd', onWrite);
  }, [view]);

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
  const [commentsOpen, setCommentsOpen] = useState(false);
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
    const onRequestAdd = (e:any)=>{ try{ const d=(e as CustomEvent).detail; if(String(d?.docId)===String(docId)) setCommentsOpen(true); }catch{} };
    window.addEventListener('comments:requestAdd', onRequestAdd as any);
    return () => { window.removeEventListener('approval:changed', onChange as any); window.removeEventListener('comments:requestAdd', onRequestAdd as any); };
  }, [docId]);

  // Right column fits chat + 420px prototype. Make chat roomier with a simple fixed 960px.
  const gridCols = protoOpen ? `260px minmax(0,1fr) 960px` : `260px minmax(0,1fr)`;

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
              {/* comments disabled in demo mode */}
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
                {/* Header spanning both subpanes */}
                <div className="px-4 py-2 text-sm text-neutral-300 inline-flex items-center gap-2">
                  Prototype (interactive)
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${online==='checking'?'bg-neutral-500 animate-pulse':online==='online'?'bg-emerald-500':'bg-rose-500'}`}
                    title={online==='online'?'Online':'Offline'}
                  />
                </div>
                {/* Split: chat grows, prototype fixed width */}
                <div className="flex-1 min-h-0 flex">
                  <div className="min-h-0 min-w-0 flex-1 overflow-auto p-2">
                    <PrototypeChat
                      headless
                      onBack={()=>{ const q = new URLSearchParams(search?.toString()); q.delete('proto'); router.replace(`?${q.toString()}`); }}
                    />
                  </div>
                  <div className="min-h-0 w-[420px] shrink-0 border-l border-white/10">
                    <ProtoPane embedded />
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
