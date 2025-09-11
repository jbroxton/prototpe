import request from 'supertest';
import { BASE } from './utils/jira-test-helpers';
import { prisma } from '@/app/lib/prisma';

describe('Conflict Resolution @jira', () => {
  it('AC-001: Jira wins for status', async () => {
    const storyId = `US_${Date.now()}`;
    const story = { id: storyId, title: `Conflict Story ${storyId}`, description: 'Conflict', acList: ['AC_001'], labels: ['alpha'] };
    const syncRes = await request(BASE).post('/api/jira/sync').send({ story }).set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const key = syncRes.body.key as string;
    await prisma.jiraStory.updateMany({ where: { jiraKey: key }, data: { lastStatus: 'To Do' } });
    const webhookBody = { webhookEvent: 'jira:issue_updated', issue: { key, fields: { status: { name: 'In Progress' } } } };
    const res = await request(BASE).post('/api/integrations/jira/webhook').set('x-jira-webhook-token', process.env.JIRA_WEBHOOK_TOKEN || '').send(webhookBody).set('content-type', 'application/json');
    if (res.status !== 200) throw new Error(`Webhook failed: ${res.status} ${JSON.stringify(res.body)}`);
    const row = await prisma.jiraStory.findFirst({ where: { jiraKey: key } });
    expect(row?.lastStatus).toBe('In Progress');
  });

  it('AC-001: App wins when appUpdatedAt newer (summary)', async () => {
    const storyId = `US_${Date.now()}`;
    const story = { id: storyId, title: `Conflict TS ${storyId}`, description: 'Conflict', acList: ['AC_001'], labels: ['alpha'] };
    const syncRes = await request(BASE).post('/api/jira/sync').send({ story }).set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const key = syncRes.body.key as string;
    const future = new Date(Date.now() + 60_000);
    await prisma.jiraStory.updateMany({ where: { jiraKey: key }, data: { lastSummary: 'App Summary', appUpdatedAt: future } });
    const webhookBody = { webhookEvent: 'jira:issue_updated', issue: { key, fields: { updated: new Date().toISOString(), summary: 'Jira Summary' } } };
    const res = await request(BASE).post('/api/integrations/jira/webhook').set('x-jira-webhook-token', process.env.JIRA_WEBHOOK_TOKEN || '').send(webhookBody).set('content-type', 'application/json');
    if (res.status !== 200) throw new Error(`Webhook failed: ${res.status} ${JSON.stringify(res.body)}`);
    const row = await prisma.jiraStory.findFirst({ where: { jiraKey: key } });
    expect(row?.lastSummary).toBe('App Summary');
  });

  it('AC-003: Conflicts logged with reason', async () => {
    const storyId = `US_${Date.now()}`;
    const story = { id: storyId, title: `Conflict Audit ${storyId}`, description: 'Conflict', acList: ['AC_001'], labels: ['alpha'] };
    const syncRes = await request(BASE).post('/api/jira/sync').send({ story }).set('content-type', 'application/json');
    if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
    const key = syncRes.body.key as string;
    const future = new Date(Date.now() + 60_000);
    await prisma.jiraStory.updateMany({ where: { jiraKey: key }, data: { lastSummary: 'App Summary', appUpdatedAt: future } });
    const webhookBody = { webhookEvent: 'jira:issue_updated', issue: { key, fields: { updated: new Date().toISOString(), summary: 'Jira Summary' } } };
    await request(BASE).post('/api/integrations/jira/webhook').set('x-jira-webhook-token', process.env.JIRA_WEBHOOK_TOKEN || '').send(webhookBody).set('content-type', 'application/json');
    const audits = await prisma.jiraSyncAudit.findMany({ where: { jiraKey: key } });
    expect(audits.length).toBeGreaterThan(0);
  });
});

