import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('Jira Sync & Refresh (real) @jira', () => {
  const projectKey = process.env.JIRA_PROJECT_KEY || 'SPQ';

  it('creates issue with correct fields and status is fetchable', async () => {
    const storyId = `US_${Date.now()}`;
    const story = {
      id: storyId,
      title: `E2E Test ${storyId}`,
      description: 'Base description for E2E.',
      acList: ['AC_001: can create', 'AC_007: has description'],
      labels: ['alpha'],
    };

    const syncRes = await request(BASE)
      .post('/api/jira/sync')
      .send({ story })
      .set('content-type', 'application/json');
    if (syncRes.status !== 200) {
      // Helpful diagnostics for project/type/config issues
      // eslint-disable-next-line no-console
      console.error('Sync failed', {
        status: syncRes.status,
        body: syncRes.body,
        JIRA_PROJECT_KEY: process.env.JIRA_PROJECT_KEY,
        JIRA_ISSUE_TYPE: process.env.JIRA_ISSUE_TYPE,
      });
      throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    }
    expect(syncRes.body.ok).toBe(true);
    const key: string = syncRes.body.key;
    expect(key).toMatch(new RegExp(`^${projectKey}-\\d+$`));

    // Fetch details via debug proxy
    const fetchRes = await request(BASE)
      .get(`/api/jira/issue?key=${encodeURIComponent(key)}`);
    if (fetchRes.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('Issue fetch failed', { status: fetchRes.status, body: fetchRes.body });
      throw new Error(`Issue fetch failed: ${fetchRes.status} ${JSON.stringify(fetchRes.body)}`);
    }
    const fields = fetchRes.body.fields;
    expect(fields.summary).toBe(story.title);
    expect(fields.descriptionText).toContain('Acceptance Criteria');
    expect(fields.descriptionText).toContain('AC_001');
    expect(fields.descriptionText).toContain('AC_007');
    expect(fields.labels).toEqual(expect.arrayContaining(['speqq-e2e', 'alpha', storyId, 'AC_001', 'AC_007']));

    // Refresh should return a non-empty status name and persist
    const refreshRes = await request(BASE).get(`/api/jira/refresh?key=${encodeURIComponent(key)}`);
    if (refreshRes.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('Refresh failed', { status: refreshRes.status, body: refreshRes.body });
      throw new Error(`Refresh failed: ${refreshRes.status} ${JSON.stringify(refreshRes.body)}`);
    }
    expect(refreshRes.body.ok).toBe(true);
    const statusText = String(refreshRes.body.status?.status || refreshRes.body.status);
    expect(statusText).not.toHaveLength(0);

    const mapRes = await request(BASE).get(`/api/jira/map/${encodeURIComponent(storyId)}`);
    if (mapRes.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('Map fetch failed', { status: mapRes.status, body: mapRes.body });
      throw new Error(`Map fetch failed: ${mapRes.status} ${JSON.stringify(mapRes.body)}`);
    }
    expect(mapRes.body).toMatchObject({ ok: true, key });
  });
});
