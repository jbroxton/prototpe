"use client";

import { autocompletion, CompletionContext, CompletionResult, CompletionSource } from "@codemirror/autocomplete";

async function fetchSuggestions(prefix: string, role?: string): Promise<string[]> {
  try {
    const r = await fetch('/api/entities/suggest', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prefix, role, k: 5 }) });
    const j = await r.json();
    return Array.isArray(j?.suggestions) ? j.suggestions as string[] : [];
  } catch { return []; }
}

function wordBefore(context: CompletionContext) {
  const { state, pos } = context;
  const line = state.doc.lineAt(pos);
  const from = Math.max(line.from, pos - 64);
  const text = state.sliceDoc(from, pos);
  const m = text.match(/([A-Za-z0-9_\.]{2,})$/);
  if (!m) return null;
  const start = pos - m[1].length;
  const prefix = m[1];
  return { from: start, to: pos, prefix };
}

export function entitySource(role?: 'developer'|'endUser'|'admin'): CompletionSource {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    const w = wordBefore(context); if (!w) return null;
    if (w.prefix.length < 3) return null;
    const suggestions = await fetchSuggestions(w.prefix, role);
    if (!suggestions.length) return null;
    return {
      from: w.from,
      options: suggestions.map((s)=> ({ label: s, type: 'keyword', apply: s })),
      validFor: /^[A-Za-z0-9_\.]*$/
    };
  };
}

export function entityAutocomplete(role?: 'developer'|'endUser'|'admin') {
  return autocompletion({ override: [entitySource(role)] });
}
