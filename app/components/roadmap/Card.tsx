"use client";

export function RoadmapCard({ title, onClick }: { title: string; onClick?: () => void }) {
  // Deterministic tag selection to avoid SSR/CSR hydration mismatches.
  const all = ['Analytics', 'Dashboard', 'Mobile'];
  // Simple hash from title to pick a stable count 1..3
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  const count = (hash % 3) + 1;
  const tags = all.slice(0, count);
  return (
    <button onClick={onClick} className="w-full text-left rounded-xl border border-white/10 bg-neutral-900 hover:bg-neutral-900/80 transition shadow-sm overflow-hidden">
      <div className="px-3 py-2 text-sm font-medium text-neutral-200 truncate">{title}</div>
      <div className="px-3 pb-3 flex flex-wrap gap-1">
        {tags.map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-md border border-white/10 bg-neutral-800 text-neutral-400">{t}</span>
        ))}
      </div>
    </button>
  );
}
