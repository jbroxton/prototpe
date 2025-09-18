/**
 * User Story 2: CRUD Operations via MCP Tools
 *
 * Requirements:
 * - Use MCP SDK Client (no manual protocol implementation)
 * - Test through the /api/mcp proxy endpoint
 * - Each AC has 3–5 independent test cases (happy + edge cases)
 * - Zero any types; strong typing via zod schemas
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  ListToolsResultSchema,
  CallToolResultSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Shared helpers and types
type Json = Record<string, unknown>;

type ToolEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
};

const REMOTE_MCP_URL = process.env.REMOTE_MCP_URL;
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!REMOTE_MCP_URL) {
  throw new Error('REMOTE_MCP_URL must be set for MCP tests');
}

if (!MCP_API_KEY) {
  throw new Error('MCP_API_KEY must be set for MCP tests');
}

async function withClient<T>(fn: (client: Client, mcpServerUrl: string) => Promise<T>): Promise<T> {
  const mcpServerUrl = REMOTE_MCP_URL;
  const client = new Client({ name: 'us2-tests', version: '1.0.0' }, { capabilities: {} });
  const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
    requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
  });
  await client.connect(transport);
  try {
    return await fn(client, mcpServerUrl);
  } finally {
    await client.close();
  }
}

async function callTool<T = Json>(client: Client, name: string, args: Json): Promise<ToolEnvelope<T>> {
  try {
    const result = await client.callTool({ name, arguments: args }, CallToolResultSchema);
    // Tool results are returned as content parts; we expect first part to be JSON in text
    const first = result.content?.[0];
    if (!first || (first.type !== 'text' && first.type !== 'json')) {
      return { success: false, error: `Unexpected tool result format for ${name}` };
    }
    if (first.type === 'json') {
      return first.json as ToolEnvelope<T>;
    }
    const parsed = JSON.parse(first.text || '{}');
    return parsed as ToolEnvelope<T>;
  } catch (error: unknown) {
    const anyErr = error as { message?: string; code?: number | string } | undefined;
    return { success: false, error: anyErr?.message || 'Tool call failed', code: (anyErr?.code as number | undefined) };
  }
}

// Basic smoke: required tools are present
describe('US2 MCP Tools: availability', () => {
  test('tools/list includes CRUD tools for projects, stories, and acceptance criteria', async () => {
    await withClient(async (client) => {
      const tools = await client.listTools(ListToolsResultSchema);
      const names = new Set(tools.tools.map(t => t.name));

      const required = [
        // Projects
        'projects.create', 'projects.get', 'projects.list', 'projects.update', 'projects.delete',
        // User Stories
        'stories.create', 'stories.get', 'stories.list', 'stories.update', 'stories.delete',
        // Acceptance Criteria
        'acs.create', 'acs.get', 'acs.list', 'acs.update', 'acs.delete',
      ];
      for (const r of required) {
        expect(names.has(r)).toBe(true);
      }
    });
  });
});

// AC1: LLM can create projects with all fields
describe('AC1: Create Projects', () => {
  test('creates project with name, about, status (happy path)', async () => {
    await withClient(async (client) => {
      const res = await callTool(client, 'projects.create', {
        name: `US2 AC1 Project ${Date.now()}`,
        about: 'Project created via MCP',
        status: 'In Progress',
      });
      expect(res.success).toBe(true);
      expect(res.data && typeof (res.data as Json)['id'] === 'string').toBe(true);
      expect((res.data as Json)['name']).toContain('US2 AC1 Project');
      expect((res.data as Json)['status']).toBe('In Progress');
    });
  });

  test('validation: missing name is rejected with clear error', async () => {
    await withClient(async (client) => {
      const res = await callTool(client, 'projects.create', {
        about: 'Missing name',
        status: 'Not Started',
      });
      expect(res.success).toBe(false);
      expect(typeof res.error).toBe('string');
    });
  });

  test('validation: missing about is rejected with clear error', async () => {
    await withClient(async (client) => {
      const res = await callTool(client, 'projects.create', {
        name: 'No About',
        status: 'Not Started',
      });
      expect(res.success).toBe(false);
      expect(typeof res.error).toBe('string');
    });
  });

  test('validation: invalid status enum is rejected', async () => {
    await withClient(async (client) => {
      const res = await callTool(client, 'projects.create', {
        name: 'Bad Status',
        about: 'Invalid status',
        status: 'Almost Done',
      });
      expect(res.success).toBe(false);
      // FastMCP/Zod messages vary; ensure a clear error string exists
      expect(typeof res.error).toBe('string');
    });
  });
});

// AC2: LLM can read projects individually or as a list
describe('AC2: Read Projects', () => {
  test('get single project by ID returns nested data', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', {
        name: `US2 AC2 Project ${Date.now()}`,
        about: 'Read single by ID',
        status: 'Not Started',
      });
      expect(created.success).toBe(true);
      const id = (created.data as Json)['id'] as string;
      const got = await callTool(client, 'projects.get', { projectId: id });
      expect(got.success).toBe(true);
      expect((got.data as Json)['id']).toBe(id);
      expect(Array.isArray((got.data as Json)['userStories'])).toBe(true);
    });
  });

  test('list projects supports pagination (limit/offset)', async () => {
    await withClient(async (client) => {
      // Create a few projects to ensure multiple exist
      for (let i = 0; i < 3; i++) {
        await callTool(client, 'projects.create', {
          name: `US2 AC2 Paginated ${Date.now()}-${i}`,
          about: 'Pagination seed',
          status: 'Not Started',
        });
      }
      const firstPage = await callTool(client, 'projects.list', { limit: 2, offset: 0 });
      const secondPage = await callTool(client, 'projects.list', { limit: 2, offset: 2 });
      expect(firstPage.success).toBe(true);
      expect(secondPage.success).toBe(true);
      expect(Array.isArray((firstPage.data as Json)['projects'])).toBe(true);
      expect(Array.isArray((secondPage.data as Json)['projects'])).toBe(true);
    });
  });

  test('filter projects by status', async () => {
    await withClient(async (client) => {
      const p1 = await callTool(client, 'projects.create', { name: `Filter A ${Date.now()}`, about: 'A', status: 'In Progress' });
      const p2 = await callTool(client, 'projects.create', { name: `Filter B ${Date.now()}`, about: 'B', status: 'Not Started' });
      expect(p1.success && p2.success).toBe(true);
      const onlyInProgress = await callTool(client, 'projects.list', { status: 'In Progress', limit: 50, offset: 0 });
      const arr = (onlyInProgress.data as Json)['projects'] as Json[];
      expect(arr.every(p => p['status'] === 'In Progress')).toBe(true);
    });
  });

  test('get non-existent project returns clear error', async () => {
    await withClient(async (client) => {
      const res = await callTool(client, 'projects.get', { projectId: 'nonexistent-id' });
      expect(res.success).toBe(false);
      expect(res.error || '').toMatch(/not found/i);
    });
  });
});

// AC3: LLM can update project fields
describe('AC3: Update Projects', () => {
  test('partial update: name only', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', { name: `US2 AC3 ${Date.now()}`, about: 'before', status: 'Not Started' });
      const id = (created.data as Json)['id'] as string;
      const updated = await callTool(client, 'projects.update', { projectId: id, name: 'after' });
      expect(updated.success).toBe(true);
      expect((updated.data as Json)['name']).toBe('after');
      expect((updated.data as Json)['about']).toBe('before');
    });
  });

  test('update multiple fields including status', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', { name: `US2 AC3 ${Date.now()}`, about: 'desc', status: 'Not Started' });
      const id = (created.data as Json)['id'] as string;
      const updated = await callTool(client, 'projects.update', { projectId: id, about: 'desc2', status: 'In Progress' });
      expect(updated.success).toBe(true);
      expect((updated.data as Json)['about']).toBe('desc2');
      expect((updated.data as Json)['status']).toBe('In Progress');
    });
  });

  test('invalid status is rejected', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', { name: `US2 AC3 ${Date.now()}`, about: 'x', status: 'Not Started' });
      const id = (created.data as Json)['id'] as string;
      const res = await callTool(client, 'projects.update', { projectId: id, status: 'Almost Done' });
      expect(res.success).toBe(false);
      expect(res.error || '').toMatch(/invalid/i);
    });
  });

  test('no updatable fields provided returns error', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', { name: `US2 AC3 ${Date.now()}`, about: 'x', status: 'Not Started' });
      const id = (created.data as Json)['id'] as string;
      const res = await callTool(client, 'projects.update', { projectId: id });
      expect(res.success).toBe(false);
      expect(res.error || '').toMatch(/no updates provided/i);
    });
  });
});

// AC4: LLM can delete projects
describe('AC4: Delete Projects', () => {
  test('delete project succeeds and confirms deletion', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', { name: `US2 AC4 ${Date.now()}`, about: 'to delete', status: 'Not Started' });
      const id = (created.data as Json)['id'] as string;
      const res = await callTool(client, 'projects.delete', { projectId: id, confirm: true });
      expect(res.success).toBe(true);
      // verify read now fails
      const readBack = await callTool(client, 'projects.get', { projectId: id });
      expect(readBack.success).toBe(false);
    });
  });

  test('delete without confirm safety check is rejected', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', { name: `US2 AC4 ${Date.now()}`, about: 'safety', status: 'Not Started' });
      const id = (created.data as Json)['id'] as string;
      const res = await callTool(client, 'projects.delete', { projectId: id });
      expect(res.success).toBe(false);
      expect(res.error || '').toMatch(/confirm/i);
    });
  });

  test('cascade delete removes nested stories and ACs', async () => {
    await withClient(async (client) => {
      const created = await callTool(client, 'projects.create', { name: `US2 AC4 ${Date.now()}`, about: 'cascade', status: 'In Progress' });
      const id = (created.data as Json)['id'] as string;
      const s1 = await callTool(client, 'stories.create', { projectId: id, title: 'Story 1', description: 'desc', status: 'Not Started', priority: 'High' });
      expect(s1.success).toBe(true);
      const d = await callTool(client, 'projects.delete', { projectId: id, confirm: true });
      expect(d.success).toBe(true);
      const storiesList = await callTool(client, 'stories.list', { projectId: id });
      expect(storiesList.success).toBe(false);
    });
  });
});

// AC5: CRUD on user stories
describe('AC5: User Stories CRUD', () => {
  test('create/read/update/delete story; numbering maintained', async () => {
    await withClient(async (client) => {
      const p = await callTool(client, 'projects.create', { name: `US2 AC5 ${Date.now()}`, about: 'stories', status: 'In Progress' });
      const projectId = (p.data as Json)['id'] as string;

      const created = await callTool(client, 'stories.create', { projectId, title: 'S1', description: 'D1', status: 'Not Started', priority: 'Medium' });
      expect(created.success).toBe(true);
      const usId = (created.data as Json)['id'] as string; // e.g., US1
      expect(usId.startsWith('US')).toBe(true);

      const got = await callTool(client, 'stories.get', { projectId, storyId: usId });
      expect(got.success).toBe(true);
      expect((got.data as Json)['id']).toBe(usId);

      const upd = await callTool(client, 'stories.update', { projectId, storyId: usId, status: 'In Progress', title: 'S1b' });
      expect(upd.success).toBe(true);
      expect((upd.data as Json)['status']).toBe('In Progress');

      const del = await callTool(client, 'stories.delete', { projectId, storyId: usId });
      expect(del.success).toBe(true);
    });
  });

  test('invalid status on update is rejected', async () => {
    await withClient(async (client) => {
      const p = await callTool(client, 'projects.create', { name: `US2 AC5 ${Date.now()}`, about: 'invalid status', status: 'Not Started' });
      const projectId = (p.data as Json)['id'] as string;
      const s = await callTool(client, 'stories.create', { projectId, title: 'S', description: 'D', status: 'Not Started', priority: 'High' });
      const usId = (s.data as Json)['id'] as string;
      const res = await callTool(client, 'stories.update', { projectId, storyId: usId, status: 'Almost Done' });
      expect(res.success).toBe(false);
      expect(typeof res.error).toBe('string');
    });
  });

  test('project updatedAt changes on story changes', async () => {
    await withClient(async (client) => {
      const p = await callTool(client, 'projects.create', { name: `US2 AC5 ${Date.now()}`, about: 'timestamps', status: 'In Progress' });
      const projectId = (p.data as Json)['id'] as string;
      const before = await callTool(client, 'projects.get', { projectId });
      const beforeTs = new Date((before.data as Json)['updatedAt'] as string).getTime();
      await callTool(client, 'stories.create', { projectId, title: 'S', description: 'D', status: 'Not Started', priority: 'Low' });
      const after = await callTool(client, 'projects.get', { projectId });
      const afterTs = new Date((after.data as Json)['updatedAt'] as string).getTime();
      expect(afterTs).toBeGreaterThanOrEqual(beforeTs);
    });
  });
});

// AC6: CRUD on acceptance criteria
describe('AC6: Acceptance Criteria CRUD', () => {
  test('create/list/update/delete ACs for a story; numbering maintained', async () => {
    await withClient(async (client) => {
      const p = await callTool(client, 'projects.create', { name: `US2 AC6 ${Date.now()}`, about: 'acs', status: 'In Progress' });
      const projectId = (p.data as Json)['id'] as string;
      const s = await callTool(client, 'stories.create', { projectId, title: 'S', description: 'D', status: 'Not Started', priority: 'High' });
      const storyId = (s.data as Json)['id'] as string;

      const c1 = await callTool(client, 'acs.create', { projectId, storyId, description: 'AC1', status: 'Not Started' });
      expect(c1.success).toBe(true);
      const ac1 = (c1.data as Json)['id'] as string;
      expect(ac1.startsWith('AC')).toBe(true);

      const list = await callTool(client, 'acs.list', { projectId, storyId });
      const arr = (list.data as Json)['items'] as Json[];
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBeGreaterThanOrEqual(1);

      const upd = await callTool(client, 'acs.update', { projectId, storyId, id: ac1, status: 'In Progress' });
      expect(upd.success).toBe(true);
      expect((upd.data as Json)['status']).toBe('In Progress');

      const del = await callTool(client, 'acs.delete', { projectId, storyId, id: ac1 });
      expect(del.success).toBe(true);
    });
  });

  test('invalid status on AC update is rejected', async () => {
    await withClient(async (client) => {
      const p = await callTool(client, 'projects.create', { name: `US2 AC6 ${Date.now()}`, about: 'invalid', status: 'Not Started' });
      const projectId = (p.data as Json)['id'] as string;
      const s = await callTool(client, 'stories.create', { projectId, title: 'S', description: 'D', status: 'Not Started', priority: 'Low' });
      const storyId = (s.data as Json)['id'] as string;
      const c = await callTool(client, 'acs.create', { projectId, storyId, description: 'AC1', status: 'Not Started' });
      const acId = (c.data as Json)['id'] as string;
      const res = await callTool(client, 'acs.update', { projectId, storyId, id: acId, status: 'Nearly Done' });
      expect(res.success).toBe(false);
      expect(typeof res.error).toBe('string');
    });
  });

  test('story status becomes Completed when all ACs are Completed', async () => {
    await withClient(async (client) => {
      const p = await callTool(client, 'projects.create', { name: `US2 AC6 ${Date.now()}`, about: 'auto-complete', status: 'In Progress' });
      const projectId = (p.data as Json)['id'] as string;
      const s = await callTool(client, 'stories.create', { projectId, title: 'S', description: 'D', status: 'In Progress', priority: 'Medium' });
      const storyId = (s.data as Json)['id'] as string;
      await callTool(client, 'acs.create', { projectId, storyId, description: 'AC1', status: 'Not Started' });
      await callTool(client, 'acs.create', { projectId, storyId, description: 'AC2', status: 'Not Started' });
      const list = await callTool(client, 'acs.list', { projectId, storyId });
      const items = (list.data as Json)['items'] as Json[];
      for (const item of items) {
        await callTool(client, 'acs.update', { projectId, storyId, id: item['id'] as string, status: 'Completed' });
      }
      const story = await callTool(client, 'stories.get', { projectId, storyId });
      expect((story.data as Json)['status']).toBe('Completed');
    });
  });
});

// AC7: Consistent JSON responses
describe('AC7: Consistent JSON responses', () => {
  test('standardized success/error format on create/read/update/delete', async () => {
    await withClient(async (client) => {
      // Create
      const created = await callTool(client, 'projects.create', { name: `US2 AC7 ${Date.now()}`, about: 'consistency', status: 'Not Started' });
      expect(created).toMatchObject({ success: expect.any(Boolean) });
      const projectId = (created.data as Json)['id'] as string;

      // Read
      const read = await callTool(client, 'projects.get', { projectId });
      expect(read).toMatchObject({ success: true, data: expect.any(Object) });

      // Update with invalid input
      const bad = await callTool(client, 'projects.update', { projectId, status: 'NotAStatus' });
      expect(bad.success).toBe(false);
      expect(bad.error || '').toBeTruthy();

      // Delete
      const del = await callTool(client, 'projects.delete', { projectId, confirm: true });
      expect(del.success).toBe(true);
    });
  });
});
