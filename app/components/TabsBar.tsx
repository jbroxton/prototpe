"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelLeft, Columns2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TabsBar() {
  const pathname = usePathname();
  const router = useRouter();
  const readTabs = () => {
    try {
      const list = JSON.parse(sessionStorage.getItem('openTabs') || '[]');
      if (!Array.isArray(list)) return [] as {type:string;id:string;title:string}[];
      return list as {type:string;id:string;title:string}[];
    } catch { return []; }
  };
  // Avoid hydration mismatch: don't read sessionStorage in initial render
  const [openTabs, setOpenTabs] = useState<{ type:string; id: string; title: string }[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [protoOpen, setProtoOpen] = useState(false);
  const [protoWide, setProtoWide] = useState(false);
  // Clear tabs on actual page unload (refresh/close), not SPA nav
  useEffect(() => {
    const onBeforeUnload = () => {
      try { sessionStorage.removeItem('openTabs'); } catch {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
  useEffect(() => {
    setOpenTabs(readTabs());
    try {
      const sv = sessionStorage.getItem('ui:sidebar:visible');
      setSidebarVisible(sv === null ? true : sv === 'true');
      setProtoOpen(sessionStorage.getItem('ui:proto:open') === 'true');
      setProtoWide(sessionStorage.getItem('ui:proto:wide') === 'true');
    } catch {}
    const onChange = () => {
      setOpenTabs(readTabs());
    };
    const onSidebar = (e:any)=>{ try{ const d=(e as CustomEvent).detail; setSidebarVisible(!!d?.visible);}catch{}};
    const onProto = (e:any)=>{ try{ const d=(e as CustomEvent).detail; if(typeof d?.open==='boolean') setProtoOpen(!!d.open); if(typeof d?.wide==='boolean') setProtoWide(!!d.wide);}catch{}};
    window.addEventListener('openTabs:changed', onChange);
    window.addEventListener('ui:sidebar:set', onSidebar as any);
    window.addEventListener('ui:proto:set', onProto as any);
    return () => {
      window.removeEventListener('openTabs:changed', onChange);
      window.removeEventListener('ui:sidebar:set', onSidebar as any);
      window.removeEventListener('ui:proto:set', onProto as any);
    };
  }, [pathname]);

  const tabs = [
    { label: "Home", href: "/workspace/space-jam/recent" },
    ...openTabs.map(t => (
      t.type==='req' ? { label: t.title, href: `/requirements/${t.id}` } :
      t.type==='roadmap' ? { label: t.title, href: `/roadmap/${t.id}` } :
      t.type==='launch' ? { label: t.title, href: `/launch/${t.id}` } :
      t.type==='okrs' ? { label: t.title, href: `/okrs/${t.id}` } :
      t.type==='new' ? { label: t.title, href: `/new/${t.id}` } :
      { label: t.title, href: '#' }
    )),
  ];
  function openNewTab() {
    const id = 'new_' + Math.random().toString(36).slice(2,8);
    try {
      const k = 'openTabs';
      const list = JSON.parse(sessionStorage.getItem(k) || '[]');
      if (Array.isArray(list)) {
        list.push({ type:'new', id, title:'New File' });
        sessionStorage.setItem(k, JSON.stringify(list));
        window.dispatchEvent(new Event('openTabs:changed'));
      }
    } catch {}
    router.push(`/new/${id}`);
  }
  return (
    <div className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur border-b border-white/10">
      <div className="px-3 py-2 flex gap-2 overflow-x-auto items-center">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Button
              key={t.href}
              asChild
              size="sm"
              variant={active ? "default" : "outline"}
              className={active ? "border-indigo-600" : ""}
            >
              <Link href={t.href} aria-current={active ? 'page' : undefined}>{t.label}</Link>
            </Button>
          );
        })}
        <Button
          aria-label="Open new tab"
          title="New tab"
          onClick={openNewTab}
          variant="ghost"
          size="sm"
          className="ml-1"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        {/* Right controls: left = sidebar toggle, right = prototype toggle */}
        <Button
          aria-label="Toggle sidebar"
          title={sidebarVisible? 'Hide sidebar':'Show sidebar'}
          onClick={()=>{
            const next = !sidebarVisible; setSidebarVisible(next);
            try{ sessionStorage.setItem('ui:sidebar:visible', String(next)); window.dispatchEvent(new CustomEvent('ui:sidebar:set', { detail:{ visible: next } })); }catch{}
          }}
          variant="ghost"
          size="sm"
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
        <Button
          aria-label="Toggle prototype overlay"
          title={protoOpen? (protoWide? 'Shrink prototype':'Expand prototype') : 'Open prototype'}
          onClick={()=>{
            let open = !protoOpen; let wide = protoWide;
            setProtoOpen(open); setProtoWide(wide);
            try{
              sessionStorage.setItem('ui:proto:open', String(open));
              sessionStorage.setItem('ui:proto:wide', String(wide));
              window.dispatchEvent(new CustomEvent('ui:proto:set', { detail:{ open, wide } }));
            }catch{}
          }}
          variant="ghost"
          size="sm"
        >
          <Columns2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
