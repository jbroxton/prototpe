"use client";

import * as React from "react";

type ToggleProps = {
  pressed?: boolean;
  onPressedChange?: (v: boolean) => void;
  className?: string;
  children?: React.ReactNode;
};

export function Toggle({ pressed = false, onPressedChange, className = "", children }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      className={
        `inline-flex items-center rounded-md border text-sm px-3 h-9 transition-colors ` +
        (pressed
          ? "border-indigo-500 bg-indigo-600/20 text-indigo-200 hover:bg-indigo-600/30 "
          : "border-white/10 bg-neutral-900 text-neutral-300 hover:bg-neutral-800/60 ") +
        className
      }
    >
      {children}
    </button>
  );
}

