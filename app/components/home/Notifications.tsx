"use client";

import { Bell, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  useEffect(() => {
    function place() {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: Math.max(8, r.top), left: r.right + 8 });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button ref={btnRef} onClick={()=>setOpen((v)=>!v)} className="ml-2 p-2 rounded-md border border-white/10 bg-neutral-900 hover:bg-neutral-800">
        <Bell className="w-4 h-4 text-neutral-300" />
      </button>
      {open && (
        <div className="fixed z-50 w-[420px] rounded-xl border border-white/10 bg-neutral-900 shadow-2xl" style={{ top: pos.top, left: pos.left }}>
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm font-medium">All notifications</div>
            <button className="p-1 rounded-md border border-white/10 bg-neutral-800"><Settings2 className="w-4 h-4"/></button>
          </div>
          <div className="px-3 py-2 text-sm flex items-center gap-3 border-b border-white/10">
            <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800">All</button>
            <button className="px-2 py-1 rounded-md border border-white/10">Requests</button>
            <button className="px-2 py-1 rounded-md border border-white/10">Unread</button>
            <div className="flex-1" />
            <button className="text-xs text-neutral-400 hover:text-neutral-200">Mark all as read</button>
          </div>
          <div className="p-3 text-sm text-neutral-200 space-y-2">
            <div className="rounded-lg border border-white/10 bg-neutral-800/40 p-3">
              <div className="font-medium">Adam invited you to collaborate</div>
              <div className="text-neutral-400 text-xs mt-0.5">Refund user experience PRD • just now</div>
              <div className="mt-2 flex gap-2">
                <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Decline</button>
                <button className="px-2 py-1 rounded-md border border-indigo-500/40 bg-indigo-600/20 text-xs">Accept</button>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-neutral-800/40 p-3">
              <div className="font-medium">Reminder: Your Q4 OKRs are due in 2 weeks</div>
              <div className="text-neutral-400 text-xs mt-0.5">Workspace • due soon</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
