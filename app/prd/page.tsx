"use client";

import NextDynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EditorView, placeholder } from "@codemirror/view";
import { TabsBar } from "../components/TabsBar";
import { TestPrdSidebar } from "../components/test-prd/Sidebar";
import { PrototypeChat } from "../components/PrototypeChat";
import { ProtoPane } from "../components/test-prd/ProtoPane";


const CodeMirror = NextDynamic(() => import("@uiw/react-codemirror"), { ssr: false });

// This page reads search params client-side; disable static generation so Next
// doesn't try to prerender it. This aligns with Next.js guidance when using
// useSearchParams directly in a Client Component page.
export const dynamic = 'force-dynamic';

// Note: This is a client page. We avoid forcing dynamic rendering here; instead we wrap
// useSearchParams usage in a Suspense boundary below to satisfy Next.js.

function PRDInner() {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [view, setView] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const md = await import("@codemirror/lang-markdown");
      const theme = EditorView.theme(
        {
          "&": { backgroundColor: "#0b0b0b", color: "#e5e7eb" },
          ".cm-gutters": { backgroundColor: "#0b0b0b", color: "#9ca3af", border: "none" },
          ".cm-activeLine": { backgroundColor: "transparent" },
          ".cm-activeLineGutter": { backgroundColor: "transparent" },
        },
        { dark: true }
      );
      const { headingDecorations } = await import("../lib/editor/heading");
      const { atMentions } = await import("../lib/editor/at");
      setExtensions([
        md.markdown(),
        EditorView.lineWrapping,
        theme,
        headingDecorations,
        atMentions,
        placeholder("Draft your awesome PRD here..."),
      ]);
    })();
  }, []);

  const search = useSearchParams();
  const sample = useMemo(() => {
    const isNew = !!search?.get("new");
    if (isNew) return "";
    return "# PRD\n\nStart documenting your product requirements.";
  }, [search]);
  // Prototype overlay state (keeps user on this PRD tab)
  const [protoOpen, setProtoOpen] = useState(false);
  const [protoWide, setProtoWide] = useState(true);
  const [protoScene, setProtoScene] = useState<any>(null);
  const [protoScreen, setProtoScreen] = useState<string>("menu");

  function genId() { return "blk_" + Math.random().toString(36).slice(2, 8); }
  function insertTemplate(kind: "cuj" | "req" | "ac" | "milestone") {
    if (!view) return;
    const pos = view.state.selection.main.head;
    let text = "";
    const id = genId();
    if (kind === "cuj") text = `\nCUJ: Home → Login → Continue → Home <!-- id:${id} milestone:M0 -->\n`;
    if (kind === "req") text = `\n- [ ] Dropdown on [[Home]] <!-- id:${id} milestone:M1 -->\n`;
    if (kind === "ac") text = `\n- [ ] Continue navigates to [[Checkout]] <!-- id:${id} -->\n`;
    if (kind === "milestone") text = `\n### V1 <!-- id:${id} milestone:M1 -->\n`;
    view.dispatch({ changes: { from: pos, insert: text } });
    view.dispatch({ selection: { anchor: pos + text.length } });
    view.focus();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <TabsBar />
      <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '260px minmax(0,1fr)' }}>
        <TestPrdSidebar onInsert={insertTemplate} pages={["Untitled Page"]} />
        <div className="min-h-0 flex flex-col relative">
          {/* top bar */}
        <div className="px-4 py-2 border-b border-white/10 bg-neutral-900/80 backdrop-blur flex items-center justify-between">
          <div className="font-medium">{search?.get("new") ? "Untitled Page" : "PRD"}</div>
          <div className="flex items-center gap-2">
            <div className="text-xs opacity-70">Markdown</div>
            {!protoOpen ? (
              <button onClick={()=>setProtoOpen(true)} className="px-2 py-1 rounded-md border border-white/10 bg-indigo-600 text-white text-xs">Prototype</button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={()=>setProtoWide((v)=>!v)} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">{protoWide ? 'Shrink' : 'Expand'}</button>
                <button onClick={()=>setProtoOpen(false)} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Close</button>
              </div>
            )}
          </div>
        </div>
          {/* editor area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeMirror
              value={sample}
              height="100%"
              theme={undefined}
              basicSetup={{ lineNumbers: false, foldGutter: false }}
              extensions={extensions}
              onCreateEditor={(v:any)=>setView(v)}
            />
          </div>
          {protoOpen && (
            <>
              <div className="absolute inset-0 bg-black/50" onClick={()=>setProtoOpen(false)} />
              <div className={`absolute inset-0 h-full w-full bg-neutral-950/95 backdrop-blur border-l border-white/10 shadow-2xl transition-all`}>
                <div className="px-3 py-2 border-b border-white/10 text-sm text-neutral-300">Prototype (interactive)</div>
                <div className="h-full grid grid-rows-[auto_1fr]" style={{ gridTemplateColumns: "minmax(0,1fr) 420px" }}>
                  <div className="min-h-0 overflow-auto p-2">
                    <PrototypeChat headless onBack={()=>setProtoOpen(false)} />
                  </div>
                  <ProtoPane />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PRDPage() {
  return (
    <Suspense fallback={<div className="p-4 text-neutral-400">Loading…</div>}>
      <PRDInner />
    </Suspense>
  );
}
