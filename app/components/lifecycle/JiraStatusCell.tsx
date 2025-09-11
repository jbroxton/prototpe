import React from 'react';

export type JiraStatusProps = {
  jiraKey?: string;
  jiraStatus?: string;
  jiraSyncedAt?: Date;
  jiraSyncStatus: 'synced' | 'pending' | 'error' | 'not-synced';
  onSync?: () => void;
  onOpen?: (key: string) => void;
};

function formatUtcTooltip(date?: Date) {
  if (!date) return undefined;
  try {
    const iso = date.toISOString(); // e.g., 2024-01-10T14:30:45.000Z
    const [d, t] = iso.split('T');
    const time = (t || '').replace('Z', '').split('.')[0];
    return `${d} ${time} UTC`;
  } catch {
    return undefined;
  }
}

export function JiraStatusCell(props: JiraStatusProps) {
  const { jiraKey, jiraStatus, jiraSyncedAt, jiraSyncStatus, onSync, onOpen } = props;
  const statusClass = `status--${jiraSyncStatus}`;
  const title = formatUtcTooltip(jiraSyncedAt);
  const hrefBase = process.env.JIRA_BASE_URL ? String(process.env.JIRA_BASE_URL).replace(/\/$/, '') : '';
  const href = jiraKey ? (hrefBase ? `${hrefBase}/browse/${jiraKey}` : `#${jiraKey}`) : undefined;

  return (
    <div className={`jira-status ${statusClass}`}>
      {jiraKey ? (
        <div className="jira-key">
          <a href={href} target="_blank" rel="noreferrer" title={title} onClick={(e) => { if (onOpen && jiraKey) { e.preventDefault(); onOpen(jiraKey); } }}>
            {jiraKey}
          </a>
          {jiraStatus ? <span className="jira-badge">{jiraStatus}</span> : null}
        </div>
      ) : (
        <div className="jira-unsynced">
          <span>Not Synced</span>{' '}
          <button
            type="button"
            aria-label="Sync to Jira"
            onClick={onSync}
            disabled={jiraSyncStatus === 'pending'}
            title={jiraSyncStatus === 'pending' ? 'Syncing…' : 'Sync to Jira'}
          >
            ↻
          </button>
        </div>
      )}
    </div>
  );
}

export default JiraStatusCell;
