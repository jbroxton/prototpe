import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('Jira Connect (real) @jira', () => {
  it('POST /api/jira/connect succeeds with valid env creds', async () => {
    const email = process.env.JIRA_EMAIL || '';
    const apiToken = process.env.JIRA_API_TOKEN || '';
    const res = await request(BASE)
      .post('/api/jira/connect')
      .set('content-type', 'application/json')
      .send({ email, apiToken });
    if (res.status !== 200) {
      throw new Error(`Connect failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
    expect(res.body).toMatchObject({ ok: true });
  });
});
