"use client";

import { StateField, EditorState } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { UserFlow } from "../../components/blocks/UserFlow";

type Step = { id: string; label: string; note?: string };

function parseJson(text: string): Step[] | null {
  try {
    const t = text.trim();
    if (!t) return null;
    const j = JSON.parse(t);
    if (Array.isArray(j)) return j as Step[];
    if (Array.isArray((j as any).steps)) return (j as any).steps as Step[];
    return null;
  } catch { return null; }
}

function buildDecos(state: EditorState): DecorationSet {
  const widgets: any[] = [];
  const text = state.doc.toString();
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^```\s*flow(?:\s+title=(.*))?\s*$/i);
    if (!m) { i++; continue; }
    const title = (m[1] || '').trim() || 'User flow';
    // find closing fence
    let j = i + 1;
    while (j < lines.length && !/^```\s*$/.test(lines[j])) j++;
    const start = state.doc.line(i + 1).from; // position after opening fence line break
    const endLine = j < lines.length ? state.doc.line(j + 1) : state.doc.line(state.doc.lines);
    const body = state.sliceDoc(start, endLine.from - 1);
    const steps = parseJson(body) || defaultSteps;

    class FlowWidget extends WidgetType {
      root?: Root;
      toDOM() {
        const wrap = document.createElement('div');
        wrap.style.display = 'block';
        wrap.style.padding = '12px 0';
        const el = document.createElement('div');
        this.root = createRoot(el);
        this.root.render(React.createElement(UserFlow, { title, steps }));
        wrap.appendChild(el);
        return wrap;
      }
      destroy(dom: HTMLElement) {
        try { this.root?.unmount(); } catch {}
      }
    }
    const widget = Decoration.widget({ side: 1, widget: new FlowWidget() }).range(start);
    widgets.push(widget);
    // Hide the whole fenced block (both fences and any body content)
    const fenceStart = state.doc.line(i + 1).from - (line.length + 1);
    widgets.push(Decoration.replace({}).range(fenceStart, endLine.from - 1));
    i = j + 1;
  }
  return Decoration.set(widgets, true);
}

const defaultSteps: Step[] = [
  { id:'s1', label:'Open Order Summary', note:'Guest lands on summary with items in cart' },
  { id:'s2', label:'Fetch context + history', note:'Time of day, repeat guest, top pairings' },
  { id:'s3', label:'Rank add‑ons', note:'2 best suggestions, deduped & policy‑checked' },
  { id:'s4', label:'Render inline suggestions', note:'Compact cards with price & one‑tap add' },
  { id:'s5', label:'Tap “Add”', note:'Optimistic update; toast confirms' },
  { id:'s6', label:'Update cart + telemetry', note:'add_addon_success + new total' },
  { id:'s7', label:'Suppress further suggestions', note:'Do not overexpose; easy dismissal' },
];

export const flowNode = StateField.define<DecorationSet>({
  create(state) { return buildDecos(state); },
  update(decos, tr) {
    if (tr.docChanged) decos = decos.map(tr.changes);
    return buildDecos(tr.state);
  },
  provide: f => EditorView.decorations.from(f)
});
