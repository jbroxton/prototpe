"use client";

import { DSL, Screen } from "../lib/dsl";
import { ChevronRight, Plus, SquareStack, Layers, PanelRight } from "lucide-react";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Inspector } from "./Inspector";
import { parseMilestones, parseUserJourneys } from "../lib/prd";

type Props = {
  dsl: DSL;
  currentScreenId: string;
  onSelectScreen: (id: string) => void;
  zoom: number; // 50-200
  onModifyDSL: (updater: (d: DSL) => void) => void;
  onAddScreen?: (name: string) => void;
  onSyncFromPRD?: () => void;
  lastSync?: string;
  prd: string;
  hideLeftPane?: boolean;
  hideHeader?: boolean;
};

export function PrototypePreview({ dsl, currentScreenId, onSelectScreen, zoom, onModifyDSL, onAddScreen, onSyncFromPRD, lastSync, prd, hideLeftPane, hideHeader }: Props) {
  const current = useMemo(() => dsl.screens.find((s) => s.id === currentScreenId) || dsl.screens[0], [dsl, currentScreenId]);
  const scale = zoom / 100;
  const baseW = current?.device === "web" ? current.size?.width ?? 1200 : 390;
  const baseH = current?.device === "web" ? current.size?.height ?? 800 : 844;
  const dropRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [leftMode, setLeftMode] = useState<"components" | "pages" | "inspector">("components");
  const [milestone, setMilestone] = useState<"M0"|"M1"|"M2">("M0");
  const [overlayOpenByScreen, setOverlayOpenByScreen] = useState<Record<string, boolean>>({});
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [wrapWidth, setWrapWidth] = useState<number>(0);
  useEffect(() => {
    if (!canvasWrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width || 0;
      setWrapWidth(w);
    });
    ro.observe(canvasWrapRef.current);
    return () => ro.disconnect();
  }, []);
  const effectiveScale = useMemo(() => {
    if (!wrapWidth) return scale;
    const maxW = Math.max(200, wrapWidth - 24);
    return Math.min(scale, maxW / baseW);
  }, [scale, wrapWidth, baseW]);

  // CUJ options from PRD (Milestones and generic User Journeys)
  const cujOptions = useMemo(() => {
    const ms = parseMilestones(prd);
    const msCUJs = ms.flatMap((g) => g.items.filter((i) => i.type === "CUJ").map((i) => ({ label: `${g.version}: ${i.text}`, text: i.text })));
    const uj = parseUserJourneys(prd).map((t) => ({ label: t, text: t }));
    const merged = [...msCUJs, ...uj];
    // dedupe by label
    const seen = new Set<string>();
    return merged.filter((o) => (seen.has(o.label) ? false : (seen.add(o.label), true)));
  }, [prd]);
  const [selectedCUJ, setSelectedCUJ] = useState<string>("");
  useEffect(() => { if (!selectedCUJ && cujOptions.length) setSelectedCUJ(cujOptions[0].text); }, [cujOptions, selectedCUJ]);

  const playCUJ = () => {
    if (!selectedCUJ) return;
    const steps = selectedCUJ
      .split(/→|->|=>/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const ids = steps
      .map((token) => {
        // find by id or by name match
        const s = dsl.screens.find((sc) => sc.id.toLowerCase() === token || sc.name.toLowerCase() === token);
        return s?.id;
      })
      .filter((x): x is string => !!x);
    if (!ids.length) return;
    let i = 0;
    const tick = () => {
      onSelectScreen(ids[i]);
      i++;
      if (i < ids.length) setTimeout(tick, 900);
    };
    tick();
  };

  return (
    <div className="h-full flex flex-col">
      {!hideHeader && (
      <div className="px-3 py-2 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-gradient-to-b from-white/60 to-white/40 dark:from-black/20 dark:to-black/10">
        <div className="font-medium">Preview</div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs">
            <span className="opacity-70">Milestone</span>
            {(["M0","M1","M2"] as const).map((m) => (
              <button key={m} onClick={()=>setMilestone(m)} className={`px-2 py-1 rounded-md border text-xs ${milestone===m?"bg-indigo-600 text-white border-indigo-600":"border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"}`}>{m}</button>
            ))}
          </div>
          {cujOptions.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="opacity-70">CUJ</span>
              <select value={selectedCUJ} onChange={(e)=>setSelectedCUJ(e.target.value)} className="px-2 py-1 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5">
                {cujOptions.map((o, idx)=> (
                  <option key={idx} value={o.text}>{o.label}</option>
                ))}
              </select>
              <button onClick={playCUJ} className="px-2 py-1 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10">Play</button>
            </div>
          )}
          <div className="text-xs opacity-70">{current?.name}</div>
          <span className="mx-2 h-5 w-px bg-black/10 dark:bg-white/10" />
          <button
            onClick={() => {
              const name = window.prompt("New screen name", "New Screen");
              if (!name) return;
              const device = window.confirm("Use web layout? (Cancel for mobile)") ? "web" : "mobile";
              const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              onModifyDSL((d) => {
                const exists = d.screens.some((s) => s.id === id);
                const makeId = (base: string) => {
                  let i = 2;
                  let next = base;
                  while (d.screens.some((s) => s.id === next)) next = `${base}-${i++}`;
                  return next;
                };
                const finalId = exists ? makeId(id) : id;
                d.screens.push({
                  id: finalId,
                  name,
                  device: device as any,
                  size: device === "web" ? { width: 1280, height: 800 } : undefined,
                  components: [
                    { type: device === "web" ? "navbar-web" : "navbar", frame: { x: 0, y: 0, w: device === "web" ? 1280 : 390, h: device === "web" ? 64 : 56 }, props: { title: name } },
                  ],
                } as any);
                onSelectScreen(finalId);
              });
              onAddScreen && onAddScreen(name);
            }}
            className="p-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center gap-1"
            title="Add screen"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onSyncFromPRD}
            className={`p-2 rounded-md border text-xs border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10`}
            title={`Sync from PRD${lastSync ? ` · ${lastSync}` : ""}`}
          >
            Sync
          </button>
        </div>
      </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="h-full grid" style={{ gridTemplateColumns: hideLeftPane ? `minmax(600px,1fr)` : `200px minmax(600px,1fr)` }}>
          {!hideLeftPane && (
            <LeftPane mode={leftMode} dsl={dsl} onSelectScreen={onSelectScreen} inspector={<Inspector dsl={dsl} current={current} selectedIdx={selectedIdx} onChange={(updater) => onModifyDSL((d) => { const s = d.screens.find((s)=>s.id===current?.id); if(!s)return; updater(s); })} />} setMode={setLeftMode} />
          )}
          <div ref={canvasWrapRef} className="min-w-0 overflow-auto p-6" onClick={() => setSelectedIdx(null)}>
            <div className="mx-auto" style={{ width: baseW * effectiveScale }}>
              <DeviceFrame device={current?.device || "mobile"} width={baseW} height={baseH} scale={effectiveScale} background={current?.background}>
                <div
                  ref={dropRef}
                  className="relative"
                  style={{ width: baseW, height: baseH }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData("application/x-component");
                  if (!data || !current) return;
                  const comp = JSON.parse(data) as { type: string; defaultSize: { w: number; h: number } };
                  const rect = dropRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  let x = Math.round((e.clientX - rect.left) / scale);
                  let y = Math.round((e.clientY - rect.top) / scale);

                  onModifyDSL((d) => {
                    const scr = d.screens.find((s) => s.id === current.id);
                    if (!scr) return;

                    const isNavbarLike = (t: string) => t === "navbar" || t === "navbar-web" || t === "header";
                    const isSidebar = (t: string) => t === "sidebar";
                    const isBottomNav = (t: string) => t === "bottomnav";
                    const deviceIsWeb = current.device === "web";
                    const topBarH = scr.components.reduce((acc, c) => acc || (isNavbarLike(c.type) ? (deviceIsWeb ? 64 : 56) : 0), 0);
                    const sideBarW = deviceIsWeb ? scr.components.reduce((acc, c) => acc || (isSidebar(c.type) ? (c.frame.w || 240) : 0), 0) : 0;
                    const bottomBarH = !deviceIsWeb ? scr.components.reduce((acc, c) => acc || (isBottomNav(c.type) ? (c.frame.h || 56) : 0), 0) : 0;

                    if (isNavbarLike(comp.type)) {
                      const typeFinal = deviceIsWeb ? "navbar-web" : "navbar";
                      const barH = deviceIsWeb ? 64 : 56;
                      // remove any existing navbar-like components
                      const hadBar = scr.components.some((c) => isNavbarLike(c.type));
                      scr.components = scr.components.filter((c) => !isNavbarLike(c.type));
                      // if adding a new bar, push existing components down if there wasn't one before
                      if (!hadBar) {
                        scr.components = scr.components.map((c) =>
                          isNavbarLike(c.type) ? c : { ...c, frame: { ...c.frame, y: c.frame.y + barH + 8 } }
                        );
                      }
                      // add navbar at the top, full width
                      scr.components.unshift({ type: comp.type === 'header' ? 'header' : typeFinal, frame: { x: 0, y: 0, w: baseW, h: barH }, props: { title: current.name } } as any);
                      return;
                    }

                    if (isSidebar(comp.type)) {
                      if (deviceIsWeb) {
                        const width = 240;
                        const hadSide = scr.components.some((c) => isSidebar(c.type));
                        scr.components = scr.components.filter((c) => !isSidebar(c.type));
                        const pad = 8;
                        const left = width + pad;
                        const top = topBarH + pad;
                        const safeRight = baseW - pad;
                        const safeBottom = baseH - pad;
                        // shift and clamp existing components into safe rect
                        scr.components = scr.components.map((c) => {
                          if (isNavbarLike(c.type)) return c;
                          const nx = Math.max(left, c.frame.x + (hadSide ? 0 : width + 12));
                          const ny = Math.max(top, c.frame.y);
                          const nw = Math.min(c.frame.w, safeRight - nx);
                          const nh = Math.min(c.frame.h, safeBottom - ny);
                          return { ...c, frame: { x: nx, y: ny, w: nw, h: nh } };
                        });
                        const y0 = topBarH ? topBarH : 0;
                        scr.components.unshift({ type: 'sidebar', frame: { x: 0, y: y0, w: width, h: baseH - y0 }, props: {} } as any);
                      } else {
                        // Mobile: render as overlay drawer (doesn't push content)
                        // ensure only one overlay drawer exists
                        scr.components = scr.components.filter((c) => c.type !== 'sidebarOverlay');
                        scr.components.push({ type: 'sidebarOverlay', frame: { x: 0, y: 0, w: 280, h: baseH }, props: {} } as any);
                        setOverlayOpenByScreen((prev) => ({ ...prev, [current.id]: true }));
                      }
                      return;
                    }

                    // keep components below any existing navbar area
                    if (topBarH && y < topBarH + 8) y = topBarH + 8;
                    if (sideBarW && x < sideBarW + 8) x = sideBarW + 8;
                    if (bottomBarH && y > baseH - bottomBarH - 8) y = baseH - bottomBarH - 8;

                    const newComp = {
                      type: comp.type,
                      frame: { x, y, w: comp.defaultSize.w, h: comp.defaultSize.h },
                      props: {},
                    } as any;

                    // simple vertical collision resolution: if overlapping, nudge below
                    const overlaps = (a: any, b: any) =>
                      a.frame.x < b.frame.x + b.frame.w &&
                      a.frame.x + a.frame.w > b.frame.x &&
                      a.frame.y < b.frame.y + b.frame.h &&
                      a.frame.y + a.frame.h > b.frame.y;

                    let safety = 0;
                    const margin = 8;
                    while (scr.components.some((c) => overlaps(newComp, c)) && safety < 50) {
                      // push just below the lowest intersecting component
                      let maxBottom = newComp.frame.y;
                      scr.components.forEach((c) => {
                        if (overlaps(newComp, c)) {
                          const bottom = c.frame.y + c.frame.h;
                          if (bottom > maxBottom) maxBottom = bottom;
                        }
                      });
                      newComp.frame.y = maxBottom + margin;
                      safety++;
                    }

                    scr.components.push(newComp);
                    setSelectedIdx(scr.components.length - 1);
                  });
                }}
              >
                <ScreenRender
                  screen={current}
                  onNavigate={onSelectScreen}
                  onModify={onModifyDSL}
                  scale={scale}
                  selectedIdx={selectedIdx}
                  onSelectIdx={setSelectedIdx}
                  baseW={baseW}
                  baseH={baseH}
                  overlayOpen={!!overlayOpenByScreen[current?.id || '']}
                  setOverlayOpen={(v) => setOverlayOpenByScreen((prev) => ({ ...prev, [current?.id || '']: v }))}
                  milestone={milestone}
                />
              </div>
            </DeviceFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceFrame({ device, width, height, scale, background, children }: { device: "mobile" | "web"; width: number; height: number; scale: number; background?: string; children: React.ReactNode }) {
  const outerRadius = device === 'mobile' ? 42 : 16;
  const innerRadius = device === 'mobile' ? 32 : 12;
  return (
    <div
      className={`relative mx-auto border border-black/20 dark:border-white/20 shadow-2xl bg-neutral-900`}
      style={{ width: width * scale, height: height * scale, borderRadius: outerRadius }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: innerRadius, background: background || (device === 'mobile' ? '#f8fafc' : '#ffffff') }}
      >
        <div className="h-full w-full overflow-y-auto pr-2 mr-[-8px]">
          <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenRender({ screen, onNavigate, onModify, scale, selectedIdx, onSelectIdx, baseW, baseH, overlayOpen, setOverlayOpen, milestone }: { screen?: Screen; onNavigate: (id: string) => void; onModify?: (updater: (d: DSL) => void) => void; scale?: number; selectedIdx: number | null; onSelectIdx: (i: number | null) => void; baseW: number; baseH: number; overlayOpen: boolean; setOverlayOpen: (v: boolean) => void; milestone: "M0"|"M1"|"M2" }) {
  if (!screen) return null;
  // milestone helpers
  const order = { M0: 0, M1: 1, M2: 2 } as const;
  const handleDrag = useCallback((idx: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = { x: screen.components[idx].frame.x, y: screen.components[idx].frame.y, w: screen.components[idx].frame.w, h: screen.components[idx].frame.h };
    const move = (ev: MouseEvent) => {
      const dx = Math.round((ev.clientX - startX) / (scale || 1));
      const dy = Math.round((ev.clientY - startY) / (scale || 1));
      onModify?.((d) => {
        const s = d.screens.find((s) => s.id === screen.id);
        if (!s) return;
        const deviceIsWeb = s.device === 'web';
        const topBarH = s.components.reduce((acc, comp) => acc || ((comp.type === 'navbar' || comp.type === 'navbar-web' || comp.type==='header') ? (deviceIsWeb ? 64 : 56) : 0), 0);
        const sideBarW = deviceIsWeb ? s.components.reduce((acc, comp) => acc || (comp.type === 'sidebar' ? (comp.frame.w || 240) : 0), 0) : 0;
        const bottomBarH = !deviceIsWeb ? s.components.reduce((acc, comp) => acc || (comp.type === 'bottomnav' ? (comp.frame.h || 56) : 0), 0) : 0;
        const pad = 8;
        const left = sideBarW + pad;
        const top = topBarH + pad;
        const right = baseW - pad;
        const bottom = baseH - bottomBarH - pad;
        const nx = Math.min(Math.max(orig.x + dx, left), right - orig.w);
        const ny = Math.min(Math.max(orig.y + dy, top), bottom - orig.h);
        s.components[idx].frame.x = nx;
        s.components[idx].frame.y = ny;
      });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [onModify, scale, screen]);
  return (
    <div className="relative w-full h-full">
      {screen.components.map((c, i) => {
        // visibility by milestone: appears if (c.milestone ?? screen.milestone ?? 'M0') <= current, and not past 'until'
        const startM = (c.milestone || (screen.milestone as any) || "M0") as "M0"|"M1"|"M2";
        const untilM = (c.until as any) as ("M0"|"M1"|"M2"|undefined);
        if (order[startM] > order[milestone]) return null;
        if (untilM && order[milestone] > order[untilM]) return null;
        const deviceIsWeb = screen.device === 'web';
        const topBarH = screen.components.reduce((acc, comp) => acc || ((comp.type === 'navbar' || comp.type === 'navbar-web' || comp.type==='header') ? (deviceIsWeb ? 64 : 56) : 0), 0);
        const sideBarW = deviceIsWeb ? screen.components.reduce((acc, comp) => acc || (comp.type === 'sidebar' ? (comp.frame.w || 240) : 0), 0) : 0;
        const bottomBarH = !deviceIsWeb ? screen.components.reduce((acc, comp) => acc || (comp.type === 'bottomnav' ? (comp.frame.h || 56) : 0), 0) : 0;
        const pad = 8;
        let x = c.frame.x;
        let y = c.frame.y;
        let w = c.frame.w;
        let h = c.frame.h;
        if (!(c.type === 'navbar' || c.type === 'navbar-web' || c.type==='header' || c.type==='sidebar' || c.type==='bottomnav')) {
          if (x < sideBarW + pad) x = sideBarW + pad;
          if (y < topBarH + pad) y = topBarH + pad;
          const maxW = Math.max(80, baseW - x - pad);
          if (w > maxW) w = maxW;
        }
        const box = { position: 'absolute' as const, left: x, top: y, width: w, height: h };
        const selected = selectedIdx === i;
        const baseBoxCls = `rounded-md border ${selected ? "border-indigo-500 ring-2 ring-indigo-500" : "border-black/20"}`;
        switch (c.type) {
          case "navbar":
            return (
              <div key={i} style={{ ...box, height: 56 }} className={`flex items-center justify-center font-medium text-sm bg-white border-b border-black/10 select-none ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
              >
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-black/10 grid place-items-center" onClick={(e) => { e.stopPropagation(); setOverlayOpen(!overlayOpen); }}>
                  <div className="w-3 h-0.5 bg-black mb-0.5" />
                  <div className="w-3 h-0.5 bg-black mb-0.5" />
                  <div className="w-3 h-0.5 bg-black" />
                </div>
                <div className="text-black">{c.props?.title || "Navbar"}</div>
              </div>
            );
          case "header":
            return (
              <div key={i} style={{ ...box, height: 64 }} className={`flex items-center px-6 bg-white border-b border-black/10 select-none ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
              >
                <div className="font-semibold text-black">{c.props?.title || "Header"}</div>
              </div>
            );
          case "sidebar":
            return (
              <div key={i} style={box as any} className={`bg-white border-r border-black/10 h-full ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
              >
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="px-3 py-2 border-b border-black/10"><div className="h-3 w-2/3 bg-black/10 rounded" /></div>
                ))}
              </div>
            );
          case "card":
            return (
              <div key={i} style={box as any} className={`bg-white text-black p-3 ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
                onDoubleClick={() => c.linkTo && onNavigate(c.linkTo)}
              >
                <div className="h-20 w-full mb-2 border border-dashed border-black/20 rounded" />
                <div className="h-3 w-2/3 mb-1 bg-black/10 rounded" />
                <div className="h-3 w-1/3 bg-black/10 rounded" />
              </div>
            );
          case "cardImage":
            return (
              <div key={i} style={box as any} className={`bg-white text-black p-3 ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
                onDoubleClick={() => c.linkTo && onNavigate(c.linkTo)}
              >
                <div className="h-24 w-full mb-2 border border-dashed border-black/20 rounded bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.06)_6px,rgba(0,0,0,0.06)_12px)]" />
                <div className="h-3 w-2/3 mb-1 bg-black/10 rounded" />
                <div className="h-3 w-1/3 bg-black/10 rounded" />
              </div>
            );
          case "text":
            return (
              <div key={i} style={box as any} className={`overflow-hidden text-black bg-white px-2 py-1 ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                <div style={{ fontWeight: Number(c.props?.weight) || 400, fontSize: Number(c.props?.size) || 14 }}>
                  {c.props?.text || "Text"}
                </div>
              </div>
            );
          case "button":
            return (
              <div key={i} style={box as any} className={`rounded-md bg-white text-black border ${selected ? "border-indigo-500" : "border-black/20"} flex items-center justify-center`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
                onDoubleClick={() => c.linkTo && onNavigate(c.linkTo)}
              >
                <div className="px-3 py-1 rounded border border-black/20 bg-black/5">{c.props?.text || "Button"}</div>
              </div>
            );
          case "input":
            return (
              <div key={i} style={box as any} className={`bg-white ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                <div className="w-full h-full rounded-md border border-black/20 bg-black/5" />
              </div>
            );
          case "dropdown":
            return (
              <div key={i} style={box as any} className={`bg-white ${baseBoxCls} relative`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                <div className="h-full w-full rounded-md border border-black/20 bg-black/5 flex items-center justify-between px-3 text-sm">
                  <span className="text-black/60">Select…</span>
                  <span className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-black/40" />
                </div>
              </div>
            );
          case "icon":
            return (
              <div key={i} style={box as any} className={`flex items-center justify-center bg-white ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                <div className="rounded-full border border-black/20 bg-black/5" style={{ width: c.frame.w - 8, height: c.frame.h - 8 }} />
              </div>
            );
          case "list":
            return (
              <div key={i} style={box as any} className={`bg-white rounded-md overflow-hidden ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="px-4 py-3 border-b last:border-b-0 border-black/10">
                    <div className="h-3 w-1/2 bg-black/10 rounded" />
                  </div>
                ))}
              </div>
            );
          case "carousel":
            return (
              <div key={i} style={box as any} className={`bg-white ${baseBoxCls} relative overflow-hidden`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                <div className="absolute inset-y-0 left-0 w-8 grid place-items-center bg-gradient-to-r from-white to-transparent">
                  <div className="w-0 h-0 border-r-[6px] border-r-black/30 border-y-[6px] border-y-transparent" />
                </div>
                <div className="absolute inset-y-0 right-0 w-8 grid place-items-center bg-gradient-to-l from-white to-transparent">
                  <div className="w-0 h-0 border-l-[6px] border-l-black/30 border-y-[6px] border-y-transparent" />
                </div>
                <div className="h-full w-[1000px] flex gap-3 pl-10">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="w-40 h-full rounded-md border border-black/15 bg-black/5" />
                  ))}
                </div>
              </div>
            );
          case "video":
            return (
              <div key={i} style={box as any} className={`bg-white ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                <div className="w-full h-full rounded-md border border-dashed border-black/20 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.06)_8px,rgba(0,0,0,0.06)_16px)] grid place-items-center">
                  <div className="w-0 h-0 border-l-[16px] border-l-black/50 border-y-[10px] border-y-transparent" />
                </div>
              </div>
            );
          case "navbar-web":
            return (
              <div key={i} style={{ ...box, height: 64 }} className={`flex items-center px-6 bg-white border-b border-black/10 select-none ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
              >
                <div className="mr-3 w-8 h-8 rounded bg-black/10 grid place-items-center" onClick={(e) => { e.stopPropagation(); setOverlayOpen(!overlayOpen); }}>
                  <div className="w-4 h-0.5 bg-black mb-0.5" />
                  <div className="w-4 h-0.5 bg-black mb-0.5" />
                  <div className="w-4 h-0.5 bg-black" />
                </div>
                <div className="font-semibold text-black">{c.props?.title || "Navbar"}</div>
              </div>
            );
          case 'sidebarOverlay':
            // Handled as an overlay below (so skip base rendering)
            return null;
          case 'bottomnav':
            return (
              <div key={i} style={{ position: 'absolute', left: 0, top: (screen.device==='mobile' ? (screen.size?.height ?? 844) : 844) - 56, width: baseW, height: 56 }} className={`flex items-center justify-around bg-white border-t border-black/10 select-none ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
              >
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="w-10 h-6 rounded bg-black/10" />
                ))}
              </div>
            );
          default:
            return (
              <div key={i} style={box as any} className={`bg-white text-black/80 text-xs flex items-center justify-center cursor-move ${baseBoxCls}`}
                onClick={(e) => { e.stopPropagation(); onSelectIdx(i); }}
                onMouseDown={(e) => handleDrag(i, e)}
              >
                {c.type}
              </div>
            );
        }
      })}
      {screen.components.some((c) => c.type === 'sidebarOverlay') && (
        <>
          {overlayOpen && (
            <>
              <div className="absolute inset-0 bg-black/30" onClick={() => setOverlayOpen(false)} />
              <div className="absolute left-0 top-0 h-full bg-white shadow-xl" style={{ width: 280 }}>
                <div className="px-4 py-3 border-b border-black/10 font-medium">Menu</div>
                <div className="p-2 space-y-2">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="px-3 py-2 rounded border border-black/10 bg-black/5" />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function LeftPane({ mode, dsl, onSelectScreen, inspector, setMode }: { mode: "components" | "pages" | "inspector"; dsl: DSL; onSelectScreen: (id: string) => void; inspector: React.ReactNode; setMode: (m: "components" | "pages" | "inspector") => void }) {
  const items: { label: string; type: string; w: number; h: number }[] = [
    { label: "Header", type: "header", w: 1200, h: 64 },
    { label: "Sidebar", type: "sidebar", w: 240, h: 800 },
    { label: "Navbar", type: "navbar", w: 390, h: 56 },
    { label: "Text", type: "text", w: 300, h: 24 },
    { label: "Button", type: "button", w: 160, h: 44 },
    { label: "Input", type: "input", w: 240, h: 40 },
    { label: "Card (image)", type: "cardImage", w: 320, h: 140 },
    { label: "Card", type: "card", w: 320, h: 120 },
    { label: "List", type: "list", w: 320, h: 200 },
    { label: "Dropdown", type: "dropdown", w: 200, h: 40 },
    { label: "Carousel", type: "carousel", w: 320, h: 140 },
    { label: "Video", type: "video", w: 320, h: 180 },
    { label: "Icon", type: "icon", w: 40, h: 40 },
  ];
  return (
    <div className="min-w-[200px] w-[200px] h-full overflow-hidden border-r border-black/5 dark:border-white/10 bg-black/60 text-sm text-white flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b border-white/10">
        <button title="Components" onClick={()=>setMode("components")} className={`p-2 rounded-md ${mode==='components'?'bg-white/10':''}`}><SquareStack className="w-4 h-4"/></button>
        <button title="Pages" onClick={()=>setMode("pages")} className={`p-2 rounded-md ${mode==='pages'?'bg-white/10':''}`}><Layers className="w-4 h-4"/></button>
        <button title="Inspector" onClick={()=>setMode("inspector")} className={`p-2 rounded-md ${mode==='inspector'?'bg-white/10':''}`}><PanelRight className="w-4 h-4"/></button>
      </div>
      {mode==='components' && (
        <div className="p-3 space-y-2 overflow-auto">
          {items.map((it) => (
            <div key={it.type} draggable onDragStart={(e)=>{e.dataTransfer.setData('application/x-component', JSON.stringify({ type: it.type, defaultSize: { w: it.w, h: it.h } }));}} className="px-2 py-1.5 rounded-md border border-white/10 bg-black/40 hover:bg-white/5 cursor-grab active:cursor-grabbing" title="Drag into the device to add">{it.label}</div>
          ))}
        </div>
      )}
      {mode==='pages' && (
        <div className="p-3 space-y-2 overflow-auto">
          {dsl.screens.map((s)=> (
            <button key={s.id} onClick={()=>onSelectScreen(s.id)} className="w-full text-left px-2 py-1.5 rounded-md border border-white/10 bg-black/40 hover:bg-white/5">{s.name}</button>
          ))}
        </div>
      )}
      {mode==='inspector' && (
        <div className="flex-1 overflow-auto">
          {inspector}
        </div>
      )}
    </div>
  );
}
