"use client";

import { EditorView, Decoration, DecorationSet, ViewPlugin } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

function buildDecos(view: EditorView): DecorationSet {
  const decos: any[] = [];
  const total = view.state.doc.lines;
  for (let i = 1; i <= total; i++) {
    const ln = view.state.doc.line(i);
    const text = ln.text;
    const next = i < total ? view.state.doc.line(i + 1) : null;
    // Setext headings: add heading class to current line; hide underline line
    if (next && /^\s*(=+)\s*$/.test(next.text)) {
      decos.push(Decoration.line({ class: "cm-h1" }).range(ln.from));
      // hide underline line
      decos.push(Decoration.replace({}).range(next.from, next.to));
      i++; // skip the underline line we just handled
      continue;
    }
    if (next && /^\s*(-{2,})\s*$/.test(next.text)) {
      decos.push(Decoration.line({ class: "cm-h2" }).range(ln.from));
      decos.push(Decoration.replace({}).range(next.from, next.to));
      i++;
      continue;
    }
    // ATX headings: visually hide the leading "#... " while keeping text
    const atx = text.match(/^\s*(#{1,6})\s+/);
    if (atx) {
      const level = atx[1].length;
      const klass = level === 1 ? 'cm-h1' : level === 2 ? 'cm-h2' : 'cm-h3';
      decos.push(Decoration.line({ class: klass }).range(ln.from));
      decos.push(Decoration.replace({}).range(ln.from, ln.from + atx[0].length));
    }
    // Paragraph-ish lines (not headings/lists/quotes/fences and not blank)
    else if (/^\s*\/\//.test(text))
      decos.push(Decoration.line({ class: "cm-commentline" }).range(ln.from));
    else if (/(\S)/.test(text) && !/^\s*([-*+]\s|\d+\.\s|>\s|`{3,}|\||#+\s)/.test(text))
      decos.push(Decoration.line({ class: "cm-paragraph" }).range(ln.from));
  }
  return Decoration.set(decos, true);
}

const headingsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecos(view);
    }
    update(update: any) {
      if (update.docChanged || update.viewportChanged) this.decorations = buildDecos(update.view);
    }
  },
  { decorations: (v: any) => v.decorations }
);

const layoutTheme = EditorView.baseTheme({
  ".cm-scroller": {
    fontSize: "14.5px",
    lineHeight: "1.75",
    overflowX: "hidden",
  },
  ".cm-content": {
    maxWidth: "820px",
    margin: "0 auto",
    padding: "20px 24px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  ".cm-line": {
    padding: "0 0",
  },
  ".cm-line.cm-paragraph": {
    marginTop: "10px",
  },
  ".cm-line.cm-h1": {
    marginTop: "28px",
  },
  ".cm-line.cm-h2, .cm-line.cm-h3": {
    marginTop: "24px",
  },
});

const headingTokens = HighlightStyle.define([
  { tag: tags.heading, textDecoration: "none" },
  { tag: tags.heading1, fontWeight: "600" },
  { tag: tags.heading2, fontWeight: "600" },
  { tag: tags.heading3, fontWeight: "600" },
]);

// Single export used as an extension array in pages
export const headingDecorations = [headingsPlugin, layoutTheme, syntaxHighlighting(headingTokens)];
