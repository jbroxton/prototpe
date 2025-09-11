import React from 'react';

export type SyncLogEntry = {
  id: string;
  timestamp: string | Date;
  operation: string; // 'create' | 'update' | 'delete' | 'webhook' | 'conflict'
  entityType: 'story' | 'epic' | string;
  entityId: string;
  jiraKey?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
  source: 'app' | 'jira' | 'user' | string;
  status?: 'applied' | 'skipped' | 'conflict' | 'failed' | string;
};

export type SyncLogFilter = {
  operation?: string;
  status?: string;
};

export type SyncLogPanelProps = {
  entries: SyncLogEntry[];
  filter?: SyncLogFilter;
  limit?: number; // default 100
};

function toArray(val: any): SyncLogEntry[] {
  return Array.isArray(val) ? (val as SyncLogEntry[]) : [];
}

function formatTs(ts: string | Date) {
  try {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    return d.toISOString();
  } catch {
    return String(ts);
  }
}

export function exportSyncLogToCsv(entries: SyncLogEntry[]): string {
  const cols = ['id', 'timestamp', 'operation', 'entityType', 'entityId', 'jiraKey', 'source', 'status'];
  const header = cols.join(',');
  const rows = toArray(entries).map((e) => [
    e.id,
    formatTs(e.timestamp),
    e.operation,
    e.entityType,
    e.entityId,
    e.jiraKey ?? '',
    e.source,
    e.status ?? '',
  ].map((v) => String(v).replaceAll('"', '""')).map((v) => (/[,\n\"]/.test(v) ? `"${v}"` : v)).join(','));
  return [header, ...rows].join('\n');
}

export function SyncLogPanel(props: SyncLogPanelProps) {
  const { entries, filter, limit = 100 } = props;
  const list = toArray(entries)
    .filter((e) => (filter?.operation ? e.operation === filter.operation : true))
    .filter((e) => (filter?.status ? e.status === filter.status : true))
    .slice(0, Math.max(0, Math.min(1000, limit || 100)));

  return (
    <div className="sync-log">
      {list.map((e) => (
        <div key={e.id} data-log-row className={`log-row status-${e.status || 'unknown'}`}>
          <span className="ts">{formatTs(e.timestamp)}</span>
          <span className="op">{e.operation}</span>
          <span className="entity">{e.entityType}:{e.entityId}</span>
          {e.jiraKey ? <span className="key">{e.jiraKey}</span> : null}
          <span className="src">{e.source}</span>
          {e.status ? <span className="st">{e.status}</span> : null}
        </div>
      ))}
    </div>
  );
}

export default SyncLogPanel;

