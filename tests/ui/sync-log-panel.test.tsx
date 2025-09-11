import React from 'react';
import ReactDOMServer from 'react-dom/server';

describe('US-008: Sync Log Panel', () => {
  function render(entries: any[], props: any = {}) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SyncLogPanel } = require('@/app/components/lifecycle/SyncLogPanel');
    return ReactDOMServer.renderToStaticMarkup(React.createElement(SyncLogPanel, { entries, ...props }));
  }

  it('AC-001/AC-002: Shows entries and limits to 100 by default', () => {
    const entries = Array.from({ length: 120 }).map((_, i) => ({
      id: String(i),
      timestamp: new Date().toISOString(),
      operation: 'webhook',
      entityType: 'story',
      entityId: `US_${i}`,
      jiraKey: `CM3-${i}`,
      source: 'jira',
      status: 'applied',
    }));
    const html = render(entries);
    const rows = (html.match(/data-log-row/g) || []).length;
    expect(rows).toBeLessThanOrEqual(100);
  });

  it('AC-003: Filters by operation and status', () => {
    const entries = [
      { id: '1', timestamp: new Date().toISOString(), operation: 'create', entityType: 'story', entityId: 'US_1', jiraKey: 'CM3-1', source: 'app', status: 'applied' },
      { id: '2', timestamp: new Date().toISOString(), operation: 'conflict', entityType: 'story', entityId: 'US_2', jiraKey: 'CM3-2', source: 'jira', status: 'conflict' },
    ];
    const html = render(entries, { filter: { operation: 'conflict', status: 'conflict' } });
    expect(html).toContain('US_2');
    expect(html).not.toContain('US_1');
  });

  it('AC-004: Exposes CSV export content', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { exportSyncLogToCsv } = require('@/app/components/lifecycle/SyncLogPanel');
    const entries = [
      { id: '1', timestamp: '2024-01-01T00:00:00Z', operation: 'create', entityType: 'story', entityId: 'US_1', jiraKey: 'CM3-1', source: 'app', status: 'applied' },
    ];
    const csv = exportSyncLogToCsv(entries);
    expect(csv).toContain('operation');
    expect(csv).toContain('create');
    expect(csv.split('\n').length).toBeGreaterThan(1);
  });
});

