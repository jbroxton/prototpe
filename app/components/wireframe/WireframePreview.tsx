"use client";

import { Scene, Screen, Block } from "./SceneTypes";
import { useMemo, useState } from "react";

export function WireframePreview({ scene, setScene, currentScreenId, onSelectScreen }: { scene: Scene; setScene?: (s: Scene)=>void; currentScreenId?: string; onSelectScreen?: (id: string)=>void }) {
  const screen = scene.screens.find(s => s.id === (currentScreenId || scene.screens[0]?.id)) || scene.screens[0];
  const device = scene.device || 'mobile';
  const baseW = device === 'web' ? 1200 : 390;
  const baseH = device === 'web' ? 800 : 844;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const canEdit = !!setScene;
  return (
    <div className="w-full h-full grid place-items-start">
      <div className="mx-auto" style={{ width: baseW }}>
        <DeviceFrame device={device} width={baseW} height={baseH}>
          <div className="w-full h-full">
            {screen.regions.appbar && (
              <div className="h-12 border-b border-neutral-300 bg-white text-neutral-800 text-sm font-semibold flex items-center px-3">
                {device !== 'web' && screen.regions.sidebar ? (
                  <button
                    onClick={()=>setMobileNavOpen(true)}
                    className="mr-2 px-2 py-1 rounded border border-neutral-300 bg-white"
                    aria-label="Open navigation"
                  >☰</button>
                ) : null}
                <div className="flex-1 text-center pr-7">{screen.regions.appbar.title || 'Title'}</div>
              </div>
            )}
            <div className="flex w-full h-[calc(100%-48px)]">
              {device === 'web' && screen.regions.sidebar && (
                <div className="w-56 border-r border-neutral-300 bg-white text-sm p-2 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-neutral-600">Navigation</div>
                    {canEdit && (
                      <button
                        onClick={() => {
                          const label = typeof window !== 'undefined' ? window.prompt('Nav label?', 'New Item') : undefined;
                          if (!label) return;
                          let linkTo = typeof window !== 'undefined' ? window.prompt('Link to screen id? (leave blank to create matching screen)', label.toLowerCase().replace(/\s+/g, '-')) || '' : '';
                          const next = structuredClone(scene);
                          const sc = next.screens.find(x => x.id === screen.id);
                          if (!sc) return;
                          if (!sc.regions.sidebar) sc.regions.sidebar = { items: [] };
                          // create target screen if missing and provided
                          if (linkTo) {
                            const exists = next.screens.some(x => x.id === linkTo);
                            if (!exists) {
                              next.screens.push({ id: linkTo, name: linkTo, regions: { appbar: { title: linkTo }, content: { blocks: [] } } });
                            }
                          }
                          sc.regions.sidebar.items.push({ id: label.toLowerCase().replace(/\s+/g, '-'), label, linkTo: linkTo || undefined });
                          setScene?.(next);
                        }}
                        className="text-xs px-2 py-0.5 rounded border border-neutral-300 bg-white hover:bg-neutral-50"
                        title="Add nav item"
                      >+ Add</button>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto">
                    {screen.regions.sidebar.items.map(it => (
                      <button key={it.id} onClick={()=>it.linkTo && onSelectScreen?.(it.linkTo)} className="w-full text-left px-2 py-1.5 rounded border border-neutral-300 mb-1 bg-white hover:bg-neutral-50">{it.label}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex-1 bg-white p-4 overflow-auto relative">
                <Blocks blocks={screen.regions.content.blocks} onNavigate={(id)=>onSelectScreen?.(id)} onOpenDrawer={()=>setDrawerOpen(true)} />
                {screen.regions.drawer && (
                  <>
                    {/* dim background when open */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-200 ${drawerOpen ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-black`}
                      onClick={()=>setDrawerOpen(false)}
                    />
                    <div className={`absolute top-0 right-0 h-full w-80 border-l border-neutral-300 bg-white shadow-lg p-3 transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                      <div className="flex items-center justify-between mb-2 text-sm font-semibold"><span>Drawer</span><button onClick={()=>setDrawerOpen(false)} className="text-xs border border-neutral-300 rounded px-2 py-0.5 bg-white">Close</button></div>
                      <Blocks blocks={screen.regions.drawer.blocks} onNavigate={(id)=>onSelectScreen?.(id)} onOpenDrawer={()=>{}} />
                    </div>
                  </>
                )}
                {device !== 'web' && screen.regions.sidebar && (
                  <>
                    <div
                      className={`absolute inset-0 transition-opacity duration-200 ${mobileNavOpen ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'} bg-black`}
                      onClick={()=>setMobileNavOpen(false)}
                    />
                    <div className={`absolute top-0 left-0 h-full w-64 border-r border-neutral-300 bg-white shadow-lg p-3 transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                      <div className="flex items-center justify-between mb-2 text-sm font-semibold"><span>Menu</span><button onClick={()=>setMobileNavOpen(false)} className="text-xs border border-neutral-300 rounded px-2 py-0.5 bg-white">Close</button></div>
                      <div className="space-y-2">
                        {screen.regions.sidebar.items.map(it => (
                          <button key={it.id} onClick={()=>{ if (it.linkTo) onSelectScreen?.(it.linkTo); setMobileNavOpen(false); }} className="w-full text-left px-2 py-1.5 rounded border border-neutral-300 bg-white hover:bg-neutral-50">{it.label}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}

function DeviceFrame({ device, width, height, children }: { device: 'mobile'|'tablet'|'web'; width: number; height: number; children: React.ReactNode }) {
  const outer = device==='mobile' ? 'rounded-[28px]' : 'rounded-[14px]';
  const inner = device==='mobile' ? 'rounded-[20px]' : 'rounded-[10px]';
  return (
    <div className={`border border-neutral-400 bg-neutral-200 shadow ${outer}`} style={{ width, height }}>
      <div className={`w-full h-full overflow-hidden bg-white ${inner}`}>
        {children}
      </div>
    </div>
  );
}

function Blocks({ blocks, onNavigate, onOpenDrawer }: { blocks: Block[]; onNavigate: (id: string)=>void; onOpenDrawer: ()=>void }) {
  return (
    <div className="grid gap-3">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'Text':
            return <div key={i} className={b.variant==='title'?'text-base font-semibold':'text-sm text-neutral-700'}>{b.text || (b.variant==='title'?'Title':'Body text')}</div>;
          case 'Button':
            return <button key={i} onClick={()=> b.open==='drawer' ? onOpenDrawer() : (b.linkTo && onNavigate(b.linkTo)) } className="inline-block px-3 py-1.5 rounded border border-neutral-400 text-sm bg-white hover:bg-neutral-50">{b.label}</button>;
          case 'List':
            return (
              <div key={i} className="space-y-2">
                {Array.from({length: b.rows}).map((_,j)=> (
                  <div key={j} className="h-10 rounded border border-neutral-300 bg-white" />
                ))}
              </div>
            );
          case 'Card':
            return (
              <div key={i} className="w-full max-w-[320px] rounded border border-neutral-300 bg-white">
                <div className="h-28 border-b border-neutral-300 bg-neutral-100 grid place-items-center text-neutral-500">image</div>
                <div className="p-3">
                  <div className="h-3 w-24 bg-neutral-200 mb-2" />
                  <div className="h-2 w-48 bg-neutral-200 mb-1" />
                  <div className="h-2 w-40 bg-neutral-200 mb-2" />
                  <button className="px-2 py-1 rounded border border-neutral-400 text-xs bg-white">Button</button>
                </div>
              </div>
            );
          case 'Tabs': {
            return <TabsBlock key={i} block={b} onNavigate={onNavigate} onOpenDrawer={onOpenDrawer} />;
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

function TabsBlock({ block, onNavigate, onOpenDrawer }: { block: Extract<Block, { type: 'Tabs' }>; onNavigate: (id: string)=>void; onOpenDrawer: ()=>void }) {
  const initial = useMemo(()=> block.activeId || block.tabs[0]?.id, [block]);
  const [active, setActive] = useState<string | undefined>(initial);
  const panelBlocks = (block.panels && active ? block.panels[active] : []) || [];
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 border-b border-neutral-300 pb-2">
        {block.tabs.map(t => (
          <button
            key={t.id}
            onClick={()=>setActive(t.id)}
            className={`px-3 py-1.5 rounded border text-sm ${active===t.id ? 'bg-neutral-200 border-neutral-400' : 'bg-white border-neutral-300 hover:bg-neutral-50'}`}
          >{t.label}</button>
        ))}
      </div>
      {panelBlocks.length > 0 && (
        <Blocks blocks={panelBlocks} onNavigate={onNavigate} onOpenDrawer={onOpenDrawer} />
      )}
    </div>
  );
}
