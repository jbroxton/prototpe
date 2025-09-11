"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Toggle } from "../ui/toggle";
import { Search, Star } from "lucide-react";

type Tpl = { id: number; name: string; starred: boolean };

const templates: Tpl[] = [
  { id: 1, name: "iOS App PRD", starred: true },
  { id: 2, name: "Android App PRD", starred: false },
  { id: 3, name: "Web App PRD", starred: false },
  { id: 4, name: "API PRD", starred: true },
  { id: 5, name: "Payments PRD", starred: true },
  { id: 6, name: "Search Feature PRD", starred: false },
  { id: 7, name: "Onboarding PRD", starred: true },
  { id: 8, name: "Notifications PRD", starred: false },
];

export function TemplateModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (tpl: Tpl) => void }) {
  const [search, setSearch] = useState("");
  const [showStarred, setShowStarred] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return templates.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(q);
      const matchesStarred = !showStarred || t.starred;
      return matchesSearch && matchesStarred;
    });
  }, [search, showStarred]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-5xl h-[600px] p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>Select a template</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Toggle pressed={showStarred} onPressedChange={setShowStarred} className="gap-2">
            <Star className="h-4 w-4" />
            Starred
          </Toggle>
        </div>

        <div className="px-6 py-4 overflow-y-auto h-[calc(600px-56px-64px)]">
          {filtered.length === 0 ? (
            <div className="h-full grid place-items-center text-neutral-400 text-sm">No templates match your filters.</div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={selected === template.id}
                  onClick={() => {
                    setSelected(template.id);
                    onSelect(template);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ template, selected, onClick }: { template: Tpl; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={
        `cursor-pointer rounded-lg overflow-hidden transition-transform ` +
        (selected ? "ring-2 ring-indigo-600 scale-105" : "hover:scale-[1.02]")
      }
    >
      <div className="aspect-[3/4] rounded-md mb-2">
        <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900" />
      </div>
      <p className="text-sm text-neutral-300 text-center truncate px-2">{template.name}</p>
    </div>
  );
}
