"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import * as Dialog from "@radix-ui/react-dialog";

type ApprovalStatus = "NotSubmitted" | "InReview" | "Approved" | "ChangesRequested";
type Group = { id: string; name: string };

function load<T>(k: string, d: T): T { try { const v = typeof window!=='undefined' ? sessionStorage.getItem(k) : null; return v ? JSON.parse(v) as T : d; } catch { return d; } }
function save<T>(k: string, v: T) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} }

function useGroups(): Group[] {
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => {
    const k = "approval:groups";
    let g = load<Group[]>(k, []);
    if (!g || g.length === 0) {
      g = [
        { id: "g_mobile", name: "Consumer Mobile Leads" },
        { id: "g_design", name: "Design Council" },
        { id: "g_pay", name: "Payments SteerCo" },
      ];
      save(k, g);
    }
    setGroups(g);
  }, []);
  return groups;
}

export function getApprovalStatus(docId: string): ApprovalStatus {
  return load<ApprovalStatus>(`approval:${docId}:status`, "NotSubmitted");
}

export function ApprovalPanel({ open, onClose, docId }: { open: boolean; onClose: ()=>void; docId: string }) {
  const groups = useGroups();
  const [status, setStatus] = useState<ApprovalStatus>(() => getApprovalStatus(docId));
  const [groupId, setGroupId] = useState<string>(() => load<string>(`approval:${docId}:group`, "g_mobile"));
  const [tab, setTab] = useState<'people'|'teams'>('people');
  const [q, setQ] = useState('');

  useEffect(()=>{ setStatus(getApprovalStatus(docId)); }, [docId, open]);

  function submit() {
    setStatus("InReview");
    save(`approval:${docId}:status`, "InReview");
    save(`approval:${docId}:group`, groupId);
    try { window.dispatchEvent(new CustomEvent('approval:changed', { detail: { docId, status: 'InReview' } })); } catch {}
    onClose();
  }
  function withdraw() { setStatus("NotSubmitted"); save(`approval:${docId}:status`, "NotSubmitted"); try { window.dispatchEvent(new CustomEvent('approval:changed', { detail: { docId, status: 'NotSubmitted' } })); } catch {} ; onClose(); }
  function approve() { setStatus("Approved"); save(`approval:${docId}:status`, "Approved"); try { window.dispatchEvent(new CustomEvent('approval:changed', { detail: { docId, status: 'Approved' } })); } catch {} ; onClose(); }
  function requestChanges() { setStatus("ChangesRequested"); save(`approval:${docId}:status`, "ChangesRequested"); try { window.dispatchEvent(new CustomEvent('approval:changed', { detail: { docId, status: 'ChangesRequested' } })); } catch {} ; onClose(); }

  const label = useMemo(() => {
    switch (status) {
      case "NotSubmitted": return "Send for approval";
      case "InReview": return "In review";
      case "Approved": return "Approved";
      case "ChangesRequested": return "Changes requested";
    }
  }, [status]);

  return (
    <Dialog.Root open={open} onOpenChange={(v: boolean)=>{ if(!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/30" />
        <Dialog.Content className="fixed right-4 top-16 z-[81] w-[360px] rounded-xl border border-white/10 bg-transparent p-3 outline-none">
          <Dialog.Title className="text-sm font-medium mb-2">Approvals</Dialog.Title>
        {status === 'NotSubmitted' && (
          <>
            <div className="text-xs text-neutral-400 mb-1">Choose approvers</div>
            <div className="flex items-center gap-2 mb-2">
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search people or teams..." className="h-8" />
              <div className="inline-flex rounded-md border border-white/10 overflow-hidden text-xs">
                <button className={`px-2 py-1 hover:bg-white/5 ${tab==='people'?'bg-white/5':''}`} onClick={()=>setTab('people')}>People</button>
                <button className={`px-2 py-1 hover:bg-white/5 ${tab==='teams'?'bg-white/5':''}`} onClick={()=>setTab('teams')}>Teams</button>
              </div>
            </div>
            {tab==='people' ? (
              <div className="max-h-40 overflow-auto mb-3">
                {[
                  { id: 'u1', name: 'Alice Lee', role: 'Product Lead' },
                  { id: 'u2', name: 'Ben Ortiz', role: 'Engineering Manager' },
                  { id: 'u3', name: 'Chloe Park', role: 'Design Lead' },
                  { id: 'u4', name: 'Dana Wu', role: 'QA Lead' },
                ]
                  .filter(p=> p.name.toLowerCase().includes(q.toLowerCase()) || p.role.toLowerCase().includes(q.toLowerCase()))
                  .map((p)=> (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-sm">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 grid place-items-center text-[10px]">{p.name.split(' ').map(n=>n[0]).join('')}</div>
                      <div className="flex-1">
                        <div className="text-neutral-200">{p.name}</div>
                        <div className="text-xs text-neutral-400">{p.role}</div>
                      </div>
                      <button onClick={()=>setGroupId('g_custom')} className="px-2 py-0.5 rounded border border-white/10 text-xs">Add</button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="max-h-40 overflow-auto mb-3">
                {groups.filter(g=> g.name.toLowerCase().includes(q.toLowerCase())).map((g)=> (
                  <button key={g.id} onClick={()=>setGroupId(g.id)} className={`w-full text-left px-2 py-1.5 rounded-md mb-1 border ${groupId===g.id? 'border-indigo-500/40 bg-indigo-600/10' : 'border-white/10 hover:bg-white/5'}`}>{g.name}</button>
                ))}
              </div>
            )}
            <button onClick={submit} className="w-full px-3 py-2 rounded-md border border-indigo-500/40 bg-indigo-600/20 text-indigo-200 text-sm">{label}</button>
          </>
        )}
        {status === 'InReview' && (
          <div className="grid gap-2 text-sm">
            <div className="text-xs text-neutral-300">Status: In review</div>
            <div className="flex items-center gap-2">
              <button onClick={withdraw} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">Withdraw</button>
              <button onClick={approve} className="px-2 py-1 rounded-md border border-emerald-500/40 bg-emerald-600/20 text-emerald-200 text-xs">Mark approved</button>
              <button onClick={requestChanges} className="px-2 py-1 rounded-md border border-amber-500/40 bg-amber-600/20 text-amber-200 text-xs">Request changes</button>
            </div>
          </div>
        )}
        {status === 'Approved' && (
          <div className="text-sm text-emerald-300">Approved</div>
        )}
        {status === 'ChangesRequested' && (
          <div className="text-sm text-amber-300">Changes requested</div>
        )}
                <Dialog.Close asChild>
            <button className="hidden" aria-label="Close" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
