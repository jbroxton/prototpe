"use client";

import { TabsBar } from "../../components/TabsBar";
import { EditableTitle } from "../../components/EditableTitle";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function OKRDocPage() {
  const { okrId } = useParams<{ okrId: string }>();
  useEffect(() => {
    try {
      const k = 'openTabs';
      const list = JSON.parse(sessionStorage.getItem(k) || '[]');
      const arr = Array.isArray(list) ? list : [];
      if (!arr.find((t: any) => t && t.type === 'okrs' && String(t.id)===String(okrId))) {
        arr.push({ type: 'okrs', id: String(okrId), title: 'OKRs' });
        sessionStorage.setItem(k, JSON.stringify(arr));
        window.dispatchEvent(new Event('openTabs:changed'));
      }
    } catch {}
  }, [okrId]);

  return (
    <div className="h-screen bg-neutral-950 text-neutral-200">
      <TabsBar />
      <div className="px-4 py-3 border-b border-white/10 bg-neutral-900/80 backdrop-blur"><EditableTitle id={String(okrId)} type="okrs" initial={'OKRs'} /></div>
      <div className="p-6 text-sm text-neutral-400">Stub OKR page ({String(okrId)}). Add objectives and key results here.</div>
    </div>
  );
}
