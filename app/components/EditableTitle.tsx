"use client";

import React, { useEffect, useRef, useState } from "react";

type Kind = "req" | "roadmap" | "okrs";

export function EditableTitle({
  id,
  type,
  initial,
  className,
  onChange,
}: {
  id: string;
  type: Kind;
  initial: string;
  className?: string;
  onChange?: (v: string) => void;
}) {
  const storageKey = `title:${type}:${id}`;
  const [value, setValue] = useState<string>(initial);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) setValue(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (editing) {
      const i = inputRef.current;
      if (i) {
        requestAnimationFrame(() => {
          i.focus();
          i.select();
        });
      }
    }
  }, [editing]);

  function persist(next: string) {
    const title = next.trim() || value || initial;
    setValue(title);
    try {
      sessionStorage.setItem(storageKey, title);
      // Update openTabs array so tab label reflects the rename
      const k = "openTabs";
      const list = JSON.parse(sessionStorage.getItem(k) || "[]");
      if (Array.isArray(list)) {
        const idx = list.findIndex((t: any) => t && t.type === type && String(t.id) === String(id));
        if (idx >= 0) {
          list[idx].title = title;
          sessionStorage.setItem(k, JSON.stringify(list));
        }
      }
      sessionStorage.setItem(`tabTitle:${id}`, title);
      window.dispatchEvent(new Event("openTabs:changed"));
    } catch {}
    onChange?.(title);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        defaultValue={value}
        onBlur={(e) => persist(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") persist((e.target as HTMLInputElement).value);
          if (e.key === "Escape") setEditing(false);
        }}
        className={`px-2 py-1 rounded-md border border-indigo-500 bg-transparent outline-none font-medium ${className || ""}`}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className || ""}`}>
      <button
        className="px-2 py-1 rounded-md border border-transparent group hover:border-white/10 hover:bg-white/5 font-medium"
        onClick={() => setEditing(true)}
        title="Rename"
      >
        {value}
      </button>
      <button className="px-2 py-1 rounded-md border border-transparent group hover:border-white/10 hover:bg-white/5 text-xs" title="Menu (stub)">
        ▾
      </button>
    </div>
  );
}

