"use client";
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { GitBranch, GitPullRequest, GitMerge, Rocket, ClipboardList, CheckCircle, Eye } from 'lucide-react';

export type TimelineEvent = { kind: 'issue'|'branch'|'pr_open'|'checks'|'review'|'merged'|'deploy'; title: string; at: string; href?: string };

function iconFor(kind: TimelineEvent['kind']) {
  const cls = 'w-4 h-4';
  if (kind === 'issue') return <ClipboardList className={cls} />;
  if (kind === 'branch') return <GitBranch className={cls} />;
  if (kind === 'pr_open') return <GitPullRequest className={cls} />;
  if (kind === 'checks') return <CheckCircle className={cls} />;
  if (kind === 'review') return <Eye className={cls} />;
  if (kind === 'merged') return <GitMerge className={cls} />;
  if (kind === 'deploy') return <Rocket className={cls} />;
  return <span />;
}

function rel(iso: string) {
  try {
    const d = new Date(iso);
    const s = Math.max(0, Math.floor((Date.now() - d.getTime())/1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s/60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
    const dys = Math.floor(h/24); return `${dys}d ago`;
  } catch { return ''; }
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const items = useMemo(() => (Array.isArray(events) ? events : []), [events]);
  return (
    <div className="relative pl-4">
      <div className="absolute left-1 top-0 bottom-0 w-px bg-white/10" />
      <div className="grid gap-2">
        {items.map((e, idx) => (
          <div key={`${e.kind}-${e.at}-${idx}`} className="relative pl-4">
            <div className="absolute -left-2 top-1.5 w-3 h-3 rounded-full bg-white/20 border border-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-neutral-300">{iconFor(e.kind)}</span>
              {e.href ? (
                <a className="text-sm text-indigo-300 hover:underline" href={e.href} target="_blank" rel="noreferrer">{e.title}</a>
              ) : (
                <span className="text-sm text-neutral-200">{e.title}</span>
              )}
              <Badge className="ml-1" variant="secondary">{rel(e.at)}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;

