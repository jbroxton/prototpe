import request from 'supertest';
import { BASE } from './utils/jira-test-helpers';

describe('Internal Projects: Releases', () => {
  let projectId: string = '';
  let release: { id: string; releaseNumber: number; name: string } | null = null;

  afterAll(async () => {
    if (projectId) {
      try {
        await request(BASE).delete(`/api/internal-projects?projectId=${encodeURIComponent(projectId)}`);
      } catch {}
    }
  });

  it('US: Create project, stories, release, and assign', async () => {
    // 1) Create a project
    const projectRes = await request(BASE)
      .post('/api/internal-projects')
      .send({ name: `Auth`, about: 'Authentication iteration', status: 'Not Started' })
      .set('content-type', 'application/json');
    expect(projectRes.status).toBe(200);
    projectId = projectRes.body.data.id as string;

    // 2) Add two user stories
    const s1 = await request(BASE)
      .post('/api/internal-projects/stories')
      .send({ projectId, action: 'add', story: { title: 'Initial login', description: 'Basic email/password', status: 'Not Started', priority: 'High' } })
      .set('content-type', 'application/json');
    expect(s1.status).toBe(200);
    expect(s1.body?.data?.id).toBe('US1');

    const s2 = await request(BASE)
      .post('/api/internal-projects/stories')
      .send({ projectId, action: 'add', story: { title: 'OAuth', description: 'Login with Google', status: 'Not Started', priority: 'Medium' } })
      .set('content-type', 'application/json');
    expect(s2.status).toBe(200);
    expect(s2.body?.data?.id).toBe('US2');

    // 3) Create a release (R1)
    const r1 = await request(BASE)
      .post('/api/internal-projects/releases')
      .send({ projectId, action: 'add', release: { name: 'Release 1: Initial Login' } })
      .set('content-type', 'application/json');
    expect(r1.status).toBe(200);
    release = r1.body?.data;
    expect(release?.releaseNumber).toBe(1);

    // 4) Assign US1 to R1
    const assign = await request(BASE)
      .post('/api/internal-projects/stories')
      .send({ projectId, action: 'update', story: { id: 'US1', releaseId: release!.id } })
      .set('content-type', 'application/json');
    expect(assign.status).toBe(200);

    // 5) Verify project data reflects release assignment
    const projectGet = await request(BASE).get(`/api/internal-projects?projectId=${encodeURIComponent(projectId)}`);
    expect(projectGet.status).toBe(200);
    const stories = projectGet.body?.data?.userStories || [];
    const us1 = stories.find((s: any) => s.storyNumber === 1);
    const us2 = stories.find((s: any) => s.storyNumber === 2);
    expect(us1?.releaseId).toBe(release!.id);
    expect(us2?.releaseId ?? null).toBeNull();

    // 6) Verify releases listing includes counts
    const releasesList = await request(BASE).get(`/api/internal-projects/releases?projectId=${encodeURIComponent(projectId)}`);
    expect(releasesList.status).toBe(200);
    const items = releasesList.body?.data?.releases || [];
    expect(items.length).toBeGreaterThanOrEqual(1);
    const r1row = items.find((r: any) => r.releaseNumber === 1);
    expect(r1row?.storiesAssigned).toBeGreaterThanOrEqual(1);
  });
});

