"use client";

import { EditorView, Decoration, ViewPlugin, DecorationSet } from "@codemirror/view";

function buildDecos(view: EditorView): DecorationSet {
  const decos: any[] = [];
  const total = view.state.doc.lines;
  for (let i = 1; i <= total; i++) {
    const ln = view.state.doc.line(i);
    const text = ln.text;
    // CUJ line
    if (/^\s*CUJ\s*:/i.test(text)) decos.push(Decoration.line({ class: "cm-cuj" }).range(ln.from));
    // Requirement / AC checkbox
    if (/^\s*-\s*\[( |x|X)\]/.test(text)) decos.push(Decoration.line({ class: "cm-checkblock" }).range(ln.from));
    // Milestone heading
    if (/^\s*###\s+V[0-9]/i.test(text)) decos.push(Decoration.line({ class: "cm-milestone" }).range(ln.from));
  }
  return Decoration.set(decos, true);
}

export const blocksDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecos(view);
    }
    update(update: any) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecos(update.view);
      }
    }
  },
  { decorations: (v: any) => v.decorations }
);
