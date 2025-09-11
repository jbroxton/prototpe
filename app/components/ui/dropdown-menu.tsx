"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerEl: HTMLButtonElement | null;
  setTriggerEl: (el: HTMLButtonElement | null) => void;
};
const Ctx = React.createContext<Ctx | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [triggerEl, setTriggerEl] = React.useState<HTMLButtonElement | null>(null);
  return <Ctx.Provider value={{ open, setOpen, triggerEl, setTriggerEl }}>{children}</Ctx.Provider>;
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(Ctx)!;
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => { if (ref.current) ctx.setTriggerEl(ref.current); }, [ctx]);
  const onClick = (e: React.MouseEvent) => { e.preventDefault(); ctx.setOpen(!ctx.open); };
  if (asChild) {
    return React.cloneElement(children, { ref, onClick });
  }
  return (
    <button ref={ref} onClick={onClick} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">
      {children}
    </button>
  );
}

export function DropdownMenuContent({ className = "", children, align = "start" }: { className?: string; children: React.ReactNode; align?: "start" | "end" }) {
  const ctx = React.useContext(Ctx)!;
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const r = ctx.triggerEl?.getBoundingClientRect();
    if (!r) return;
    // Default left placement; we will adjust after measuring width
    setPos({ top: r.bottom + 8, left: r.left });
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const w = el.offsetWidth;
      let left = align === "end" ? r.right - w : r.left;
      // Clamp to viewport
      const maxLeft = Math.max(8, window.innerWidth - w - 8);
      left = Math.min(Math.max(8, left), maxLeft);
      setPos({ top: r.bottom + 8, left });
    });
  }, [ctx.triggerEl, ctx.open, align]);
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ctx.open) return;
      const t = e.target as Node;
      if (ctx.triggerEl && (ctx.triggerEl === t || ctx.triggerEl.contains(t))) return;
      if (ref.current && (ref.current === t || ref.current.contains(t))) return;
      ctx.setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [ctx.open, ctx.triggerEl]);
  if (!ctx.open) return null;
  return createPortal(
    <div ref={ref} className={"fixed z-[70] rounded-md border border-white/10 bg-neutral-900/95 shadow-xl p-1 " + className} style={{ top: pos.top, left: pos.left }}>
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  const ctx = React.useContext(Ctx)!;
  return (
    <button
      className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-sm inline-flex items-center gap-2"
      onClick={() => { onClick?.(); setTimeout(() => ctx.setOpen(false), 0); }}
    >
      {children}
    </button>
  );
}

type SubCtx = { open: boolean; openNow: () => void; scheduleClose: () => void; cancelClose: () => void };
const SubCtx = React.createContext<SubCtx | null>(null);

export function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const tRef = React.useRef<number | null>(null);
  const openNow = () => { if (tRef.current) { window.clearTimeout(tRef.current); tRef.current = null; } setOpen(true); };
  const cancelClose = () => { if (tRef.current) { window.clearTimeout(tRef.current); tRef.current = null; } };
  const scheduleClose = () => { if (tRef.current) window.clearTimeout(tRef.current); tRef.current = window.setTimeout(() => setOpen(false), 150); };
  return (
    <SubCtx.Provider value={{ open, openNow, scheduleClose, cancelClose }}>
      <div className="relative">
        {children}
      </div>
    </SubCtx.Provider>
  );
}

export function DropdownMenuSubTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SubCtx)!;
  return (
    <div
      className="px-3 py-2 rounded-md hover:bg-white/10 text-sm inline-flex items-center gap-2 cursor-default"
      onMouseEnter={ctx.openNow}
      onMouseLeave={ctx.scheduleClose}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSubContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SubCtx)!;
  if (!ctx.open) return null;
  return (
    <div
      className="absolute right-full top-0 w-56 p-1 rounded-md border border-white/10 bg-neutral-900/95 shadow-xl"
      onMouseEnter={ctx.openNow}
      onMouseLeave={ctx.scheduleClose}
    >
      {children}
    </div>
  );
}
