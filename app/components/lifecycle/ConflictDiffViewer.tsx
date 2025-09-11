import React from 'react';

export type ConflictDiffViewerProps = {
  diff: {
    hasConflict: boolean;
    fields: Array<{ field: string; local: any; jira: any; isDifferent: boolean }>;
  };
  onResolve?: (field: string, choice: 'local' | 'jira') => void;
};

function renderValue(v: any) {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function ConflictDiffViewer({ diff, onResolve }: ConflictDiffViewerProps) {
  if (!diff?.hasConflict) return <div className="text-sm text-neutral-400">No conflicts</div> as any;
  const fields = Array.isArray(diff.fields) ? diff.fields : [];
  return (
    <div className="conflict-diff grid gap-2">
      {fields.map((f) => (
        <div key={f.field} className={`diff-row ${f.isDifferent ? 'diff-row--different border border-rose-500/40' : 'border border-white/10'} p-2 rounded-md`}>
          <div className="text-xs text-neutral-400 mb-1">{f.field}</div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="text-xxs text-neutral-500">Local</div>
              <div className="text-sm">{renderValue(f.local)}</div>
            </div>
            <div>
              <div className="text-xxs text-neutral-500">Jira</div>
              <div className="text-sm">{renderValue(f.jira)}</div>
            </div>
          </div>
          {f.isDifferent && (
            <div className="mt-2 flex gap-2">
              <button className="px-2 py-1 border border-white/10 rounded" onClick={() => onResolve?.(f.field, 'local')}>Keep Local</button>
              <button className="px-2 py-1 border border-white/10 rounded" onClick={() => onResolve?.(f.field, 'jira')}>Keep Jira</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ConflictDiffViewer;
