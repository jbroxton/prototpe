"use client";

import { autocompletion, Completion, CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";

function getFeatureFromDoc(state: EditorState): string | undefined {
  const first = state.doc.line(1).text.trim();
  const m = /^#\s+(.+)$/.exec(first);
  return m?.[1];
}

function iosPrdTemplate(feature?: string) {
  const suffix = feature ? ` for ${feature}` : "";
  return (
`## Overview${suffix}
// Describe the broad issue and the high‑level goal you are trying to solve.
// Summarize the user value in 1–2 sentences.

## Problem
// Why does this matter now? Who is impacted and how do we know?
// Add evidence (metrics, tickets, qualitative notes).

## User
// Who is the primary user? In what context do they use this?
// Note any constraints (network, time, accessibility) and JTBD.

## Definitions
// List key assumptions and constraints (platforms, devices, perf, a11y).
// Define success metrics and basic telemetry you plan to capture.

## Solution
// Outline entry points and a simple user flow (step by step).
// Describe main screens and important states (empty, loading, error).
// Call out offline/poor‑network behavior and explicit non‑goals.
`
  );
}

export function atSource(context: CompletionContext) {
  const word = context.matchBefore(/@[A-Za-z0-9\- ]*$/);
  if (!word && !context.explicit) return null;
  const from = word ? word.from : context.pos;
  const feature = getFeatureFromDoc(context.state);

  const items: Completion[] = [
    {
      label: "@ios-prd",
      type: "keyword",
      detail: "iOS PRD template",
      info: () => {
        const wrap = document.createElement('div');
        wrap.className = 'cm-demo-info';
        wrap.textContent = 'Insert a structured PRD for an iOS feature (Overview, Problem, User, Definitions, Solution).';
        return wrap;
      },
      apply: (view, completion, fromPos, toPos) => {
        const body = iosPrdTemplate(feature);
        view.dispatch({ changes: { from: fromPos, to: toPos, insert: body } });
      },
    },
    { label: "@android-prd", type: "keyword", detail: "Android PRD template", info: () => { const el=document.createElement('div'); el.className='cm-demo-info'; el.textContent='Android template'; return el; }, apply: (view, c, f, t) => { /* no-op placeholder */ } },
    { label: "@api-prd", type: "keyword", detail: "API PRD template", info: () => { const el=document.createElement('div'); el.className='cm-demo-info'; el.textContent='API template'; return el; }, apply: (view, c, f, t) => { /* no-op */ } },
    { label: "@compliance-prd", type: "keyword", detail: "Compliance template", info: () => { const el=document.createElement('div'); el.className='cm-demo-info'; el.textContent='Compliance template'; return el; }, apply: (view, c, f, t) => { /* no-op */ } },
  ];

  return {
    from,
    options: items,
    filter: true,
  };
}

export const atMentions = autocompletion({ override: [atSource], icons: false, closeOnBlur: true });
