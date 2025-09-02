"use client";

import { Plus } from "lucide-react";

export function RoadmapHeader() {
  return (
    <header className="sticky top-0 z-10 bg-neutral-900/80 backdrop-blur border-b border-white/10">
      <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center gap-3">
        <div className="text-lg font-medium">Features board</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded-md border border-white/10 bg-indigo-600 text-white text-xs inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Add feature</button>
          <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Add release</button>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-2 text-xs">
          <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">Releases ▼</button>
          <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">Views ▼</button>
        </div>
      </div>
    </header>
  );
}

