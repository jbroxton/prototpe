import request from 'supertest';
import { BASE } from './utils/jira-test-helpers';
import { prisma } from '@/app/lib/prisma';

describe('Audit Trail @jira', () => {
  it('AC-001: Sync and webhook create audit records', async () => {
    const storyId = `US_${Date.now()}`;
    const story = {
      id: storyId,
      title: `Audit Story ${storyId}`,
      description: 'Audit description',
      acList: ['AC_001: audit'],
      labels: ['alpha'],
    };
    const syncRes = await request(BASE).post('/api/jira/sync').send({ story }).set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const key = syncRes.body.key as string;

    const webhookBody = {
      webhookEvent: 'jira:issue_updated',
      issue: { key, fields: { status: { name: 'In Progress' }, summary: story.title, labels: story.labels } },
    };
    const res = await request(BASE)
      .post('/api/integrations/jira/webhook')
      .set('x-jira-webhook-token', process.env.JIRA_WEBHOOK_TOKEN || '')
      .send(webhookBody)
      .set('content-type', 'application/json');
    if (res.status !== 200) throw new Error(`Webhook failed: ${res.status} ${JSON.stringify(res.body)}`);

    const audits = await prisma.jiraSyncAudit.findMany({ where: { jiraKey: key } });
    expect(audits.length).toBeGreaterThan(0);
    expect(audits[0]).toHaveProperty('source');
    expect(audits[0]).toHaveProperty('fieldsChanged');
  });
});

