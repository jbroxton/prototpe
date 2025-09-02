"use client";

import Link from "next/link";

type Status = "Active" | "Draft" | "Paused" | "Archive";

export function ProjectCard({ name, status, href }: { name: string; status: Status; href?: string }) {
  const color = status === "Active" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
               status === "Draft" ? "bg-neutral-700 text-neutral-300 border-white/10" :
               status === "Paused" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
               "bg-neutral-800 text-neutral-400 border-white/10";
  const content = (
    <div className="rounded-xl border border-white/10 bg-neutral-900 hover:bg-neutral-900/80 transition shadow-sm overflow-hidden">
      <div className="h-28 bg-neutral-800" />
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="font-medium text-neutral-200 text-sm truncate" title={name}>{name}</div>
        <span className={`ml-2 px-2 py-0.5 rounded-md border text-[11px] ${color}`}>{status}</span>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block cursor-pointer">{content}</Link>
  ) : content;
}
