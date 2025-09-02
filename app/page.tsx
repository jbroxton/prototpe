"use client";

import { useMemo, useState } from "react";
import { Copilot } from "./components/Copilot";
import { PRDEditor } from "./components/PRDEditor";
import { PrototypePreview } from "./components/PrototypePreview";
import { LayoutShell } from "./components/LayoutShell";
import { PrototypeChat } from "./components/PrototypeChat";
import { TabsBar } from "./components/TabsBar";
import { initialDSLYaml, initialPRD } from "./lib/seed";
import { parseDSL, stringifyDSL, type DSL } from "./lib/dsl";
import { parseRequirements, updateRequirementChecks, parseMilestones } from "./lib/prd";

export default function Home() {
  const [prd, setPrd] = useState<string>(initialPRD);
  const [dslText, setDslText] = useState<string>(initialDSLYaml);
  const [dsl, setDsl] = useState<DSL>(() => parseDSL(initialDSLYaml));
  const [currentScreenId, setCurrentScreenId] = useState<string>(
    dsl.screens[0]?.id || ""
  );
  const [zoom, setZoom] = useState<number>(100);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>("");
  const [centerMode, setCenterMode] = useState<"prd" | "proto">("prd");

  // DSL editing is handled by Copilot only (DSL editor hidden)

  const handleApply = (updates: { prd?: string; dsl?: DSL | string }) => {
    if (typeof updates.prd === "string") setPrd(updates.prd);
    if (updates.dsl) {
      const nextText = typeof updates.dsl === "string" ? updates.dsl : stringifyDSL(updates.dsl);
      setDslText(nextText);
      try {
        setDsl(parseDSL(nextText));
        setError(null);
      } catch (e: any) {
        setError(e.message || "Invalid DSL");
      }
    }
  };

  const modifyDSL = (updater: (d: DSL) => void) => {
    const clone: DSL = JSON.parse(JSON.stringify(dsl));
    updater(clone);
    setDsl(clone);
    setDslText(stringifyDSL(clone));
  };

  const handleAddScreenPRDNote = (name: string) => {
    // Append a simple PRD note under User Journeys to reflect added screen
    const sectionHeader = "## User Journeys";
    if (prd.includes(sectionHeader)) {
      // insert a bullet at end of section (simple heuristic)
      const lines = prd.split("\n");
      const idx = lines.findIndex((l) => l.trim().toLowerCase() === sectionHeader.toLowerCase());
      if (idx !== -1) {
        // find next section or end
        let j = idx + 1;
        while (j < lines.length && !lines[j].startsWith("## ")) j++;
        lines.splice(j, 0, `- Includes ${name} step`);
        setPrd(lines.join("\n"));
        return;
      }
    }
    setPrd((p) => p.trimEnd() + `\n\n## User Journeys\n- Includes ${name} step\n`);
  };

  const syncFromPRD = () => {
    // 1) Ensure referenced screens exist (from PRD text)
    const lower = prd.toLowerCase();
    const want: string[] = [];
    const known = ["home", "details", "checkout", "confirmation", "dashboard", "login"];
    known.forEach((k) => { if (lower.includes(k)) want.push(k); });
    modifyDSL((d) => {
      want.forEach((k) => {
        if (!d.screens.find((s) => s.id === k)) {
          d.screens.push({ id: k, name: k[0].toUpperCase() + k.slice(1), device: k === "dashboard" ? "web" : "mobile", size: k === "dashboard" ? { width: 1280, height: 800 } : undefined, components: [ { type: (k === "dashboard") ? "header" : "navbar", frame: { x: 0, y: 0, w: (k === "dashboard") ? 1280 : 390, h: (k === "dashboard") ? 64 : 56 }, props: { title: k[0].toUpperCase() + k.slice(1) } } ] } as any);
        }
      });
    });

    // 2) Milestones: tag screens/components by version groups (V0->M0, etc.)
    const ms = parseMilestones(prd);
    const versionToM = (v: "V0"|"V1"|"V2") => (v === "V0" ? "M0" : v === "V1" ? "M1" : "M2");
    modifyDSL((d) => {
      ms.forEach((group) => {
        // CUJ: infer screens mentioned and tag them with milestone
        group.items.filter(it=>it.type==="CUJ").forEach((it) => {
          const lower = it.text.toLowerCase();
          ["home","details","checkout","confirmation","dashboard","login"].forEach((id) => {
            if (lower.includes(id)) {
              const s = d.screens.find((x)=>x.id===id);
              if (s) s.milestone = versionToM(group.version) as any;
            }
          });
        });
      });
    });

    // 3) Map PRD Requirements bullets to visible elements + checkbox status
    const reqs = parseRequirements(prd);
    const checks: Record<number, boolean> = {};
    modifyDSL((d) => {
      reqs.forEach((r) => {
        const screenId = r.page as any;
        const s = d.screens.find((x) => x.id === screenId) || d.screens[0];
        if (!s) return;
        const safeY = (base: number) => {
          // place below existing components
          const last = s.components.reduce((m, c) => Math.max(m, c.frame.y + c.frame.h), 64);
          return Math.max(base, last + 12);
        };
        const has = (type: string) => s.components.some((c) => c.type === type);
        switch (r.kind) {
          case "search":
            if (!s.components.some((c) => c.type === "input" && String(c.props?.placeholder || "").toLowerCase().includes("search"))) {
              s.components.push({ type: "input", frame: { x: 16, y: safeY(72), w: s.device === "web" ? 420 : 358, h: 40 }, props: { placeholder: "Search..." }, milestone: d.screens.find(x=>x.id===screenId)?.milestone || "M1" } as any);
            }
            checks[r.lineIndex] = true;
            break;
          case "dropdown":
            if (!has("dropdown")) {
              s.components.push({ type: "dropdown", frame: { x: 16, y: safeY(120), w: s.device === "web" ? 240 : 240, h: 40 }, props: {}, milestone: d.screens.find(x=>x.id===screenId)?.milestone || "M1" } as any);
            }
            checks[r.lineIndex] = true;
            break;
          case "list":
            if (!has("list")) {
              s.components.push({ type: "list", frame: { x: 16, y: safeY(160), w: s.device === "web" ? 600 : 358, h: 200 }, props: {}, milestone: d.screens.find(x=>x.id===screenId)?.milestone || "M0" } as any);
            }
            checks[r.lineIndex] = true;
            break;
          case "carousel":
            if (!has("carousel")) {
              s.components.push({ type: "carousel", frame: { x: 16, y: safeY(200), w: s.device === "web" ? 800 : 358, h: 140 }, props: {}, milestone: d.screens.find(x=>x.id===screenId)?.milestone || "M1" } as any);
            }
            checks[r.lineIndex] = true;
            break;
          case "video":
            if (!has("video")) {
              s.components.push({ type: "video", frame: { x: 16, y: safeY(240), w: s.device === "web" ? 600 : 358, h: 180 }, props: {}, milestone: d.screens.find(x=>x.id===screenId)?.milestone || "M2" } as any);
            }
            checks[r.lineIndex] = true;
            break;
          case "button":
          case "input":
          default:
            if (!has(r.kind)) {
              const type = r.kind === "button" ? "button" : "input";
              s.components.push({ type, frame: { x: 16, y: safeY(280), w: s.device === "web" ? 200 : 200, h: 44 }, props: { text: type === "button" ? "Continue" : undefined, placeholder: type === "input" ? "Input" : undefined }, milestone: d.screens.find(x=>x.id===screenId)?.milestone || "M0" } as any);
            }
            checks[r.lineIndex] = true;
            break;
        }
      });
    });
    // Update PRD checkboxes
    setPrd((p) => updateRequirementChecks(p, checks));

    setLastSync(new Date().toLocaleTimeString());
  };

  return (
    <>
    <TabsBar />
    <LayoutShell
      dsl={dsl}
      zoom={zoom}
      onZoom={setZoom}
      currentScreenId={currentScreenId}
      onSelectScreen={setCurrentScreenId}
    >
      <div className="grid grid-cols-[300px_minmax(0,1fr)_minmax(0,1.25fr)] gap-4 h-[calc(100vh-88px)] p-4">
        <div className="rounded-xl bg-white/70 dark:bg-black/30 backdrop-blur border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
          <Copilot prd={prd} dsl={dsl} dslText={dslText} onApply={handleApply} />
        </div>
        <div className="rounded-xl overflow-hidden min-h-0 h-full">
          <div className="rounded-xl bg-black/60 border border-white/10 shadow-sm h-full min-h-0 flex flex-col overflow-hidden">
            {centerMode === 'prd' ? (
              <PRDEditor value={prd} onChange={setPrd} onOpenPrototype={()=>setCenterMode('proto')} />
            ) : (
              <PrototypeChat onBack={()=>setCenterMode('prd')} />
            )}
          </div>
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-black/30 backdrop-blur border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
          <PrototypePreview
            dsl={dsl}
            currentScreenId={currentScreenId}
            onSelectScreen={setCurrentScreenId}
            zoom={zoom}
            onModifyDSL={modifyDSL}
            onAddScreen={handleAddScreenPRDNote}
            onSyncFromPRD={syncFromPRD}
            lastSync={lastSync}
            prd={prd}
          />
        </div>
      </div>
    </LayoutShell>
    </>
  );
}
