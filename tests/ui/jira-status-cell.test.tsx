import React from 'react';
import ReactDOMServer from 'react-dom/server';

import type { JiraStatusProps } from '@/app/components/lifecycle/JiraStatusCell';

describe('US-007: Display Jira Sync Status', () => {
  function render(props: JiraStatusProps) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JiraStatusCell } = require('@/app/components/lifecycle/JiraStatusCell');
    return ReactDOMServer.renderToStaticMarkup(React.createElement(JiraStatusCell, props));
  }

  describe('AC-002: Jira key and Not Synced', () => {
    it('shows Not Synced and sync button when no jiraKey', () => {
      const html = render({ jiraSyncStatus: 'not-synced' });
      expect(html).toContain('Not Synced');
      expect(html).toContain('↻');
    });
    it('shows clickable Jira key when present', () => {
      const html = render({ jiraKey: 'CM3-123', jiraStatus: 'In Progress', jiraSyncStatus: 'synced' });
      expect(html).toContain('CM3-123');
      expect(html).toContain('<a');
    });
  });

  describe('AC-004/AC-005: Status badge and color coding', () => {
    it('renders status badge text and sync state class', () => {
      const html = render({ jiraKey: 'CM3-1', jiraStatus: 'To Do', jiraSyncStatus: 'synced' });
      expect(html).toContain('To Do');
      expect(html).toMatch(/status--synced/);
    });
    it('renders pending/error classes appropriately', () => {
      const pendingHtml = render({ jiraSyncStatus: 'pending' });
      const errorHtml = render({ jiraSyncStatus: 'error' });
      expect(pendingHtml).toMatch(/status--pending/);
      expect(errorHtml).toMatch(/status--error/);
    });
  });

  describe('AC-006: Tooltip timestamp format', () => {
    it('shows UTC timestamp on title tooltip of Jira key', () => {
      const ts = new Date('2024-01-10T14:30:45Z');
      const html = render({ jiraKey: 'CM3-99', jiraSyncedAt: ts, jiraSyncStatus: 'synced' });
      expect(html).toMatch(/title=\".*UTC\"/);
      expect(html).toContain('2024-01-10');
    });
  });
});
