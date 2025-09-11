import request from 'supertest';

export const BASE = process.env.BASE_URL || 'http://localhost:3000';

export async function createTestEpic(id: string) {
  const epic = {
    id: `EPIC_${id}`,
    title: `Test Epic ${id}`,
    description: 'Test description',
    labels: ['test'],
  };
  const res = await request(BASE)
    .post('/api/jira/sync/epic')
    .send({ epic })
    .set('content-type', 'application/json');
  if (res.status !== 200) throw new Error(`Epic sync failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { key: res.body.key as string, epic };
}

export async function detectProjectType(projectKey: string) {
  const res = await request(BASE)
    .get(`/api/jira/debug/project-type?key=${projectKey}`);
  if (res.status !== 200) throw new Error(`Project type detection failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body as { ok: boolean; projectKey: string; type: 'team-managed'|'company-managed'|'unknown'; epicLinkField?: string };
}

export async function fetchIssue(key: string, raw = false) {
  const res = await request(BASE)
    .get(`/api/jira/issue?key=${encodeURIComponent(key)}${raw ? '&raw=1' : ''}`);
  return res;
}

