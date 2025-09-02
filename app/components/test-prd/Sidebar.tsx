"use client";

import { Folder, Image as ImageIcon, Plus, Search, Blocks } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function TestPrdSidebar({ onInsert, pages }: { onInsert?: (type: "cuj" | "req" | "ac" | "milestone") => void; pages?: string[] }) {
  const [tab, setTab] = useState<"pages" | "assets">("pages");
  // Session-persisted pages list (demo only)
  const storageKey = 'pages:list';
  const [pageList, setPageList] = useState<string[]>(() => {
    try {
      const v = sessionStorage.getItem(storageKey);
      if (v) return JSON.parse(v);
    } catch {}
    return pages && pages.length ? pages : ["Untitled Page"];  
  });
  useEffect(()=>{
    try { sessionStorage.setItem(storageKey, JSON.stringify(pageList)); } catch {}
  }, [pageList]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement|null>(null);
  useEffect(()=>{ if (editingIndex!==null) { const i=inputRef.current; if(i){ requestAnimationFrame(()=>{ i.focus(); i.select(); }); } } }, [editingIndex]);
  return (
    <div className="panel-shell">
      <aside className="panel-card flex flex-col">
        <div className="px-3 py-2 flex items-center gap-2">
          <button onClick={()=>setTab('pages')} className={`px-2 py-1 rounded-md text-xs border ${tab==='pages' ? 'bg-neutral-800 border-white/10' : 'border-transparent hover:bg-neutral-800/60'}`}>Pages</button>
          <button onClick={()=>setTab('assets')} className={`px-2 py-1 rounded-md text-xs border ${tab==='assets' ? 'bg-neutral-800 border-white/10' : 'border-transparent hover:bg-neutral-800/60'}`}>Assets</button>
        </div>
        <div className="p-3">
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input className="w-full pl-8 pr-2 py-1.5 rounded-md bg-neutral-800 border border-white/10 text-sm placeholder:text-neutral-500" placeholder="Search" />
          </div>
          {tab === 'pages' ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Pages</div>
              <div className="space-y-1 text-sm">
                {pageList.map((p, idx) => (
                  <div key={`${p}-${idx}`} className="w-full px-2 py-1.5 rounded-md hover:bg-neutral-800/60 inline-flex items-center gap-2">
                    <Folder className="w-4 h-4 text-neutral-500" />
                    {editingIndex===idx ? (
                      <input
                        ref={inputRef}
                        defaultValue={p}
                        className="flex-1 min-w-0 bg-transparent outline-none border border-indigo-500 rounded px-1 py-0.5"
                        onBlur={(e)=>{ const v=e.currentTarget.value.trim()||p; const next=[...pageList]; next[idx]=v; setPageList(next); setEditingIndex(null); }}
                        onKeyDown={(e)=>{ if(e.key==='Enter'){ (e.target as HTMLInputElement).blur(); } if(e.key==='Escape'){ setEditingIndex(null); } }}
                      />
                    ) : (
                      <button onDoubleClick={()=>setEditingIndex(idx)} className="flex-1 text-left truncate">{p}</button>
                    )}
                  </div>
                ))}
                <button className="w-full text-left px-2 py-1.5 rounded-md hover:bg-neutral-800/60 inline-flex items-center gap-2" onClick={()=>{ const base='Untitled Page'; let n=pageList.length+1; const name = pageList.includes(base) ? `${base} ${n}` : base; setPageList([...pageList, name]); setEditingIndex(pageList.length); }}>
                  <Plus className="w-4 h-4 text-neutral-500" />
                  <span>New page</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Assets (blocks)</div>
              <div className="space-y-1 text-sm">
                {/* Existing PRD insert blocks */}
                <button onClick={()=>onInsert?.("cuj")} className="w-full text-left px-2 py-1.5 rounded-md border border-white/10 bg-neutral-800/40 inline-flex items-center gap-2 hover:bg-neutral-800/70">
                  <ImageIcon className="w-4 h-4 text-neutral-500" />
                  <span>CUJ</span>
                </button>
                <button onClick={()=>onInsert?.("req")} className="w-full text-left px-2 py-1.5 rounded-md border border-white/10 bg-neutral-800/40 inline-flex items-center gap-2 hover:bg-neutral-800/70">
                  <ImageIcon className="w-4 h-4 text-neutral-500" />
                  <span>Requirement</span>
                </button>
                <button onClick={()=>onInsert?.("ac")} className="w-full text-left px-2 py-1.5 rounded-md border border-white/10 bg-neutral-800/40 inline-flex items-center gap-2 hover:bg-neutral-800/70">
                  <ImageIcon className="w-4 h-4 text-neutral-500" />
                  <span>AC</span>
                </button>
                <button onClick={()=>onInsert?.("milestone")} className="w-full text-left px-2 py-1.5 rounded-md border border-white/10 bg-neutral-800/40 inline-flex items-center gap-2 hover:bg-neutral-800/70">
                  <ImageIcon className="w-4 h-4 text-neutral-500" />
                  <span>Milestone</span>
                </button>

                {/* New default blocks (stubs) */}
                <div className="pt-2 text-xs uppercase tracking-wide text-neutral-400">Integrations</div>
                {[
                  { id: 'figma', label: 'Figma' },
                  { id: 'jira', label: 'Jira' },
                  { id: 'linear', label: 'Linear' },
                  { id: 'mermaid', label: 'Mermaid' },
                  { id: 'lucid', label: 'LucidChart' },
                ].map((b) => (
                  <button key={b.id} disabled className="w-full text-left px-2 py-1.5 rounded-md border border-white/10 bg-neutral-800/30 inline-flex items-center gap-2 opacity-70 cursor-not-allowed">
                    <Blocks className="w-4 h-4 text-neutral-500" />
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
