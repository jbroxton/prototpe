import { fieldsDiffer, shouldShowDiff } from '@/app/components/lifecycle/utils/diff';

describe('Diff indicator util', () => {
  it('returns true when summary differs even if localUpdatedAt is null', () => {
    const local = { lastSummary: 'A', lastDescription: '', labels: ['alpha'], lastStatus: 'To Do' };
    const jira = { summary: 'B', descriptionText: '', labels: ['alpha'], status: 'To Do' };
    expect(fieldsDiffer(local, jira)).toBe(true);
    expect(shouldShowDiff(local, jira, false)).toBe(true);
  });

  it('returns false when all fields equal', () => {
    const local = { lastSummary: 'Same', lastDescription: 'D', labels: ['x'], lastStatus: 'To Do' };
    const jira = { summary: 'Same', descriptionText: 'D', labels: ['x'], status: 'To Do' };
    expect(fieldsDiffer(local, jira)).toBe(false);
    expect(shouldShowDiff(local, jira, false)).toBe(false);
  });

  it('shouldShowDiff returns true when hasConflict is true regardless of field equality', () => {
    const local = { lastSummary: 'Same' } as any;
    const jira = { summary: 'Same' } as any;
    expect(shouldShowDiff(local, jira, true)).toBe(true);
  });
});
