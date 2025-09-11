import React from 'react';

export type JiraDetails = {
  key: string;
  jira: {
    summary: string;
    descriptionText: string;
    labels: string[];
    status: string;
    assignee: string | null;
    updated: string | null;
    fields: any;
  } | null;
  local: {
    storyId: string;
    lastSummary: string | null;
    lastDescription: string | null;
    labels: string[];
    lastStatus: string | null;
    appUpdatedAt: string | null;
    jiraUpdatedAt: string | null;
    localUpdatedAt: string | null;
    deleted: boolean;
    deletedAt: string | null;
    updatedAt: string | null;
  } | null;
  audits: Array<{ id: string; source: string; status: string; jiraKey: string; createdAt: string; diff?: { origin?: string; changes?: Array<{ field: string; from: any; to: any; skipped?: string }> } } >;
  hasConflict: boolean;
  jiraError?: string | null;
};

export type JiraDataDrawerProps = {
  open: boolean;
  data: JiraDetails;
  showRaw?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
};

export function JiraDataDrawer({ open, data, showRaw, onClose, onEdit }: JiraDataDrawerProps) {
  if (!open) return null as any;
  const { key, jira, local, audits, hasConflict } = data;
  return (
    <aside className="drawer" aria-label="Jira drawer" style={{ width: 380 }}>
      <div className="drawer-header">
        <div className="drawer-title">{key}</div>
        <button aria-label="Close drawer" onClick={onClose}>×</button>
      </div>
      {hasConflict && (
        <div className="conflict-banner" role="status">Conflict detected — Jira updated since last sync.</div>
      )}
      <div className="drawer-body">
        <section>
          <h4>Jira</h4>
          {jira ? (
            <div className="text-sm">
              <div><strong>Summary:</strong> {jira.summary}</div>
              <div><strong>Status:</strong> {jira.status}</div>
              <div><strong>Assignee:</strong> {jira.assignee || 'Unassigned'}</div>
              <div><strong>Labels:</strong> {(jira.labels || []).join(', ') || '—'}</div>
              <div><strong>Description:</strong> {jira.descriptionText || '—'}</div>
            </div>
          ) : (
            <div className="text-sm">Jira data unavailable</div>
          )}
        </section>
        <section>
          <h4>Local</h4>
          {local ? (
            <div className="text-sm">
              <div><strong>Story:</strong> {local.storyId}</div>
              <div><strong>Summary:</strong> {local.lastSummary || '—'}</div>
              <div><strong>Status:</strong> {local.lastStatus || '—'}</div>
              <div><strong>Labels:</strong> {(local.labels || []).join(', ') || '—'}</div>
            </div>
          ) : (
            <div className="text-sm">No local mapping</div>
          )}
        </section>
        <section>
          <h4>Recent Activity</h4>
          <div className="log-list">
            {audits && audits.length ? audits.map((a) => (
              <div key={a.id} data-audit-row className="text-xs">
                <div><span>{a.createdAt}</span> — <span>{a.source}</span> / <span>{a.status}</span></div>
                {a.diff?.changes && a.diff.changes.length > 0 && (
                  <ul className="ml-3 list-disc">
                    {a.diff.changes.map((c, idx) => (
                      <li key={idx}>{c.field}: {String(c.from)} → {String(c.to)}{c.skipped ? ` (skipped: ${c.skipped})` : ''}</li>
                    ))}
                  </ul>
                )}
              </div>
            )) : <div className="text-xs text-neutral-500">No recent entries</div>}
          </div>
        </section>
        {showRaw && (
          <section>
            <h4>Raw</h4>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <pre className="text-xs overflow-auto" style={{ maxHeight: 240 }}>{jira ? JSON.stringify(jira.fields, null, 2) : 'null'}</pre>
              <pre className="text-xs overflow-auto" style={{ maxHeight: 240 }}>{local ? JSON.stringify(local, null, 2) : 'null'}</pre>
            </div>
          </section>
        )}
      </div>
      <div className="drawer-footer">
        <button onClick={onEdit}>Edit</button>
      </div>
    </aside>
  );
}

export default JiraDataDrawer;
