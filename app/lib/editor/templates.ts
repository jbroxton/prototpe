"use client";

import { EditorState, TransactionSpec } from "@codemirror/state";
import { EditorView, ViewPlugin } from "@codemirror/view";

function iosPrdTemplate(feature?: string) {
  const title = feature ? ` for ${feature}` : "";
  return (
`## Overview${title}
- What is the goal of this iOS feature? Summarize the user value in 1–2 sentences.
- Success looks like: <define the outcome users achieve>.
- Scope: iPhone (12+), iOS 16+; iPad optional.

## Problem
- Current pain: <describe friction or gap in the Coffee Cart app>.
- Impacted flows: <pages/flows impacted>.
- Evidence: <metrics, support tickets, qualitative notes>.

## User
- Primary persona: <e.g., Returning buyer placing orders during commute>.
- Context of use: <network conditions, time constraints, accessibility needs>.
- Jobs to be done: <top 3 jobs related to this feature>.

## Definitions
- Platform assumptions: iOS 16+, dark mode supported, dynamic type M–XL.
- Performance: initial view < 400ms, interaction latency < 100ms.
- Accessibility: VoiceOver labels, large text, contrast AA.
- Telemetry: screen_view, tap_<key_actions>, error_<class>, success_<event>.
- Edge devices: iPhone SE 2/3, iPhone 14/15, notches & safe areas.

## Solution
- Entry points: <where users start> (e.g., Home, Order Summary, Push deep link).
- High‑level flow: <step 1> → <step 2> → <step 3>.
- Screens:
  - Screen 1: <name> — <goal>, primary CTA <label>.
  - Screen 2: <name> — <goal>, states (empty, loading, error).
- Permissions: <if any>, system prompts placement & copy.
- Offline/poor network: <graceful behavior>.
- Not in scope: <non‑goals to avoid scope creep>.
`
  );
}

function findFeatureFromDoc(state: EditorState): string | undefined {
  const first = state.doc.line(1).text.trim();
  const m = /^#\s+(.+)$/.exec(first);
  return m?.[1];
}

export const templateMentions = ViewPlugin.fromClass(
  class {
    constructor(private view: EditorView) {}
    update(update: any) {
      if (!update.docChanged) return;
      let target: { from: number; to: number } | null = null;
      update.changes.iterChanges((_fa: number, _ta: number, fromB: number, toB: number) => {
        const line = update.state.doc.lineAt(toB);
        // If a newline was inserted, check the previous line; else check the current line
        const cand = update.state.doc.lineAt(fromB === toB && line.number > 1 ? line.from - 1 : line.from);
        const text = update.state.doc.sliceString(cand.from, cand.to).trim();
        const ios1 = /^@\s*(ios)\s+prd(\s+template)?$/i.test(text);
        const ios2 = /^@\s*template\s+(ios)\s+prd$/i.test(text);
        if (ios1 || ios2) target = { from: cand.from, to: cand.to };
      });
      if (!target) return;
      const feature = findFeatureFromDoc(update.state);
      const body = iosPrdTemplate(feature);
      const { from, to } = target;
      const replace: TransactionSpec = {
        changes: { from, to, insert: body },
        selection: { anchor: from + body.length },
      };
      this.view.dispatch(replace);
    }
  }
);
