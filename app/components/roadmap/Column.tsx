"use client";

import { RoadmapCard } from "./Card";

export function RoadmapColumn({ title, onOpenDetails }: { title: string; onOpenDetails?: (title: string) => void }) {
  return (
    <div className="min-w-[320px] max-w-[320px]">
      <div className="px-2 py-2 mb-2 rounded-md border border-white/10 bg-neutral-900/80 text-sm flex items-center justify-between">
        <div className="font-medium truncate">{title}</div>
        <div className="text-xs text-neutral-400">Capacity</div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <RoadmapCard key={i} title={`FWCYL-${100 + i} Example feature`} onClick={()=> onOpenDetails?.(`FWCYL-${100 + i} Example feature`)} />
        ))}
      </div>
    </div>
  );
}
