"use client";

import { NotificationsBell } from "./Notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function HeaderBar({ title }: { title: string }) {
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);
  function newDoc() {
    const id = String(Math.floor(1000 + Math.random()*9000));
    router.push(`/requirements/${id}`);
  }
  function newRoadmap() {
    const id = String(Math.floor(1000 + Math.random()*9000));
    router.push(`/roadmap/${id}`);
  }
  function newOKR() {
    const id = String(Math.floor(1000 + Math.random()*9000));
    router.push(`/okrs/${id}`);
  }
  return (
    <header className="z-10 flex items-center gap-3 px-4 py-3 relative">
      <div className="text-sm text-neutral-400">Home</div>
      <div className="mx-1 text-neutral-600">/</div>
      <div className="font-medium">{title}</div>
      <div className="flex-1" />
      <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
        <div className="relative">
          <button
            onClick={() => setNewOpen((v) => !v)}
            className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 hover:bg-neutral-800/70"
          >
            New ▾
          </button>
          {newOpen && (
            <div
              className="absolute right-0 mt-2 min-w-44 p-1 rounded-md border border-white/10 bg-neutral-900/95 shadow-lg z-20"
              onMouseLeave={() => setNewOpen(false)}
            >
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
                onClick={() => { setNewOpen(false); newDoc(); }}
              >
                Requirements
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
                onClick={() => { setNewOpen(false); newRoadmap(); }}
              >
                Roadmap
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
                onClick={() => { setNewOpen(false); router.push('/okrs'); }}
              >
                OKRs
              </button>
            </div>
          )}
        </div>
      </div>
      {/* notifications moved to sidebar */}
    </header>
  );
}
