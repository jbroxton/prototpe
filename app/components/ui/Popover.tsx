"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  trigger: (args: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  sideOffset?: number;
};

export function Popover({ trigger, children, align = "end", sideOffset = 8 }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const update = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const left = align === "end" ? r.right : r.left;
    setPos({ top: r.bottom + sideOffset, left, width: r.width });
  };

  useLayoutEffect(() => { update(); }, [open, align, sideOffset]);
  useEffect(() => {
    const onResize = () => update();
    const onScroll = () => update();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onScroll, true); };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      const el = e.target as Node;
      if (btnRef.current && (btnRef.current === el || btnRef.current.contains(el))) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen((v) => !v)} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs">
        {trigger({ open, toggle: () => setOpen((v) => !v) })}
      </button>
      {open ? createPortal(
        <div className="fixed z-[70]" style={{ top: pos.top, left: align === 'end' ? pos.left : pos.left }}>
          {children}
        </div>,
        document.body
      ) : null}
    </>
  );
}
