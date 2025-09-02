"use client";

import { ChevronDown, Search, Clock, Grid2x2, Trash2, Star } from "lucide-react";
import { NotificationsBell } from "./Notifications";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const router = useRouter();
  return (
    <div className="panel-shell">
      <aside className="panel-card p-3 flex flex-col gap-3">
        {/* User row */}
        <div className="w-full inline-flex items-center gap-2 px-2 py-1.5 text-sm">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-neutral-900 grid place-items-center text-[12px] font-bold">J</div>
          <span className="flex-1 text-left">Justin</span>
          <ChevronDown className="w-4 h-4 text-neutral-400" />
          <div className="ml-2"><NotificationsBell /></div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input className="w-full pl-8 pr-2 py-1.5 rounded-md bg-neutral-800 border border-white/10 text-sm placeholder:text-neutral-500" placeholder="Search" />
        </div>

        <nav className="text-sm">
          <SidebarItem icon={<Clock className="w-4 h-4" />} label="Recent" onClick={() => router.push('/workspace/space-jam/recent')} />
          <SidebarItem icon={<Grid2x2 className="w-4 h-4" />} label="Templates and tools" />
        </nav>

        <div className="my-2 border-t border-white/10" />

        <div className="text-xs uppercase tracking-wide text-neutral-400 px-2 mb-1">Mobile Consumer Team</div>
        <nav className="text-sm">
          <SidebarItem icon={<span className="w-4 h-4 border rounded-sm inline-block" />} label="Files" />
          <SidebarItem icon={<span className="w-4 h-4 border rounded-sm inline-block" />} label="Projects" />
          <SidebarItem icon={<Trash2 className="w-4 h-4" />} label="Trash" />
        </nav>

        <div className="my-2 border-t border-white/10" />

        <div className="text-xs uppercase tracking-wide text-neutral-400 px-2 mb-1">Starred</div>
        <nav className="text-sm flex-1">
          <SidebarItem icon={<Star className="w-4 h-4" />} label="iOS Dark Mode" />
          <SidebarItem icon={<Star className="w-4 h-4" />} label="Apple Pay Checkout" />
          <div className="text-xs uppercase tracking-wide text-neutral-500 px-2 mt-3 mb-1">Teams</div>
          <SidebarItem icon={<Star className="w-4 h-4" />} label="Platform and Data" />
          <SidebarItem icon={<Star className="w-4 h-4" />} label="Distribution Portal" />
          <SidebarItem icon={<Star className="w-4 h-4" />} label="Consumer Web" />
        </nav>
      </aside>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: ()=>void }) {
  return (
    <button onClick={onClick} className={`w-full inline-flex items-center gap-2 px-2 py-1.5 rounded-md ${active ? "bg-neutral-800 border border-white/10" : "hover:bg-neutral-800/60"}`}>
      <span className="text-neutral-400">{icon}</span>
      <span className="text-left flex-1">{label}</span>
    </button>
  );
}
