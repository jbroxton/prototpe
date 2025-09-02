"use client";

import { TabsBar } from "../../components/TabsBar";
import React, { useEffect } from "react";
import { EditableTitle } from "../../components/EditableTitle";
import { useParams } from "next/navigation";
import { RoadmapColumn } from "../../components/roadmap/Column";
import { Plus } from "lucide-react";

export default function RoadmapDocPage() {
  const { roadmapId } = useParams<{ roadmapId: string }>();

  // Register this roadmap as an open tab for the session
  useEffect(() => {
    try {
      let title = '2025 Consumer Roadmap';
      try { const saved = sessionStorage.getItem(`title:roadmap:${roadmapId}`); if (saved) title = saved; } catch {}
      const k = 'openTabs';
      const list = JSON.parse(sessionStorage.getItem(k) || '[]');
      const arr = Array.isArray(list) ? list : [];
      const idx = arr.findIndex((t: any) => t && t.type === 'roadmap' && String(t.id)===String(roadmapId));
      if (idx === -1) {
        arr.push({ type: 'roadmap', id: String(roadmapId), title });
      } else if (arr[idx].title !== title) {
        arr[idx].title = title;
      }
      sessionStorage.setItem(k, JSON.stringify(arr));
      sessionStorage.setItem(`tabTitle:${roadmapId}`, title);
      window.dispatchEvent(new Event('openTabs:changed'));
    } catch {}
  }, [roadmapId]);

  const columns = [
    'Backlog', 'Up Next', 'In Progress', 'QA', 'Done'
  ];
  const [detailsTitle, setDetailsTitle] = React.useState<string | null>(null);

  const gridCols = detailsTitle ? `minmax(0,1fr) 520px` : `minmax(0,1fr)`;

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <TabsBar />
      <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: gridCols }}>
        {/* Main roadmap panel */}
        <div className="min-h-0 overflow-hidden">
          <div className="panel-shell">
            <div className="panel-card flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-auto">
                <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-[var(--background)]/0">
                  <div className="flex-1"><EditableTitle id={String(roadmapId)} type="roadmap" initial={'2025 Consumer Roadmap'} /></div>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded-md border border-white/10 bg-indigo-600 text-white text-xs inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Add feature</button>
                    <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Add release</button>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-xs">
                    <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">Releases ▼</button>
                    <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">Views ▼</button>
                  </div>
                </div>
                <div className="px-4 pb-6">
                  <div className="flex gap-4 overflow-x-auto x-scroll">
                    {columns.map((c) => (
                      <RoadmapColumn key={c} title={c} onOpenDetails={setDetailsTitle} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Details column (separate panel) */}
        {detailsTitle && (
          <div className="min-h-0 overflow-hidden">
            <div className="panel-shell">
              <div className="panel-card flex flex-col">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="font-medium">Details</div>
                  <button className="text-xs px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={()=>setDetailsTitle(null)}>Close</button>
                </div>
                <div className="p-3 text-sm text-neutral-300">
                  <div className="font-medium mb-2">{detailsTitle}</div>
                  <div className="opacity-70">Details stub. We will render fields and status here.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
