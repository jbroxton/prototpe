import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import * as projectsApi from '@/app/api/internal-projects/route';
import * as storiesApi from '@/app/api/internal-projects/stories/route';
import { prisma } from '@/app/lib/prisma';

// Helpers to build NextRequest objects
function makeReq(url: string, method: string, body?: any) {
  const init: RequestInit = { method, headers: { 'content-type': 'application/json' } };
  if (body !== undefined) init.body = JSON.stringify(body);
  const req = new Request(url, init);
  return new NextRequest(req);
}

describe('Internal Projects API', () => {
  const baseUrl = 'http://localhost:3000';
  let projectId: string = '';

  beforeAll(async () => {
    // Ensure DB connection works
    await prisma.$connect();
  });

  afterAll(async () => {
    // Best-effort cleanup of the created project
    if (projectId) {
      try {
        await prisma.acceptanceCriteria.deleteMany({ where: { userStory: { projectId } } });
        await prisma.userStory.deleteMany({ where: { projectId } });
        await prisma.project.delete({ where: { id: projectId } });
      } catch {}
    }
    await prisma.$disconnect();
  });

  describe('Project CRUD', () => {
    it('should create a new project', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects`, 'POST', {
        name: `Internal Projects Tool Completion - ${Date.now()}`,
        about: 'Tracking our user stories and ACs',
        status: 'Not Started',
      });
      const res = await projectsApi.POST(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data).toHaveProperty('id');
      expect(json.data.name).toContain('Internal Projects Tool Completion');
      projectId = json.data.id;
    });

    it('should list all projects', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects`, 'GET');
      const res = await projectsApi.GET(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.projects)).toBe(true);
      expect(json.data.projects.find((p: any) => p.id === projectId)).toBeTruthy();
    });

    it('should get project by ID', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects?projectId=${projectId}`, 'GET');
      const res = await projectsApi.GET(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe(projectId);
      expect(json.data).toHaveProperty('userStories');
    });

    it('should update project', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects`, 'PUT', {
        projectId,
        name: 'Updated Project Name',
        status: 'In Progress',
      });
      const res = await projectsApi.PUT(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('Updated Project Name');
      expect(json.data.status).toBe('In Progress');
    });

    // Keep delete at the end after stories/AC tests
  });

  describe('User Story Management', () => {
    it('should add user story to project', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId,
        action: 'add',
        story: {
          title: 'User Authentication',
          description: 'As a user, I want to login',
          status: 'Not Started',
          priority: 'High',
        },
      });
      const res = await storiesApi.POST(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('US1');
    });

    it('should auto-generate story IDs (US1, US2)', async () => {
      const req2 = makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId,
        action: 'add',
        story: {
          title: 'Password Reset',
          description: 'As a user, I want to reset password',
          status: 'Not Started',
          priority: 'Medium',
        },
      });
      const res2 = await storiesApi.POST(req2 as any);
      const json2 = await (res2 as any).json();
      expect(json2.success).toBe(true);
      expect(json2.data.id).toBe('US2');
    });

    it('should update user story', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId,
        action: 'update',
        story: {
          id: 'US1',
          status: 'In Progress',
          priority: 'Low',
        },
      });
      const res = await storiesApi.POST(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('In Progress');
      expect(json.data.priority).toBe('Low');
    });

    it('should delete user story', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId,
        action: 'delete',
        story: { id: 'US2' },
      });
      const res = await storiesApi.POST(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.message).toMatch(/deleted/i);
    });

    it('should set and retrieve story test link', async () => {
      // set testLink on US1
      const setReq = makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId,
        action: 'update',
        story: {
          id: 'US1',
          testLink: 'https://example.com/test/US1'
        },
      });
      const setRes = await storiesApi.POST(setReq as any);
      const setJson = await (setRes as any).json();
      expect(setJson.success).toBe(true);

      // fetch project and verify testLink
      const getReq = makeReq(`${baseUrl}/api/internal-projects?projectId=${projectId}`, 'GET');
      const getRes = await projectsApi.GET(getReq as any);
      const getJson = await (getRes as any).json();
      const story = getJson.data.userStories.find((s: any) => s.storyNumber === 1);
      expect(story.testLink).toBe('https://example.com/test/US1');
    });
  });

  describe('Acceptance Criteria', () => {
    it('should add AC to user story', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
        projectId,
        storyId: 'US1',
        action: 'add',
        acceptanceCriteria: {
          description: 'Given login page, When valid creds, Then redirect',
          status: 'Not Started',
        },
      });
      const res = await storiesApi.PUT(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('AC1');
    });

    it('should auto-generate AC IDs (AC1, AC2)', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
        projectId,
        storyId: 'US1',
        action: 'add',
        acceptanceCriteria: {
          description: 'Given locked account, When too many attempts, Then show error',
          status: 'Not Started',
        },
      });
      const res = await storiesApi.PUT(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('AC2');
    });

    it('should update AC status', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
        projectId,
        storyId: 'US1',
        action: 'update',
        acceptanceCriteria: { id: 'AC1', status: 'In Review' },
      });
      const res = await storiesApi.PUT(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('In Review');
    });

    it('should delete AC', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
        projectId,
        storyId: 'US1',
        action: 'delete',
        acceptanceCriteria: { id: 'AC2' },
      });
      const res = await storiesApi.PUT(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.message).toMatch(/deleted/i);
    });
  });

  describe('Project CRUD (delete)', () => {
    it('should delete project', async () => {
      const req = makeReq(`${baseUrl}/api/internal-projects?projectId=${projectId}`, 'DELETE');
      const res = await projectsApi.DELETE(req as any);
      const json = await (res as any).json();
      expect(json.success).toBe(true);
      expect(json.message).toMatch(/deleted/i);
      projectId = '';
    });
  });

  describe('Validation', () => {
    it('should reject invalid project status with 400', async () => {
      const createReq = makeReq(`${baseUrl}/api/internal-projects`, 'POST', {
        name: `Validation Project - ${Date.now()}`,
        about: 'Temp project',
        status: 'Not Started',
      });
      const createRes = await projectsApi.POST(createReq as any);
      const created = await (createRes as any).json();
      const pid = created.data.id as string;

      const badUpdate = makeReq(`${baseUrl}/api/internal-projects`, 'PUT', {
        projectId: pid,
        status: 'DoingStuff',
      });
      const r = await projectsApi.PUT(badUpdate as any);
      expect((r as any).status).toBe(400);
      const body = await (r as any).json();
      expect(body.error).toMatch(/Invalid status/);

      // cleanup
      await projectsApi.DELETE(makeReq(`${baseUrl}/api/internal-projects?projectId=${pid}`, 'DELETE') as any);
    });

    it('should reject invalid story status and priority with 400', async () => {
      const createReq = makeReq(`${baseUrl}/api/internal-projects`, 'POST', {
        name: `Validation Project 2 - ${Date.now()}`,
        about: 'Temp project',
        status: 'Not Started',
      });
      const createRes = await projectsApi.POST(createReq as any);
      const created = await (createRes as any).json();
      const pid = created.data.id as string;

      // invalid status
      const badStory1 = makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId: pid,
        action: 'add',
        story: { title: 'Bad', description: 'x', status: 'Started', priority: 'High' },
      });
      const r1 = await storiesApi.POST(badStory1 as any);
      expect((r1 as any).status).toBe(400);
      const b1 = await (r1 as any).json();
      expect(b1.error).toMatch(/Invalid status/);

      // invalid priority
      const badStory2 = makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId: pid,
        action: 'add',
        story: { title: 'Bad', description: 'x', status: 'Not Started', priority: 'Urgent' },
      });
      const r2 = await storiesApi.POST(badStory2 as any);
      expect((r2 as any).status).toBe(400);
      const b2 = await (r2 as any).json();
      expect(b2.error).toMatch(/Invalid priority/);

      // cleanup
      await projectsApi.DELETE(makeReq(`${baseUrl}/api/internal-projects?projectId=${pid}`, 'DELETE') as any);
    });

    it('should reject invalid AC status with 400', async () => {
      const createReq = makeReq(`${baseUrl}/api/internal-projects`, 'POST', {
        name: `Validation Project 3 - ${Date.now()}`,
        about: 'Temp project',
        status: 'Not Started',
      });
      const createRes = await projectsApi.POST(createReq as any);
      const created = await (createRes as any).json();
      const pid = created.data.id as string;

      // Add a valid story first
      await storiesApi.POST(makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
        projectId: pid,
        action: 'add',
        story: { title: 'S', description: 'D', status: 'Not Started', priority: 'Low' },
      }) as any);

      // Now attempt to add AC with invalid status
      const badAc = makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
        projectId: pid,
        storyId: 'US1',
        action: 'add',
        acceptanceCriteria: { description: 'c', status: 'Donezo' },
      });
      const r = await storiesApi.PUT(badAc as any);
      expect((r as any).status).toBe(400);
      const body = await (r as any).json();
      expect(body.error).toMatch(/Invalid status/);

      await projectsApi.DELETE(makeReq(`${baseUrl}/api/internal-projects?projectId=${pid}`, 'DELETE') as any);
    });

    it('should handle malformed JSON with 400', async () => {
      const badBody = '{"name": "X", "status": NotAString}';
      const req = new NextRequest(new Request(`${baseUrl}/api/internal-projects`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: badBody,
      }));
      const res = await projectsApi.POST(req as any);
      expect((res as any).status).toBe(400);
      const json = await (res as any).json();
      expect(json.error).toMatch(/Invalid JSON/);
    });

    // -----------------------------
    // Test Links (AC) - Failing TDD
    // -----------------------------
    describe('AC Test Links (TDD - expected to fail initially)', () => {
      let pid: string = '';
      beforeAll(async () => {
        const createReq = makeReq(`${baseUrl}/api/internal-projects`, 'POST', {
          name: `TestLinks Project - ${Date.now()}`,
          about: 'Temp project for AC testLink TDD',
          status: 'Not Started',
        });
        const res = await projectsApi.POST(createReq as any);
        const json = await (res as any).json();
        pid = json.data.id as string;
        // Add a baseline story
        await storiesApi.POST(makeReq(`${baseUrl}/api/internal-projects/stories`, 'POST', {
          projectId: pid,
          action: 'add',
          story: { title: 'Story', description: 'D', status: 'Not Started', priority: 'Low' },
        }) as any);
      });
      afterAll(async () => {
        if (pid) await projectsApi.DELETE(makeReq(`${baseUrl}/api/internal-projects?projectId=${pid}`, 'DELETE') as any);
      });

      it('should create AC with a valid testLink and return it', async () => {
        const req = makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
          projectId: pid,
          storyId: 'US1',
          action: 'add',
          acceptanceCriteria: {
            description: 'AC with link',
            status: 'Not Started',
            testLink: 'https://example.com/demo'
          }
        });
        const res = await storiesApi.PUT(req as any);
        const json = await (res as any).json();
        expect(json.success).toBe(true);
        expect(json.data).toHaveProperty('testLink', 'https://example.com/demo');
      });

      it('should update AC testLink and then clear it with empty string', async () => {
        // First add AC
        await storiesApi.PUT(makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
          projectId: pid, storyId: 'US1', action: 'add',
          acceptanceCriteria: { description: 'AC to update link', status: 'Not Started' }
        }) as any);
        // Update link
        let res = await storiesApi.PUT(makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
          projectId: pid,
          storyId: 'US1',
          action: 'update',
          acceptanceCriteria: { id: 'AC2', testLink: 'https://example.com/updated' }
        }) as any);
        let json = await (res as any).json();
        expect(json.success).toBe(true);
        expect(json.data).toHaveProperty('testLink', 'https://example.com/updated');
        // Clear
        res = await storiesApi.PUT(makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
          projectId: pid,
          storyId: 'US1',
          action: 'update',
          acceptanceCriteria: { id: 'AC2', testLink: '' }
        }) as any);
        json = await (res as any).json();
        expect(json.success).toBe(true);
        expect(json.data).toHaveProperty('testLink', null);
      });

      it('should reject invalid testLink schemes and excessive length', async () => {
        // invalid scheme
        let res = await storiesApi.PUT(makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
          projectId: pid, storyId: 'US1', action: 'add',
          acceptanceCriteria: { description: 'bad link', status: 'Not Started', testLink: 'ftp://bad/link' }
        }) as any);
        expect((res as any).status).toBe(400);
        let body = await (res as any).json();
        expect(body.error || '').toMatch(/testLink/i);
        // too long
        const longUrl = 'https://example.com/' + 'a'.repeat(2050);
        res = await storiesApi.PUT(makeReq(`${baseUrl}/api/internal-projects/stories`, 'PUT', {
          projectId: pid, storyId: 'US1', action: 'add',
          acceptanceCriteria: { description: 'long link', status: 'Not Started', testLink: longUrl }
        }) as any);
        expect((res as any).status).toBe(400);
        body = await (res as any).json();
        expect(body.error || '').toMatch(/testLink/i);
      });
    });
  });
});
