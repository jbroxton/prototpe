"use client";

import { useEffect, useState } from "react";
import { SandboxRuntime } from "../sandbox/SandboxRuntime";

export function ProtoPane({ embedded }: { embedded?: boolean }) {
  const [sandboxHtml, setSandboxHtml] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const d = (e as CustomEvent).detail;
        if (d && typeof d.html === 'string') setSandboxHtml(d.html);
      } catch {}
    };
    window.addEventListener('sandbox:open', handler as any);
    return () => window.removeEventListener('sandbox:open', handler as any);
  }, []);
  const rootClass = embedded ? "h-full flex flex-col" : "h-full border-l border-white/10 bg-neutral-900/80 backdrop-blur flex flex-col";
  return (
    <aside className={rootClass}>
      <div className="flex-1 min-h-0 overflow-hidden">
        <SandboxRuntime html={sandboxHtml || ''} chromeless />
      </div>
    </aside>
  );
}
