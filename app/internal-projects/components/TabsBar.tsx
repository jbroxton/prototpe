"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Tab = {
  id: string; // 'home' or projectId
  href: string;
  label: string;
  pinned?: boolean;
};

const STORAGE_KEY = "internal-projects:tabs";

export default function TabsBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const activeHref = pathname || "/internal-projects";

  const isHome = activeHref === "/internal-projects";
  const projectMatch = useMemo(() => {
    // Match /internal-projects/:projectId (optionally with /unified)
    const m = activeHref.match(/^\/internal-projects\/([^\/]+)(?:\/.*)?$/);
    if (m && m[1] && m[1] !== "view") return m[1];
    return null;
  }, [activeHref]);

  useEffect(() => {
    // Load existing tabs
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: Tab[] = raw ? JSON.parse(raw) : [];
      // Ensure Home pinned
      const home: Tab = { id: "home", href: "/internal-projects", label: "Home", pinned: true };
      let next = existing.some(t => t.id === "home") ? existing : [home, ...existing];

      // Add current project tab if on a project route
      if (projectMatch) {
        const id = projectMatch;
        const href = `/internal-projects/${id}`;
        if (!next.some(t => t.id === id)) {
          next = [...next, { id, href, label: `Project ${id.slice(0,4)}…` }];
          // Try fetching project name for label (best-effort)
          fetch(`/api/internal-projects?projectId=${encodeURIComponent(id)}`)
            .then(r => r.json()).then(j => {
              const name = j?.data?.name;
              if (name) {
                setTabs(prev => {
                  const updated = prev.map(t => t.id === id ? { ...t, label: name } : t);
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                  return updated;
                });
              }
            }).catch(()=>{});
        }
      }

      setTabs(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectMatch, isHome]);

  function activate(tab: Tab) {
    router.push(tab.href);
  }

  function closeTab(tab: Tab) {
    if (tab.pinned) return; // cannot close Home
    setTabs(prev => {
      const updated = prev.filter(t => t.id !== tab.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // If closing the active tab, navigate to the last tab or Home
      if (activeHref === tab.href) {
        const fallback = updated.find(t => t.id !== "home") || updated.find(t => t.id === "home");
        if (fallback) router.push(fallback.href);
      }
      return updated;
    });
  }

  return (
    <div className="sticky top-0 z-30 w-full bg-neutral-950/80 backdrop-blur">
      {/* add slight top padding so rounded buttons are not visually clipped against the viewport edge */}
      <div className="px-3 py-3 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeHref === tab.href;
          return (
            <div key={tab.id} className="flex items-center">
              <Button
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target && target.dataset && target.dataset.close === '1') {
                    e.stopPropagation();
                    if (!tab.pinned) closeTab(tab);
                    return;
                  }
                  activate(tab);
                }}
                className="rounded-md group flex items-center whitespace-nowrap"
                aria-current={active ? 'page' : undefined}
                aria-label={tab.label}
              >
                <span className="truncate max-w-[22ch]">{tab.label}</span>
                {!tab.pinned && (
                  <span
                    data-close="1"
                    aria-hidden="true"
                    className={`${active ? 'inline' : 'hidden group-hover:inline'} ml-1 transition-colors text-neutral-400 hover:text-neutral-200`}
                    title={`Close ${tab.label}`}
                  >
                    ×
                  </span>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
