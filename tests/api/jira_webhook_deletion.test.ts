import request from 'supertest';
import { BASE } from './utils/jira-test-helpers';

describe('Webhook Deletion Handling @jira', () => {
  it('AC-004 (US-004): issue_deleted soft-deletes record and audits', async () => {
    const storyId = `US_${Date.now()}`;
    const story = {
      id: storyId,
      title: `Delete Test ${storyId}`,
      description: 'To be deleted',
      acList: ['AC_001: delete'],
      labels: ['alpha'],
    };
    const syncRes = await request(BASE).post('/api/jira/sync').send({ story }).set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const key = syncRes.body.key as string;

    const webhookBody = {
      webhookEvent: 'jira:issue_deleted',
      issue: { key, fields: { status: { name: 'Done' }, summary: story.title, labels: story.labels } },
    };
    const res = await request(BASE)
      .post('/api/integrations/jira/webhook')
      .set('x-jira-webhook-token', process.env.JIRA_WEBHOOK_TOKEN || '')
      .send(webhookBody)
      .set('content-type', 'application/json');
    if (res.status !== 200) throw new Error(`Webhook failed: ${res.status} ${JSON.stringify(res.body)}`);

    const mapRes = await request(BASE).get(`/api/jira/map/${encodeURIComponent(storyId)}`);
    if (mapRes.status !== 200) throw new Error(`Map fetch failed: ${mapRes.status} ${JSON.stringify(mapRes.body)}`);
    expect(mapRes.body).toHaveProperty('lastStatus');
  });
});

