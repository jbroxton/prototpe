"use client";

export function TestPrdRight() {
  return (
    <aside className="h-full border-l border-white/10 bg-neutral-900/80 backdrop-blur hidden xl:flex flex-col">
      <div className="px-3 py-2 border-b border-white/10 text-sm text-neutral-300">Inspector</div>
      <div className="p-3 text-sm text-neutral-400">
        <div className="mb-2">This panel is optional. We can use it later for block settings (milestone, page link, satisfied) or keep it hidden.</div>
        <div className="space-y-2">
          <label className="block">
            <div className="text-xs uppercase mb-1">Milestone</div>
            <div className="flex gap-2">
              <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">M0</button>
              <button className="px-2 py-1 rounded-md border border-white/10">M1</button>
              <button className="px-2 py-1 rounded-md border border-white/10">M2</button>
            </div>
          </label>
        </div>
      </div>
    </aside>
  );
}

