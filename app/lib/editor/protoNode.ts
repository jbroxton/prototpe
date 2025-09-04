"use client";

import { StateField, EditorState } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet, WidgetType } from "@codemirror/view";

function makeIframe(html: string): HTMLElement {
  const iframe = document.createElement('iframe');
  iframe.className = 'w-full bg-black rounded-xl border border-white/10';
  iframe.style.height = '720px';
  iframe.setAttribute('sandbox', 'allow-scripts');
  const tailwindCdn = 'https://cdn.tailwindcss.com';
  const cssDaisy = 'https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css';
  const csp = "default-src 'none'; style-src 'unsafe-inline' https:; img-src data: https:; script-src 'unsafe-inline' https:";
  const srcdoc = `<!DOCTYPE html><html data-theme="dim"><head><meta charset="utf-8"/><meta http-equiv="Content-Security-Policy" content="${csp}"><script src="${tailwindCdn}"></script><link rel="stylesheet" href="${cssDaisy}"><style>html,body,#root{height:100%} body{background:#0b0b0b} #root{display:grid;place-items:center} .mockup-phone{width:min(420px,100%);height:100%} .mockup-phone .display{height:100%;overflow:auto}</style></head><body><div id="root"><div class="mockup-phone"><div class="camera"></div><div id="display" class="display bg-base-100"></div></div></div><script>(function(){var html=${JSON.stringify(html||'')};var d=document.getElementById('display');if(html){d.innerHTML=html;}else{d.innerHTML='<div class=\'w-full h-full grid place-items-center text-base-content/60\'><div><div class=\'text-sm text-center\'>Prototype</div><div class=\'text-xs opacity-60 text-center\'>No preview yet</div></div></div>';}})();</script></body></html>`;
  iframe.srcdoc = srcdoc;
  return iframe;
}

function getSandboxHtml(): string {
  try { return sessionStorage.getItem('sandbox:html') || ''; } catch { return ''; }
}

class ProtoWidget extends WidgetType {
  constructor(private html: string) { super(); }
  eq(other: ProtoWidget) { return this.html === other.html; }
  toDOM() {
    const wrap = document.createElement('div');
    wrap.style.display = 'block';
    wrap.style.padding = '12px 0';
    wrap.appendChild(makeIframe(this.html));
    return wrap;
  }
}

function buildDecos(state: EditorState): DecorationSet {
  const widgets: any[] = [];
  const text = state.doc.toString();
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^```proto\s*$/.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && !/^```\s*$/.test(lines[j])) j++;
      const startLine = state.doc.line(i + 1);
      const html = getSandboxHtml();
      const widget = Decoration.widget({ side: 1, widget: new ProtoWidget(html) }).range(startLine.from);
      widgets.push(widget);
      // Simpler: do not try to hide the fenced region to avoid invalid ranges
      i = j;
    }
  }
  return Decoration.set(widgets, true);
}

export const protoNode = StateField.define<DecorationSet>({
  create(state) { return buildDecos(state); },
  update(decos, tr) {
    if (tr.docChanged) decos = decos.map(tr.changes);
    return buildDecos(tr.state);
  },
  provide: f => EditorView.decorations.from(f)
});
