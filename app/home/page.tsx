"use client";

import { HeaderBar } from "../components/home/HeaderBar";
import { Sidebar } from "../components/home/Sidebar";
import { ProjectCard } from "../components/home/ProjectCard";
import { TabsBar } from "../components/TabsBar";

const demoProjects = [
  { name: "Coffee Cart", status: "Active" },
  { name: "2025 Consumer Roadmap", status: "Draft" },
  { name: "Order Recommendations", status: "Active" },
  { name: "Checkout Experience", status: "Draft" },
  { name: "Loyalty & Rewards", status: "Draft" },
  { name: "Menu Management", status: "Active" },
  { name: "Store Locator", status: "Paused" },
  { name: "Barista Dashboard", status: "Draft" },
];

export default function HomePage() {
  return (
    <div className="h-screen bg-neutral-950 text-neutral-200 flex flex-col">
      <TabsBar />
      <div className="flex-1 min-h-0 grid grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="panel-shell">
              <div className="panel-card flex flex-col">
                <HeaderBar title="Recents" />
                <main className="flex-1 min-h-0 overflow-auto px-4 py-4">
                  <section className="mb-8">
                    <div className="mb-3 font-medium text-neutral-300">Recommended resources from Community</div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-40 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900" />
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="font-medium text-neutral-300">Recently viewed</div>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                      {demoProjects.map((p) => (
                        <ProjectCard
                          key={p.name}
                          name={p.name}
                          status={p.status as any}
                          href={p.name === 'Coffee Cart' ? '/requirements/1001' : p.name === '2025 Consumer Roadmap' ? '/roadmap/2001' : undefined}
                        />
                      ))}
                    </div>
                  </section>
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
