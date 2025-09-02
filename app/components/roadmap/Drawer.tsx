"use client";

export function RoadmapDrawer() {
  return (
    <aside className="hidden lg:flex h-full border-l border-white/10 bg-neutral-900/80 backdrop-blur flex-col">
      <div className="px-4 py-3 border-b border-white/10 text-sm font-medium">Feature details</div>
      <div className="p-4 space-y-3 text-sm text-neutral-300">
        <div>
          <div className="text-neutral-400 text-xs mb-1">Title</div>
          <div className="rounded-md border border-white/10 bg-neutral-800 px-2 py-1">Set personal fitness goals</div>
        </div>
        <div>
          <div className="text-neutral-400 text-xs mb-1">Overview</div>
          <div className="rounded-md border border-white/10 bg-neutral-800 p-2 min-h-[120px]">Users should be able to set goals…</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-neutral-400 text-xs mb-1">Status</div>
            <div className="rounded-md border border-white/10 bg-neutral-800 px-2 py-1">Define</div>
          </div>
          <div>
            <div className="text-neutral-400 text-xs mb-1">Tags</div>
            <div className="rounded-md border border-white/10 bg-neutral-800 px-2 py-1">Analytics, Dashboard</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

