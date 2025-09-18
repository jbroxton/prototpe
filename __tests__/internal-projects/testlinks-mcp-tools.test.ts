/**
 * TDD: MCP Tool support for testLink on Stories and ACs
 * Expect these tests to FAIL until MCP tool schemas + validation are implemented.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

type Json = Record<string, unknown>;
type Envelope<T = unknown> = { success: boolean; data?: T; error?: string; message?: string };

async function withClient<T>(fn: (client: Client, url: string) => Promise<T>): Promise<T> {
  const mcpUrl = process.env.REMOTE_MCP_URL;
  const apiKey = process.env.MCP_API_KEY;
  if (!mcpUrl) throw new Error('REMOTE_MCP_URL must be set for MCP tests');
  if (!apiKey) throw new Error('MCP_API_KEY must be set for MCP tests');
  const client = new Client({ name: 'testlinks-mcp', version: '1.0.0' }, { capabilities: {} });
  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  await client.connect(transport);
  try {
    return await fn(client, mcpUrl);
  } finally {
    await client.close();
  }
}

async function callTool<T = Json>(client: Client, name: string, args: Json): Promise<Envelope<T>> {
  const res = await client.callTool({ name, arguments: args }, CallToolResultSchema);
  const part = res.content?.[0];
  if (!part) throw new Error(`No tool result for ${name}`);
  if (part.type === 'json') return part.json as Envelope<T>;
  return JSON.parse(part.type === 'text' ? part.text || '{}' : '{}') as Envelope<T>;
}

describe('MCP tools: testLink support (TDD)', () => {
  test('stories.create accepts testLink and persists it', async () => {
    await withClient(async (client) => {
      // Create project
      const p = await callTool(client, 'projects.create', { name: `MCP TL ${Date.now()}`, about: 'test', status: 'In Progress' });
      expect(p.success).toBe(true);
      const projectId = (p.data as Json)['id'] as string;

      // Create story with testLink
      const s = await callTool(client, 'stories.create', {
        projectId,
        title: 'Story with link',
        description: 'D',
        status: 'Not Started',
        priority: 'Low',
        testLink: 'https://example.com/story'
      });
      expect(s.success).toBe(true);
      expect((s.data as Json)['testLink']).toBe('https://example.com/story');
    });
  });

  test('acs.create and acs.update accept testLink with validation', async () => {
    await withClient(async (client) => {
      const p = await callTool(client, 'projects.create', { name: `MCP TL AC ${Date.now()}`, about: 'test', status: 'In Progress' });
      const projectId = (p.data as Json)['id'] as string;
      const s = await callTool(client, 'stories.create', { projectId, title: 'S', description: 'D', status: 'Not Started', priority: 'High' });
      const storyId = (s.data as Json)['id'] as string;

      // create with valid link
      const c = await callTool(client, 'acs.create', { projectId, storyId, description: 'AC', status: 'Not Started', testLink: 'https://example.com/ac' });
      expect(c.success).toBe(true);
      expect((c.data as Json)['testLink']).toBe('https://example.com/ac');

      // update link
      const acId = (c.data as Json)['id'] as string;
      const u = await callTool(client, 'acs.update', { projectId, storyId, id: acId, testLink: 'https://example.com/ac2' });
      expect(u.success).toBe(true);
      expect((u.data as Json)['testLink']).toBe('https://example.com/ac2');

      // clear with empty string
      const clr = await callTool(client, 'acs.update', { projectId, storyId, id: acId, testLink: '' });
      expect(clr.success).toBe(true);
      expect((clr.data as Json)['testLink']).toBeNull();

      // invalid scheme
      const bad = await callTool(client, 'acs.create', { projectId, storyId, description: 'Bad', status: 'Not Started', testLink: 'ftp://bad/link' });
      expect(bad.success).toBe(false);
      expect((bad.error || '').toLowerCase()).toContain('testlink');

      // too long
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      const tooLong = await callTool(client, 'acs.create', { projectId, storyId, description: 'Too long', status: 'Not Started', testLink: longUrl });
      expect(tooLong.success).toBe(false);
      expect((tooLong.error || '').toLowerCase()).toContain('testlink');
    });
  });
});
