const request = require('supertest');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('M1 Smoke: demo flag + reset + empty stories', () => {
  it('POST /api/lifecycle/reset works in demo mode', async () => {
    const res = await request(BASE).post('/api/lifecycle/reset');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it('GET /api/lifecycle/stories returns empty list after reset', async () => {
    const res = await request(BASE).get('/api/lifecycle/stories');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.stories)).toBe(true);
    expect(res.body.stories.length).toBe(0);
  });
});
