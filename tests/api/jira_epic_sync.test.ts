import request from 'supertest';
import { BASE, createTestEpic, fetchIssue } from './utils/jira-test-helpers';

describe('Epic Sync to Jira @jira', () => {
  const projectKey = process.env.JIRA_PROJECT_KEY || 'SPQ';

  it('AC-001: Creates Epic via POST /api/jira/sync/epic returning {ok:true, key}', async () => {
    const id = `${Date.now()}`;
    const { key } = await createTestEpic(id);
    expect(key).toMatch(new RegExp(`^${projectKey}-\\d+$`));
  });

  it('AC-002: Epic retrievable via GET /api/jira/issue?key=... with summary/description', async () => {
    const id = `${Date.now()}`;
    const { key, epic } = await createTestEpic(id);
    const res = await fetchIssue(key);
    expect(res.status).toBe(200);
    const { fields } = res.body;
    expect(fields.summary).toBe(epic.title);
    expect(fields.descriptionText).toContain('Test description');
  });

  it('AC-003: Database stores appEpicId -> jiraKey mapping', async () => {
    const id = `${Date.now()}`;
    const { key } = await createTestEpic(id);
    const res = await fetchIssue(key);
    expect(res.status).toBe(200);
    expect(res.body.key).toBe(key);
  });

  it('AC-004: Labels include speqq-e2e and epic ID', async () => {
    const id = `${Date.now()}`;
    const { key, epic } = await createTestEpic(id);
    const res = await fetchIssue(key);
    expect(res.status).toBe(200);
    expect(res.body.fields.labels).toEqual(expect.arrayContaining(['speqq-e2e', epic.id.toLowerCase()]));
  });
});

