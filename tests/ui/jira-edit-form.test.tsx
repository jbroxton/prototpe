import React from 'react';
import ReactDOMServer from 'react-dom/server';

describe('US-011: Update Jira from Speqq UI', () => {
  function render(props) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JiraEditForm } = require('@/app/components/lifecycle/JiraEditForm');
    return ReactDOMServer.renderToStaticMarkup(React.createElement(JiraEditForm, props));
  }

  it('AC-002: renders fields with initial values', () => {
    const html = render({
      keyId: 'CM3-1',
      initialSummary: 'Sum',
      initialDescription: 'Desc',
      initialLabels: ['alpha', 'US_001'],
      baselineUpdated: '2024-01-10T10:00:00Z',
      isLoading: false,
    });
    expect(html).toContain('Sum');
    expect(html).toContain('Desc');
    expect(html).toContain('alpha,US_001');
  });

  it('AC-001: indicates validation when summary missing', () => {
    const html = render({
      keyId: 'CM3-1',
      initialSummary: '',
      initialDescription: '',
      initialLabels: [],
      baselineUpdated: '2024-01-10T10:00:00Z',
      isLoading: false,
    });
    expect(html).toMatch(/Summary is required/i);
  });

  it('AC-003/AC-004: shows loading and error states', () => {
    const loadingHtml = render({ keyId: 'CM3-1', initialSummary: 'S', baselineUpdated: '2024-01-10T10:00:00Z', isLoading: true });
    expect(loadingHtml).toMatch(/aria-busy=\"true\"/);
    const errorHtml = render({ keyId: 'CM3-1', initialSummary: 'S', baselineUpdated: '2024-01-10T10:00:00Z', error: 'Oops' });
    expect(errorHtml).toContain('Oops');
  });

  it('AC-003: shows success feedback after save', () => {
    const html = render({ keyId: 'CM3-1', initialSummary: 'S', baselineUpdated: '2024-01-10T10:00:00Z', success: true });
    expect(html).toMatch(/Updated successfully/i);
  });
});
