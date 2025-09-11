"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export function DialogContent({ className = "", children, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Content>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-[200] bg-black/50" />
      <RadixDialog.Content
        className={
          "fixed left-1/2 top-1/2 z-[201] w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-neutral-950 text-neutral-200 shadow-2xl focus:outline-none " +
          className
        }
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={"px-4 py-3 " + className} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = "", children, ...props }: React.ComponentPropsWithoutRef<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title className={"text-base font-medium " + className} {...props}>
      {children}
    </RadixDialog.Title>
  );
}
