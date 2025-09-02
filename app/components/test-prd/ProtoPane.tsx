"use client";

import { WireframePreview } from "../wireframe/WireframePreview";
import type { Scene } from "../wireframe/SceneTypes";

export function ProtoPane({ scene, setScene, currentScreenId, onSelectScreen, embedded }: { scene?: Scene; setScene?: (s: Scene)=>void; currentScreenId?: string; onSelectScreen?: (id: string)=>void; embedded?: boolean }) {
  const rootClass = embedded
    ? "h-full flex flex-col"
    : "h-full border-l border-white/10 bg-neutral-900/80 backdrop-blur flex flex-col";
  const headerClass = "px-3 py-2 border-b border-white/10 flex items-center gap-2 text-xs";
  return (
    <aside className={rootClass}>
      {!embedded && (
        <div className={headerClass}>
          <span className="opacity-70">Device</span>
          <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={()=>{ if (scene && setScene) setScene({ ...scene, device:'mobile' }); }}>Mobile</button>
          <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={()=>{ if (scene && setScene) setScene({ ...scene, device:'tablet' }); }}>Tablet</button>
          <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={()=>{ if (scene && setScene) setScene({ ...scene, device:'web' }); }}>Web</button>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        {scene ? (
          <WireframePreview scene={scene} setScene={setScene} currentScreenId={currentScreenId} onSelectScreen={onSelectScreen} />
        ) : (
          <div className="mx-auto w-[360px] h-[760px] rounded-[24px] border border-white/15 bg-neutral-800 shadow-2xl grid place-items-center text-neutral-400">
            <div>
              <div className="text-center text-sm">Prototype canvas</div>
              <div className="text-center text-xs opacity-70">(renders here when chatting)</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
