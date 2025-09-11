import React from 'react';
import ReactDOMServer from 'react-dom/server';

describe('US-013: ConflictDiffViewer', () => {
  function render(props: any) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ConflictDiffViewer } = require('@/app/components/lifecycle/ConflictDiffViewer');
    return ReactDOMServer.renderToStaticMarkup(React.createElement(ConflictDiffViewer, props));
  }

  const sampleDiff = {
    hasConflict: true,
    fields: [
      { field: 'summary', local: 'Local', jira: 'Jira', isDifferent: true },
      { field: 'status', local: 'To Do', jira: 'In Progress', isDifferent: true },
      { field: 'labels', local: ['alpha'], jira: ['alpha','beta'], isDifferent: true },
      { field: 'description', local: 'L', jira: 'J', isDifferent: true },
      { field: 'epicKey', local: 'EPIC-1', jira: 'EPIC-1', isDifferent: false },
    ],
  };

  it('AC-001: renders field-by-field comparison', () => {
    const html = render({ diff: sampleDiff });
    expect(html).toContain('summary');
    expect(html).toContain('status');
  });

  it('AC-002: highlights different fields', () => {
    const html = render({ diff: sampleDiff });
    // look for a class marker on differing rows
    expect(html).toMatch(/diff-row--different/);
  });

  it('AC-003: shows local and Jira values side-by-side', () => {
    const html = render({ diff: sampleDiff });
    expect(html).toContain('Local');
    expect(html).toContain('Jira');
  });

  it('AC-004: handles null/undefined as —', () => {
    const diff = { hasConflict: true, fields: [{ field: 'assignee', local: null, jira: undefined, isDifferent: true }] };
    const html = render({ diff });
    expect(html).toContain('—');
  });

  it('AC-005: shows No conflicts when hasConflict=false', () => {
    const noDiff = { hasConflict: false, fields: [] };
    const html = render({ diff: noDiff });
    expect(html).toMatch(/No conflicts/i);
  });

  it('AC-006: renders Keep Local / Keep Jira buttons', () => {
    const html = render({ diff: sampleDiff });
    expect(html).toMatch(/Keep Local/);
    expect(html).toMatch(/Keep Jira/);
  });
});
