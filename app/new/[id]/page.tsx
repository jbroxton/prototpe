"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TabsBar } from "../../components/TabsBar";
import { ProjectCard } from "../../components/home/ProjectCard";

const demoProjects = [
  { name: "Coffee Cart", status: "Active" },
  { name: "Roadmap", status: "Draft" },
  { name: "Order Recommendations", status: "Active" },
  { name: "Checkout Experience", status: "Draft" },
  { name: "Loyalty & Rewards", status: "Draft" },
  { name: "Menu Management", status: "Active" },
  { name: "Store Locator", status: "Paused" },
  { name: "Barista Dashboard", status: "Draft" },
];

export default function NewTabPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Ensure tab exists if user navigates directly
  useEffect(() => {
    try {
      const k = 'openTabs';
      const list = JSON.parse(sessionStorage.getItem(k) || '[]');
      if (Array.isArray(list) && !list.find((t: any) => t && t.type==='new' && String(t.id)===String(id))) {
        list.push({ type:'new', id: String(id), title:'New File' });
        sessionStorage.setItem(k, JSON.stringify(list));
        window.dispatchEvent(new Event('openTabs:changed'));
      }
    } catch {}
  }, [id]);

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <TabsBar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* File type row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              className="h-24 rounded-xl border border-white/10 bg-neutral-900/70 hover:bg-neutral-800/70 text-neutral-200 font-medium"
              onClick={() => {
                const newId = 'doc_' + Math.random().toString(36).slice(2,8);
                try {
                  const k = 'openTabs';
                  const list = JSON.parse(sessionStorage.getItem(k) || '[]');
                  if (Array.isArray(list)) {
                    const idx = list.findIndex((t: any) => t && t.type==='new' && String(t.id)===String(id));
                    if (idx >= 0) list[idx] = { type:'req', id: newId, title: 'Untitled Page' };
                    else list.push({ type:'req', id: newId, title:'Untitled Page' });
                    sessionStorage.setItem(k, JSON.stringify(list));
                    window.dispatchEvent(new Event('openTabs:changed'));
                  }
                } catch {}
                router.push(`/requirements/${newId}`);
              }}
            >
              Requirements
            </button>
            <button
              className="h-24 rounded-xl border border-white/10 bg-neutral-900/70 hover:bg-neutral-800/70 text-neutral-200 font-medium"
              onClick={() => {
                const newId = 'roadmap_' + Math.random().toString(36).slice(2,8);
                try {
                  const k = 'openTabs';
                  const list = JSON.parse(sessionStorage.getItem(k) || '[]');
                  if (Array.isArray(list)) {
                    const idx = list.findIndex((t: any) => t && t.type==='new' && String(t.id)===String(id));
                    if (idx >= 0) list[idx] = { type:'roadmap', id: newId, title: 'Roadmap' };
                    else list.push({ type:'roadmap', id: newId, title:'Roadmap' });
                    sessionStorage.setItem(k, JSON.stringify(list));
                    window.dispatchEvent(new Event('openTabs:changed'));
                  }
                } catch {}
                router.push(`/roadmap/${newId}`);
              }}
            >
              Roadmaps
            </button>
            <button
              className="h-24 rounded-xl border border-white/10 bg-neutral-900/70 hover:bg-neutral-800/70 text-neutral-200 font-medium"
              onClick={() => {
                const newId = 'okr_' + Math.random().toString(36).slice(2,8);
                try {
                  const k = 'openTabs';
                  const list = JSON.parse(sessionStorage.getItem(k) || '[]');
                  if (Array.isArray(list)) {
                    const idx = list.findIndex((t: any) => t && t.type==='new' && String(t.id)===String(id));
                    if (idx >= 0) list[idx] = { type:'okrs', id: newId, title: 'OKRs' };
                    else list.push({ type:'okrs', id: newId, title:'OKRs' });
                    sessionStorage.setItem(k, JSON.stringify(list));
                    window.dispatchEvent(new Event('openTabs:changed'));
                  }
                } catch {}
                router.push(`/okrs/${newId}`);
              }}
            >
              OKRs
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                placeholder="Search for files"
                className="w-full px-4 py-3 rounded-md bg-neutral-900/90 border border-white/10 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Recent files - centered/narrow */}
          <section>
            <div className="mb-3 font-medium text-neutral-300">Recent files</div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {demoProjects.map((p) => (
                <ProjectCard
                  key={p.name}
                  name={p.name}
                  status={p.status as any}
                  href={p.name === 'Coffee Cart' ? '/requirements/1001' : p.name === 'Roadmap' ? '/roadmap/2001' : undefined}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
