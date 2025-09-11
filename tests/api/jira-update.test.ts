import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

describe('API: Jira issue endpoints @jira', () => {
  describe('GET /api/jira/issue/[key]/details', () => {
    it('returns full details for a synced story', async () => {
      const storyId = `US_${Date.now()}`;
      const story = { id: storyId, title: `Details ${storyId}`, description: 'desc', acList: ['AC_001'], labels: ['alpha'] };
      const syncRes = await require('supertest')(BASE).post('/api/jira/sync').send({ story }).set('content-type','application/json');
      if (syncRes.status !== 200) throw new Error(`Sync failed: ${syncRes.status} ${JSON.stringify(syncRes.body)}`);
      const key = syncRes.body.key as string;
      const res = await request(BASE).get(`/api/jira/issue/${encodeURIComponent(key)}/details`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body).toHaveProperty('jira');
      expect(res.body).toHaveProperty('local');
      expect(Array.isArray(res.body.audits)).toBe(true);
      expect(typeof res.body.hasConflict).toBe('boolean');
    });

    it('returns 404 for non-existent local key', async () => {
      const res = await request(BASE).get('/api/jira/issue/INVALID-999/details');
      expect([404, 400]).toContain(res.status);
    });
  });

  it.todo('GET /api/jira/issue/[key]/diff returns structured diff');
  it.todo('PUT /api/jira/issue/[key] updates fields and returns ok:true');
});
