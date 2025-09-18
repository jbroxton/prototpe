import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

type JsonRecord = Record<string, unknown>;
const REMOTE_MCP_URL = process.env.REMOTE_MCP_URL;
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!REMOTE_MCP_URL) {
  throw new Error('REMOTEMCP tests require REMOTE_MCP_URL');
}

if (!MCP_API_KEY) {
  throw new Error('REMOTEMCP tests require MCP_API_KEY');
}

async function withClient<T>(label: string, fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ name: label, version: '1.0.0' }, { capabilities: {} });
  const transport = new StreamableHTTPClientTransport(new URL(REMOTE_MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
  });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

describe('Remote MCP availability', () => {
  it('initializes and lists available tools', async () => {
    await withClient('remote-mcp-list', async (client) => {
      const init = await client.initialize();
      expect(init.serverInfo?.name).toBeDefined();

      const tools = await client.listTools();
      expect(Array.isArray(tools.tools)).toBe(true);
      expect(tools.tools.map(tool => tool.name)).toContain('projects.list');
    });
  });

  it('calls projects.list and returns project data', async () => {
    await withClient('remote-mcp-projects', async (client) => {
      const result = await client.callTool({ name: 'projects.list', arguments: {} });
      const content = result.content?.[0];
      expect(content).toBeDefined();
      const payload: JsonRecord = content?.type === 'json' ? content.json as JsonRecord : JSON.parse(content?.text ?? '{}');
      expect(payload.success).toBe(true);
    });
  });

  it('rejects unauthenticated requests', async () => {
    const res = await fetch(REMOTE_MCP_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', params: {}, id: 1 }),
    });
    expect(res.status).toBe(401);
  });
});
