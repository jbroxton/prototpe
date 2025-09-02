"use client";

import { DSL, Screen } from "../lib/dsl";

export function Inspector({ dsl, current, selectedIdx, onChange }: { dsl: DSL; current?: Screen; selectedIdx: number | null; onChange: (updater: (s: Screen) => void) => void }) {
  if (!current) return <div className="min-w-[260px] w-[260px] h-full overflow-auto border-l border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3 text-sm" />;
  const c = selectedIdx != null ? current.components[selectedIdx] : null;
  return (
    <div className="min-w-[260px] w-[260px] h-full overflow-auto border-l border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3 text-sm">
      <div className="font-medium mb-2">Inspector</div>
      {c ? (
        <div className="space-y-3">
          <Field label="Type"><div className="px-2 py-1 bg-white rounded border border-black/10">{c.type}</div></Field>
          <Field label="Text">
            <input
              className="w-full px-2 py-1 rounded border border-black/10 bg-white"
              value={(c.props?.text as string) || ""}
              onChange={(e) => onChange((s) => { if (selectedIdx == null) return; s.components[selectedIdx].props = { ...(s.components[selectedIdx].props || {}), text: e.target.value }; })}
            />
          </Field>
          <Field label="Link To">
            <select
              className="w-full px-2 py-1 rounded border border-black/10 bg-white"
              value={c.linkTo || ""}
              onChange={(e) => onChange((s) => { if (selectedIdx == null) return; s.components[selectedIdx].linkTo = e.target.value || undefined; })}
            >
              <option value="">None</option>
              {dsl.screens.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="text-[11px] opacity-60 mt-1">Double-click a component to follow its link.</div>
          </Field>
        </div>
      ) : (
        <div className="opacity-70">Select a component to edit text or link.</div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <div className="mb-1 opacity-70">{label}</div>
      {children}
    </label>
  );
}
