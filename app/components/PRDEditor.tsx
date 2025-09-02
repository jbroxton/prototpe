"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
// use custom CSS-based dark theme, no oneDark background

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

type Props = { value: string; onChange: (v: string) => void; onOpenPrototype?: () => void };

export function PRDEditor({ value, onChange, onOpenPrototype }: Props) {
  const [extensions, setExtensions] = useState<any[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    (async () => {
      const mod = await import("@codemirror/lang-markdown");
      const blackTheme = EditorView.theme(
        {
          "&": { backgroundColor: "#0b0b0b", color: "#e5e7eb" },
          ".cm-scroller": { backgroundColor: "#0b0b0b" },
          ".cm-content": { caretColor: "#ffffff" },
          ".cm-gutters": { backgroundColor: "#0a0a0a", color: "#9ca3af", border: "none" },
          ".cm-activeLine": { backgroundColor: "transparent" },
          ".cm-activeLineGutter": { backgroundColor: "transparent" },
          ".cm-selectionBackground, .cm-content ::selection": { backgroundColor: "rgba(99,102,241,0.35)" },
          ".cm-lineNumbers .cm-gutterElement": { color: "#6b7280" },
        },
        { dark: true }
      );
      const { headingDecorations } = await import("../lib/editor/heading");
      setExtensions([mod.markdown(), EditorView.lineWrapping, blackTheme, headingDecorations]);
    })();
  }, []);

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden" ref={wrapRef}
      onWheel={(e) => {
        // Ensure wheel always scrolls the internal scroller
        const scroller = wrapRef.current?.querySelector<HTMLElement>(".cm-scroller");
        if (scroller) {
          scroller.scrollTop += e.deltaY;
          e.preventDefault();
        }
      }}
    >
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/60 text-white">
        <div className="font-medium">PRD Editor</div>
        <div className="flex items-center gap-2">
          <div className="text-xs opacity-70">Markdown</div>
          <button onClick={onOpenPrototype} className="ml-2 px-2 py-1 rounded-md border border-white/10 bg-indigo-600 text-white text-xs">Prototype</button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeMirror
          value={value}
          height="100%"
          theme={undefined}
          basicSetup={{ lineNumbers: false, foldGutter: false }}
          extensions={extensions}
          onChange={(v) => onChange(v)}
        />
      </div>
    </div>
  );
}
