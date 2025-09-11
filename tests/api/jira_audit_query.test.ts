import request from 'supertest';
import { BASE } from './utils/jira-test-helpers';

describe('US-006 AC-002: Audit query endpoint @jira', () => {
  it('returns audits filtered by jiraKey and date range, and supports limit', async () => {
    const storyId = `US_${Date.now()}`;
    const story = { id: storyId, title: `Audit Query ${storyId}`, description: 'desc', acList: ['AC_001'], labels: ['alpha'] };
    const syncRes = await request(BASE).post('/api/jira/sync').send({ story }).set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const key = syncRes.body.key as string;

    // Trigger a webhook to ensure an audit row exists
    const webhookBody = { webhookEvent: 'jira:issue_updated', issue: { key, fields: { status: { name: 'In Progress' }, summary: story.title, labels: story.labels } } };
    const wh = await request(BASE).post('/api/integrations/jira/webhook').set('x-jira-webhook-token', process.env.JIRA_WEBHOOK_TOKEN || '').send(webhookBody).set('content-type', 'application/json');
    if (wh.status !== 200) throw new Error(`Webhook failed: ${wh.status} ${JSON.stringify(wh.body)}`);

    const from = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const to = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const res = await request(BASE).get(`/api/jira/audit?key=${encodeURIComponent(key)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=5`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.length).toBeLessThanOrEqual(5);
    // Basic shape assertions
    const item = res.body.items[0];
    expect(item).toHaveProperty('jiraKey');
    expect(item).toHaveProperty('source');
    expect(item).toHaveProperty('status');
    expect(item).toHaveProperty('createdAt');
  });
});

