import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('Jira webhook auth @jira', () => {
  it('rejects missing token with 401', async () => {
    const res = await request(BASE)
      .post('/api/integrations/jira/webhook')
      .send({ issue: { key: 'SPQ-0', fields: { status: { name: 'X' } } } })
      .set('content-type', 'application/json');
    expect(res.status).toBe(401);
  });

  it('rejects wrong token with 401', async () => {
    const res = await request(BASE)
      .post('/api/integrations/jira/webhook')
      .set('x-jira-webhook-token', 'wrong')
      .send({ issue: { key: 'SPQ-0', fields: { status: { name: 'X' } } } })
      .set('content-type', 'application/json');
    expect(res.status).toBe(401);
  });
});

