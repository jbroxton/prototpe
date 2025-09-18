import { FastMCP } from 'fastmcp';
import { z } from 'zod';

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'https://app.speqq.com';
const MCP_API_KEY = process.env.MCP_API_KEY;
const MCP_PORT = Number(process.env.MCP_PORT ?? 3100);

if (!MCP_API_KEY) {
  console.error('MCP_API_KEY must be provided');
  process.exit(1);
}

const VALID_STATUSES = ['Not Started', 'In Progress', 'In Review', 'Completed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

const JsonEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

async function requestJson(url, init) {
  const res = await fetch(url, init);
  const bodyText = await res.text();
  let parsed;
  try {
    parsed = JsonEnvelopeSchema.parse(JSON.parse(bodyText));
  } catch {
    throw new Error(`Unexpected response from ${url}: ${bodyText}`);
  }
  if (!parsed.success) {
    const error = new Error(parsed.error ?? 'Unknown error');
    error.status = res.status;
    throw error;
  }
  return parsed.data;
}

function toTextContent(payload) {
  return { content: [{ type: 'text', text: JSON.stringify(payload) }] };
}

function normalizeTestLink(raw) {
  if (typeof raw === 'undefined') return { ok: true, value: undefined };
  const str = String(raw).trim();
  if (!str) return { ok: true, value: null };
  if (str.length > 2048) return { ok: false, error: 'testLink exceeds 2048 characters' };
  try {
    const url = new URL(str);
    if (!['http:', 'https:'].includes(url.protocol)) return { ok: false, error: 'testLink must use http or https' };
  } catch {
    return { ok: false, error: 'testLink must be a valid URL' };
  }
  return { ok: true, value: str };
}

function authenticate(request) {
  const authHeader = request?.headers?.authorization ?? request?.headers?.Authorization;
  if (!authHeader) {
    throw new Response('API key required to access speqq-projects', { status: 401 });
  }
  const token = authHeader.replace(/Bearer\s+/i, '').trim();
  if (token !== MCP_API_KEY) {
    throw new Response('Invalid API key for speqq-projects', { status: 401 });
  }
  return { token, authenticatedAt: new Date().toISOString() };
}

const server = new FastMCP({
  name: 'speqq-projects',
  version: '1.0.0',
  authenticate,
});

server.addTool({
  name: 'projects.create',
  description: 'Create a new internal project',
  parameters: z.object({
    name: z.string(),
    about: z.string(),
    status: z.enum(VALID_STATUSES),
  }),
  execute: async (args) => {
    const data = await requestJson(`${APP_BASE}/api/internal-projects`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    return toTextContent({ success: true, data });
  },
});

server.addTool({
  name: 'projects.get',
  description: 'Get a project by ID',
  parameters: z.object({ projectId: z.string() }),
  execute: async ({ projectId }) => {
    const data = await requestJson(`${APP_BASE}/api/internal-projects?projectId=${encodeURIComponent(projectId)}`);
    return toTextContent({ success: true, data });
  },
});

server.addTool({
  name: 'projects.list',
  description: 'List projects with optional filters',
  parameters: z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
    status: z.enum(VALID_STATUSES).optional(),
  }),
  execute: async ({ limit, offset, status }) => {
    const data = await requestJson(`${APP_BASE}/api/internal-projects`);
    const items = Array.isArray(data?.projects) ? data.projects : [];
    const filtered = status ? items.filter((p) => p.status === status) : items;
    const start = Math.max(0, offset ?? 0);
    const end = limit ? start + Math.max(0, limit) : filtered.length;
    const page = filtered.slice(start, end);
    return toTextContent({ success: true, data: { projects: page, total: filtered.length } });
  },
});

