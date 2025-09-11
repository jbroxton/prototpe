"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
// icons removed per request
import { TemplateModal } from "./TemplateModal";

export function HeaderBar({ title }: { title: string }) {
  const router = useRouter();
  const [templateOpen, setTemplateOpen] = useState(false);
  function newDoc() {
    const id = String(Math.floor(1000 + Math.random()*9000));
    router.push(`/requirements/${id}`);
  }
  function newRoadmap() {
    const id = String(Math.floor(1000 + Math.random()*9000));
    router.push(`/roadmap/${id}`);
  }
  function newLaunch() {
    const id = String(Math.floor(1000 + Math.random()*9000));
    router.push(`/launch/${id}`);
  }
  function newOKR() {
    const id = String(Math.floor(1000 + Math.random()*9000));
    router.push(`/okrs/${id}`);
  }
  return (
    <header className="z-10 flex items-center gap-3 px-4 py-3 relative">
      <div className="text-sm text-neutral-400">Home</div>
      <div className="mx-1 text-neutral-600">/</div>
      <div className="font-medium">{title}</div>
      <div className="flex-1" />
      <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">+ New</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Requirements
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={newDoc}>Blank</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTemplateOpen(true)}>From Template</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={newRoadmap}>
              Roadmap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={newLaunch}>Prototype</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/okrs')}>
              OKRs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TemplateModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onSelect={(template) => {
          const id = String(Math.floor(1000 + Math.random()*9000));
          // Pass template data so the editor can prefill
          router.push(`/requirements/${id}?template=${template.id}&tname=${encodeURIComponent(template.name)}`);
          setTemplateOpen(false);
        }}
      />
      {/* notifications moved to sidebar */}
    </header>
  );
}
