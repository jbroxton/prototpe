"use client";

import { EditorView, Decoration, DecorationSet, ViewPlugin, WidgetType } from "@codemirror/view";

type Req = {
  checked: boolean;
  title: string;
  page: string;
  id?: string;
  milestone?: "M0" | "M1" | "M2";
};

function parseReq(text: string): Req | null {
  const m = text.match(/^\s*-\s*\[( |x|X)\]\s*(.*?)(?:\s+on\s*\[\[(.*?)\]\])?\s*(?:<!--\s*([^>]*)\s*-->)?\s*$/);
  if (!m) return null;
  const meta = (m[4] || "").trim();
  const idMatch = meta.match(/id:([a-zA-Z0-9_\-]+)/);
  const msMatch = meta.match(/milestone:(M0|M1|M2)/);
  return {
    checked: m[1].toLowerCase() === "x",
    title: (m[2] || "").trim() || "Requirement",
    page: (m[3] || "Home").trim(),
    id: idMatch?.[1],
    milestone: (msMatch?.[1] as any) || undefined,
  };
}

function serializeReq(req: Req): string {
  const meta = `id:${req.id || genId()} milestone:${req.milestone || "M0"}`;
  const box = req.checked ? 'x' : ' ';
  return `- [${box}] ${req.title} on [[${req.page}]] <!-- ${meta} -->`;
}

function genId() { return "blk_" + Math.random().toString(36).slice(2, 8); }

class ReqWidget extends WidgetType {
  constructor(private from: number, private to: number, private req: Req) { super(); }
  eq(other: ReqWidget) { return JSON.stringify(this.req) === JSON.stringify(other.req) && this.from === other.from && this.to === other.to; }
  toDOM(view: EditorView): HTMLElement {
    const row = document.createElement("div");
    row.className = "req-block";

    const left = document.createElement("div");
    left.className = "req-left";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!this.req.checked;
    cb.onchange = () => {
      const current = parseReq(view.state.sliceDoc(this.from, this.to)) || this.req;
      current.checked = cb.checked;
      view.dispatch({ changes: { from: this.from, to: this.to, insert: serializeReq(current) } });
    };
    left.appendChild(cb);
    row.appendChild(left);

    const title = document.createElement("div");
    title.className = "req-title";
    title.textContent = this.req.title;
    title.contentEditable = "true";
    title.onblur = () => {
      const current = parseReq(view.state.sliceDoc(this.from, this.to)) || this.req;
      current.title = title.textContent || "Requirement";
      view.dispatch({ changes: { from: this.from, to: this.to, insert: serializeReq(current) } });
    };
    row.appendChild(title);

    const page = document.createElement("button");
    page.className = "req-chip";
    page.textContent = this.req.page || "Home";
    page.onclick = () => {
      const pages = ["Home", "Details", "Checkout", "Confirmation", "Dashboard"];
      const next = pages[(pages.indexOf(page.textContent || "Home") + 1) % pages.length];
      const current = parseReq(view.state.sliceDoc(this.from, this.to)) || this.req;
      current.page = next;
      view.dispatch({ changes: { from: this.from, to: this.to, insert: serializeReq(current) } });
    };
    row.appendChild(page);

    const ms = document.createElement("button");
    ms.className = "req-chip";
    ms.textContent = this.req.milestone || "M0";
    ms.onclick = () => {
      const order = ["M0", "M1", "M2"] as const;
      const cur = ms.textContent as any;
      const next = order[(order.indexOf(cur) + 1) % order.length];
      const current = parseReq(view.state.sliceDoc(this.from, this.to)) || this.req;
      current.milestone = next;
      view.dispatch({ changes: { from: this.from, to: this.to, insert: serializeReq(current) } });
    };
    row.appendChild(ms);

    const apply = document.createElement("button");
    apply.className = "req-apply";
    apply.textContent = "Apply";
    row.appendChild(apply);

    return row;
  }
  ignoreEvent() { return false; }
}

function buildReqDecos(view: EditorView): DecorationSet {
  const widgets: any[] = [];
  const total = view.state.doc.lines;
  for (let i = 1; i <= total; i++) {
    const ln = view.state.doc.line(i);
    const text = ln.text;
    const data = parseReq(text);
    if (!data) continue;
    const widget = new ReqWidget(ln.from, ln.to, data);
    widgets.push(Decoration.replace({ widget }).range(ln.from, ln.to));
  }
  return Decoration.set(widgets, true);
}

export const reqBlocksDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = buildReqDecos(view); }
    update(update: any) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildReqDecos(update.view);
      }
    }
  },
  { decorations: (v: any) => v.decorations }
);
