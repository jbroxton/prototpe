"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
// custom CSS-based editor theme only

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

type Props = { value: string; onChange: (v: string) => void; error: string | null };

export function DSLEditor({ value, onChange, error }: Props) {
  const [extensions, setExtensions] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const mod = await import("@codemirror/lang-yaml");
      const blackTheme = EditorView.theme(
        {
          "&": { backgroundColor: "#0b0b0b", color: "#e5e7eb" },
          ".cm-scroller": { backgroundColor: "#0b0b0b" },
          ".cm-content": { caretColor: "#ffffff" },
          ".cm-gutters": { backgroundColor: "#0a0a0a", color: "#9ca3af", border: "none" },
          ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.04)" },
          ".cm-selectionBackground, .cm-content ::selection": { backgroundColor: "rgba(99,102,241,0.35)" },
          ".cm-lineNumbers .cm-gutterElement": { color: "#6b7280" },
        },
        { dark: true }
      );
      setExtensions([mod.yaml(), blackTheme]);
    })();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/60 text-white">
        <div className="font-medium">Prototype DSL</div>
        <div className="text-xs opacity-70">YAML</div>
      </div>
      {error && (
        <div className="px-3 py-2 text-sm bg-red-500/20 text-red-100 border-b border-red-500/30">
          {error}
        </div>
      )}
      <div className="flex-1 min-h-0">
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
