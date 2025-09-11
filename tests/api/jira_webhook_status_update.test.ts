import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('Jira webhook updates local status @jira', () => {
  it('accepts webhook with token and updates lastStatus', async () => {
    const storyId = `US_${Date.now()}`;
    const story = {
      id: storyId,
      title: `Webhook Test ${storyId}`,
      description: 'Webhook description.',
      acList: ['AC_001: webhook'],
      labels: ['alpha'],
    };
    const syncRes = await request(BASE).post('/api/jira/sync').send({ story }).set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const key = syncRes.body.key as string;

    const webhookBody = {
      webhookEvent: 'jira:issue_updated',
      issue: { key, fields: { status: { name: 'In Progress' } } },
    };
    const res = await request(BASE)
      .post('/api/integrations/jira/webhook')
      .set('x-jira-webhook-token', process.env.JIRA_WEBHOOK_TOKEN || '')
      .send(webhookBody)
      .set('content-type', 'application/json');
    if (res.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('Webhook failed', { status: res.status, body: res.body, tokenSet: Boolean(process.env.JIRA_WEBHOOK_TOKEN) });
      throw new Error(`Webhook failed: ${res.status} ${JSON.stringify(res.body)}`);
    }

    const mapRes = await request(BASE).get(`/api/jira/map/${encodeURIComponent(storyId)}`);
    if (mapRes.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('Map fetch failed', { status: mapRes.status, body: mapRes.body });
      throw new Error(`Map fetch failed: ${mapRes.status} ${JSON.stringify(mapRes.body)}`);
    }
    expect(mapRes.body.lastStatus).toBe('In Progress');
  });
});
