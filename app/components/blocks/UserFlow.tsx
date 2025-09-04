"use client";

import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

export function UserFlow({ title, steps }: { title?: string; steps: { id: string; label: string; note?: string }[] }) {
  const nodeW = 220; const nodeH = 70; const gapX = 24; const gapY = 18; const perRow = 3;
  const nodes = steps.map((s, i) => {
    const row = Math.floor(i / perRow); const col = i % perRow;
    return {
      id: s.id,
      position: { x: col * (nodeW + gapX), y: row * (nodeH + gapY) },
      data: { label: (
        <div className="px-3 py-2 rounded-lg border border-white/10 bg-neutral-900/80 text-left">
          <div className="text-xs text-neutral-200">{s.label}</div>
          {s.note ? <div className="text-[11px] text-neutral-400 mt-0.5">{s.note}</div> : null}
        </div>
      )},
      style: { width: nodeW, height: nodeH, background: "transparent", border: "none" }
    } as any;
  });
  const edges = steps.slice(0, -1).map((s, i) => {
    const next = steps[i + 1];
    return { id: `${s.id}-${next.id}`, source: s.id, target: next.id, markerEnd: { type: MarkerType.ArrowClosed }, animated: false, style: { stroke: "#7c7c86" } } as any;
  });
  const height = Math.max(140, Math.ceil(steps.length / perRow) * (nodeH + gapY));
  return (
    <div className="w-full max-w-[820px] mx-auto rounded-xl border border-white/10 bg-neutral-900/80 p-3">
      {title ? <div className="text-sm font-medium mb-2">{title}</div> : null}
      <div style={{ width: '100%', height }}>
        <ReactFlow nodes={nodes as any} edges={edges as any} nodesDraggable={false} nodesConnectable={false} zoomOnScroll={false} zoomOnPinch={false} panOnScroll={true} preventScrolling={false} fitView>
          <Background color="#202026" gap={16} />
          <Controls showInteractive={false} style={{ display: 'none' }} />
        </ReactFlow>
      </div>
    </div>
  );
}
