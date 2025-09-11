"use client";

import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={
        "h-9 w-full rounded-md border border-white/10 bg-neutral-900 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-indigo-600/50 px-3 " +
        className
      }
      {...props}
    />
  )
);
Input.displayName = "Input";