server.addTool({
  name: 'projects.update',
  description: 'Update project fields',
  parameters: z.object({
    projectId: z.string(),
    name: z.string().optional(),
    about: z.string().optional(),
    status: z.enum(VALID_STATUSES).optional(),
  }),
  execute: async (args) => {
    const data = await requestJson(`${APP_BASE}/api/internal-projects`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    return toTextContent({ success: true, data });
  },
});

server.addTool({
  name: 'projects.delete',
  description: 'Delete a project (requires confirm=true)',
  parameters: z.object({ projectId: z.string(), confirm: z.boolean() }),
  execute: async ({ projectId, confirm }) => {
    if (!confirm) return toTextContent({ success: false, error: 'confirm=true is required to delete project' });
    await requestJson(`${APP_BASE}/api/internal-projects?projectId=${encodeURIComponent(projectId)}`, { method: 'DELETE' });
    return toTextContent({ success: true, data: { projectId } });
  },
});

server.addTool({
  name: 'stories.create',
  description: 'Create a user story within a project',
  parameters: z.object({
    projectId: z.string(),
    title: z.string(),
    description: z.string(),
    status: z.enum(VALID_STATUSES).optional(),
    priority: z.enum(VALID_PRIORITIES).optional(),
    testLink: z.string().optional(),
  }),
  execute: async (args) => {
    const link = normalizeTestLink(args.testLink);
    if (!link.ok) return toTextContent({ success: false, error: link.error });
    const payload = {
      projectId: args.projectId,
      action: 'add',
      story: {
        title: args.title,
        description: args.description,
        status: args.status,
        priority: args.priority,
        testLink: link.value,
      },
    };
    const data = await requestJson(`${APP_BASE}/api/internal-projects/stories`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toTextContent({ success: true, data });
  },
});

server.addTool({
  name: 'stories.list',
  description: 'List user stories for a project',
  parameters: z.object({ projectId: z.string() }),
  execute: async ({ projectId }) => {
    const data = await requestJson(`${APP_BASE}/api/internal-projects/stories?projectId=${encodeURIComponent(projectId)}`);
    const stories = Array.isArray(data?.userStories) ? data.userStories : [];
    const items = stories.map((story) => ({ ...story, id: `US${story.storyNumber}` }));
    return toTextContent({ success: true, data: { items } });
  },
});

server.addTool({
  name: 'stories.update',
  description: 'Update a user story',
  parameters: z.object({
    projectId: z.string(),
    storyId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(VALID_STATUSES).optional(),
    priority: z.enum(VALID_PRIORITIES).optional(),
    testLink: z.string().optional(),
  }),
  execute: async (args) => {
    const link = normalizeTestLink(args.testLink);
    if (!link.ok) return toTextContent({ success: false, error: link.error });
    const payload = {
      projectId: args.projectId,
      action: 'update',
      story: {
        id: args.storyId,
        title: args.title,
        description: args.description,
        status: args.status,
        priority: args.priority,
        testLink: link.value,
      },
    };
    const data = await requestJson(`${APP_BASE}/api/internal-projects/stories`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toTextContent({ success: true, data });
  },
});

server.addTool({
  name: 'stories.delete',
  description: 'Delete a user story',
  parameters: z.object({ projectId: z.string(), storyId: z.string() }),
  execute: async ({ projectId, storyId }) => {
    const payload = { projectId, action: 'delete', story: { id: storyId } };
    await requestJson(`${APP_BASE}/api/internal-projects/stories`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toTextContent({ success: true, data: { storyId } });
  },
});

server.addTool({
  name: 'acs.create',
  description: 'Create acceptance criteria',
  parameters: z.object({
    projectId: z.string(),
    storyId: z.string(),
    description: z.string(),
    status: z.enum(VALID_STATUSES).optional(),
    testLink: z.string().optional(),
  }),
  execute: async (args) => {
    const link = normalizeTestLink(args.testLink);
    if (!link.ok) return toTextContent({ success: false, error: link.error });
    const payload = {
      projectId: args.projectId,
      storyId: args.storyId,
      action: 'add',
      acceptanceCriteria: {
        description: args.description,
        status: args.status ?? 'Not Started',
        testLink: link.value,
      },
    };
    const data = await requestJson(`${APP_BASE}/api/internal-projects/stories`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toTextContent({ success: true, data });
  },
});

server.addTool({
  name: 'acs.list',
  description: 'List acceptance criteria for a story',
  parameters: z.object({ projectId: z.string(), storyId: z.string() }),
  execute: async ({ projectId, storyId }) => {
    const data = await requestJson(`${APP_BASE}/api/internal-projects/stories?projectId=${encodeURIComponent(projectId)}`);
    const story = (data?.userStories ?? []).find((s) => `US${s.storyNumber}` === storyId || s.id === storyId);
    const items = Array.isArray(story?.acceptanceCriteria) ? story.acceptanceCriteria.map((ac) => ({ ...ac, id: `AC${ac.criteriaNumber}` })) : [];
    return toTextContent({ success: true, data: { items } });
  },
});

server.addTool({
  name: 'acs.update',
  description: 'Update acceptance criteria',
  parameters: z.object({
    projectId: z.string(),
    storyId: z.string(),
    id: z.string(),
    description: z.string().optional(),
    status: z.enum(VALID_STATUSES).optional(),
    testLink: z.string().optional(),
  }),
  execute: async (args) => {
    const link = normalizeTestLink(args.testLink);
    if (!link.ok) return toTextContent({ success: false, error: link.error });
    const payload = {
      projectId: args.projectId,
      storyId: args.storyId,
      action: 'update',
      acceptanceCriteria: {
        id: args.id,
        description: args.description,
        status: args.status,
        testLink: link.value,
      },
    };
    const data = await requestJson(`${APP_BASE}/api/internal-projects/stories`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toTextContent({ success: true, data });
  },
});

server.addTool({
  name: 'acs.delete',
  description: 'Delete acceptance criteria',
  parameters: z.object({ projectId: z.string(), storyId: z.string(), id: z.string() }),
  execute: async ({ projectId, storyId, id }) => {
    const payload = {
      projectId,
      storyId,
      action: 'delete',
      acceptanceCriteria: { id },
    };
    await requestJson(`${APP_BASE}/api/internal-projects/stories`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return toTextContent({ success: true, data: { id } });
  },
});

server.start({
  transportType: 'httpStream',
  httpStream: {
    port: MCP_PORT,
    stateless: true,
  },
}).then(() => {
  console.log('[FastMCP] listening on port', MCP_PORT);
}).catch((error) => {
  console.error('[FastMCP] failed to start', error);
  process.exit(1);
});
