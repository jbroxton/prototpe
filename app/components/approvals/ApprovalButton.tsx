"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ApprovalStatus = "NotSubmitted" | "InReview" | "Approved" | "ChangesRequested";
type Group = { id: string; name: string; members: { id: string; name: string }[] };

function load<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : d; } catch { return d; } }
function save<T>(k: string, v: T) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// Seed a few example approval groups once for the demo
function useSeedGroups(): Group[] {
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => {
    const k = "approval:groups";
    let g = load<Group[]>(k, []);
    if (!g || g.length === 0) {
      g = [
        { id: "g_mobile", name: "Consumer Mobile Leads", members: [{id:"u1",name:"Alice"},{id:"u2",name:"Ben"},{id:"u3",name:"Chloe"}] },
        { id: "g_design", name: "Design Council", members: [{id:"u4",name:"Dana"},{id:"u5",name:"Marco"}] },
        { id: "g_pay", name: "Payments SteerCo", members: [{id:"u6",name:"Iris"},{id:"u7",name:"Ken"},{id:"u8",name:"Priya"}] },
      ];
      save(k, g);
    }
    setGroups(g);
  }, []);
  return groups;
}

export function ApprovalButton({ docId }: { docId: string }) {
  const groups = useSeedGroups();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ApprovalStatus>(() => load<ApprovalStatus>(`approval:${docId}:status`, "NotSubmitted"));
  const [groupId, setGroupId] = useState<string>(() => load<string>(`approval:${docId}:group`, "g_mobile"));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (!panelRef.current?.contains(e.target as Node)) setOpen(false); }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function submit() {
    setStatus("InReview");
    save(`approval:${docId}:status`, "InReview");
    save(`approval:${docId}:group`, groupId);
    setOpen(false);
  }
  function withdraw() {
    setStatus("NotSubmitted");
    save(`approval:${docId}:status`, "NotSubmitted");
  }
  function approve() { setStatus("Approved"); save(`approval:${docId}:status`, "Approved"); }
  function requestChanges() { setStatus("ChangesRequested"); save(`approval:${docId}:status`, "ChangesRequested"); }

  const label = useMemo(() => {
    switch (status) {
      case "NotSubmitted": return "Submit for approval";
      case "InReview": return "In review";
      case "Approved": return "Approved";
      case "ChangesRequested": return "Changes requested";
    }
  }, [status]);

  const chipClass = status === 'Approved' ? 'border-emerald-400 text-emerald-200' :
                    status === 'InReview' ? 'border-indigo-400 text-indigo-200' :
                    status === 'ChangesRequested' ? 'border-amber-400 text-amber-200' :
                    'border-white/30 text-neutral-300';

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={()=>setOpen((v)=>!v)} className={`px-2 py-1 rounded-md border ${chipClass} bg-neutral-900 text-xs`}>{label}</button>
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] rounded-md border border-white/10 bg-neutral-900/95 shadow-xl p-2 z-40">
          <div className="px-1 py-1 text-sm font-medium">Approvals</div>
          <div className="px-1 py-1 text-xs text-neutral-400">Select an approval group</div>
          <div className="max-h-40 overflow-auto mb-2">
            {groups.map((g)=> (
              <label key={g.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-sm">
                <input type="radio" name="appr-group" checked={groupId===g.id} onChange={()=>setGroupId(g.id)} />
                <span>{g.name}</span>
              </label>
            ))}
          </div>
          {status === 'NotSubmitted' && (
            <button onClick={submit} className="w-full px-2 py-1 rounded-md border border-indigo-500/40 bg-indigo-600/20 text-indigo-200 text-sm">Send for approval</button>
          )}
          {status === 'InReview' && (
            <div className="grid gap-2">
              <div className="px-1 py-1 text-xs text-neutral-400">Status: In review</div>
              <div className="flex items-center gap-2">
                <button onClick={withdraw} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Withdraw</button>
                <button onClick={approve} className="px-2 py-1 rounded-md border border-emerald-500/40 bg-emerald-600/20 text-emerald-200 text-xs">Mark approved</button>
                <button onClick={requestChanges} className="px-2 py-1 rounded-md border border-amber-500/40 bg-amber-600/20 text-amber-200 text-xs">Request changes</button>
              </div>
            </div>
          )}
          {status === 'Approved' && (
            <div className="grid gap-2">
              <div className="px-1 py-1 text-xs text-emerald-300">Approved</div>
              <button onClick={()=>setOpen(false)} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Close</button>
            </div>
          )}
          {status === 'ChangesRequested' && (
            <div className="grid gap-2">
              <div className="px-1 py-1 text-xs text-amber-300">Changes requested</div>
              <div className="flex items-center gap-2">
                <button onClick={submit} className="px-2 py-1 rounded-md border border-indigo-500/40 bg-indigo-600/20 text-indigo-200 text-xs">Resubmit</button>
                <button onClick={()=>setOpen(false)} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
