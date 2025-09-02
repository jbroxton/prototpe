"use client";

import { Play, ZoomIn, ZoomOut, Smartphone, Monitor } from "lucide-react";
import { type DSL } from "../lib/dsl";

type Props = {
  children: React.ReactNode;
  dsl: DSL;
  zoom: number;
  onZoom: (z: number) => void;
  currentScreenId: string;
  onSelectScreen: (id: string) => void;
};

export function LayoutShell({
  children,
  dsl,
  zoom,
  onZoom,
  currentScreenId,
  onSelectScreen,
}: Props) {
  return (
    <div className="min-h-screen text-[0.95rem]">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/60 dark:bg-black/30 border-b border-black/5 dark:border-white/10">
        <div className="max-w-[1800px] mx-auto flex items-center gap-4 px-5 py-4">
          <div className="font-semibold tracking-tight">Speqq — PRD + Prototype Copilot</div>
          <div className="text-xs opacity-70">{dsl.name}</div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="opacity-70">Zoom</span>
            <button
              className="px-2 py-1 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => onZoom(Math.max(50, zoom - 10))}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={50}
              max={200}
              value={zoom}
              onChange={(e) => onZoom(parseInt(e.target.value))}
              className="w-36 accent-indigo-500"
            />
            <button
              className="px-2 py-1 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => onZoom(Math.min(200, zoom + 10))}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="tabular-nums w-10 text-right">{zoom}%</span>
          </div>
          <button
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
            title="Presentation Mode"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
        </div>
        {/* Screen chips moved to Preview panel to avoid duplication */}
      </header>
      <main className="max-w-[1800px] mx-auto min-h-0">{children}</main>
    </div>
  );
}
