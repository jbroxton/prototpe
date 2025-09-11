import React from 'react';
import ReactDOMServer from 'react-dom/server';

describe('US-010: Jira Data Drawer', () => {
  function render(props) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JiraDataDrawer } = require('@/app/components/lifecycle/JiraDataDrawer');
    return ReactDOMServer.renderToStaticMarkup(React.createElement(JiraDataDrawer, props));
  }

  const sample = {
    key: 'CM3-123',
    jira: {
      summary: 'Jira Title',
      descriptionText: 'Line1\n- AC_001',
      labels: ['speqq-e2e', 'alpha'],
      status: 'In Progress',
      assignee: 'Jane Doe',
      updated: '2024-01-10T14:30:45Z',
      fields: { summary: 'Jira Title', status: { name: 'In Progress' } },
    },
    local: {
      storyId: 'US_001',
      lastSummary: 'Local Title',
      lastDescription: 'Local Desc',
      labels: ['alpha'],
      lastStatus: 'To Do',
      appUpdatedAt: '2024-01-10T14:00:00Z',
      jiraUpdatedAt: '2024-01-10T14:30:45Z',
      localUpdatedAt: '2024-01-10T14:05:00Z',
      deleted: false,
      deletedAt: null,
      updatedAt: '2024-01-10T14:05:00Z',
    },
    audits: [
      { id: '1', source: 'jira', status: 'applied', jiraKey: 'CM3-123', createdAt: '2024-01-10T14:30:50Z', diff: { origin: 'jira:webhook', changes: [{ field: 'status', from: 'To Do', to: 'In Progress' }] } },
      { id: '2', source: 'app', status: 'applied', jiraKey: 'CM3-123', createdAt: '2024-01-10T14:05:50Z', diff: { origin: 'ui:lifecycle-drawer', changes: [{ field: 'summary', from: 'Old', to: 'New' }] } },
    ],
    hasConflict: true,
    jiraError: null,
  };

  it('AC-002/AC-003: shows Jira and local fields when open', () => {
    const html = render({ open: true, data: sample, showRaw: false });
    expect(html).toContain('Jira Title');
    expect(html).toContain('In Progress');
    expect(html).toContain('US_001');
    expect(html).toContain('Local Title');
  });

  it('AC-004: shows last sync and recent audits', () => {
    const html = render({ open: true, data: sample, showRaw: false });
    expect(html).toMatch(/Recent Activity/i);
    // 2 audit rows expected
    const rows = (html.match(/data-audit-row/g) || []).length;
    expect(rows).toBe(2);
    // shows human-readable change lines
    expect(html).toContain('status: To Do → In Progress');
    expect(html).toContain('summary: Old → New');
  });

  it('AC-005: raw JSON toggle shows side-by-side JSON', () => {
    const html = render({ open: true, data: sample, showRaw: true });
    expect(html).toMatch(/<pre/);
    expect(html).toContain('"status"');
    expect(html).toContain('"lastSummary"');
  });

  it('AC-001: includes a close control', () => {
    const html = render({ open: true, data: sample });
    expect(html).toMatch(/aria-label=\"Close drawer\"/);
  });
});
