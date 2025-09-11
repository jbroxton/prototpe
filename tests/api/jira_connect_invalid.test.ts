import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const needs = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY'];
const hasSecrets = process.env.JIRA_REAL === '1' && needs.every((k) => !!process.env[k as keyof NodeJS.ProcessEnv]);

const maybe = (name: string, fn: any) => (hasSecrets ? it : it.skip)(name + ' @jira', fn);

describe('Jira Connect (invalid creds)', () => {
  maybe('returns 400 for bad credentials', async () => {
    const res = await request(BASE)
      .post('/api/jira/connect')
      .send({
        url: process.env.JIRA_BASE_URL,
        email: process.env.JIRA_EMAIL,
        apiToken: 'invalid-token',
      })
      .set('content-type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
