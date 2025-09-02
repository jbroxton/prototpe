"use client";

import { TabsBar } from "../../../components/TabsBar";
import { Sidebar } from "../../../components/home/Sidebar";
import { ProjectCard } from "../../../components/home/ProjectCard";
import { HeaderBar } from "../../../components/home/HeaderBar";

const demoProjects = [
  { name: "Add-on Recommendations", id: "1001", status: "Active" },
  { name: "2025 OKRS", id: "3001", status: "Active" },
  { name: "2026 OKRS", id: "3002", status: "Draft" },
  { name: "2025 Consumer Roadmap", id: "roadmap", status: "Draft" },
  { name: "Order Recommendations", id: "order-recs", status: "Active" },
  { name: "Checkout Experience", id: "checkout", status: "Draft" },
  { name: "Loyalty & Rewards", id: "loyalty", status: "Draft" },
  { name: "Menu Management", id: "menu", status: "Active" },
  { name: "Store Locator", id: "store-locator", status: "Paused" },
  { name: "Barista Dashboard", id: "barista", status: "Draft" },
];

export default function WorkspaceRecentPage() {
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
                          key={p.id}
                          name={p.name}
                          status={p.status as any}
                          href={
                            p.name === 'Add-on Recommendations' ? `/requirements/${p.id}` :
                            p.name === '2025 Consumer Roadmap' ? '/roadmap/2001' :
                            p.name === '2025 OKRS' ? '/okrs/3001' :
                            p.name === '2026 OKRS' ? '/okrs/3002' :
                            undefined
                          }
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
