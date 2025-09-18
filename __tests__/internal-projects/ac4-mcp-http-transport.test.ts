import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';

const REMOTE_MCP_URL = process.env.REMOTE_MCP_URL;
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!REMOTE_MCP_URL) {
  throw new Error('REMOTE_MCP_URL must be set for MCP tests');
}

if (!MCP_API_KEY) {
  throw new Error('MCP_API_KEY must be set for MCP tests');
}

describe('AC4: Connection supports HTTP transport', () => {
  const mcpServerUrl = REMOTE_MCP_URL;

  async function parseMcpResponse(res: Response) {
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      return await res.json();
    }
    if (ct.includes('text/event-stream')) {
      const text = await res.text();
      const events = text.split(/\r?\n\r?\n/);
      for (const evt of events) {
        const data = evt
          .split(/\r?\n/)
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).trim())
          .join('\n')
          .trim();
        if (!data) continue;
        try {
          return JSON.parse(data);
        } catch {
          // continue
        }
      }
      throw new Error('Failed to parse SSE JSON payload');
    }
    throw new Error(`Unsupported content-type: ${ct}`);
  }

  test('FastMCP server accepts HTTP streaming transport connections', async () => {
    const client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });
    const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
      requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
    });
    await client.connect(transport);
    const tools = await client.request({ method: 'tools/list' }, ListToolsResultSchema);
    expect(Array.isArray(tools.tools)).toBe(true);
    await client.close();
  });

  test('HTTP transport URL ends with /mcp', () => {
    const url = new URL(mcpServerUrl);
    expect(url.pathname.endsWith('/mcp')).toBe(true);
  });

  test('HTTP transport handles JSON-RPC messages correctly', async () => {
    const listToolsRequest = {
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 4,
    };
    const response = await fetch(mcpServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        Authorization: `Bearer ${MCP_API_KEY}`,
      },
      body: JSON.stringify(listToolsRequest),
    });
    const result = await parseMcpResponse(response);
    expect(response.status).toBe(200);
    expect(result.jsonrpc).toBe('2.0');
    expect(result.id).toBe(4);
    expect(result.result).toBeDefined();
  });

  test('HTTP transport supports parallel connections', async () => {
    const mkClient = (label: string) => new Client({ name: label, version: '1.0.0' }, { capabilities: {} });
    const makeTransport = () => new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
      requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
    });

    const client1 = mkClient('test-client-1');
    const client2 = mkClient('test-client-2');

    await Promise.all([
      client1.connect(makeTransport()),
      client2.connect(makeTransport()),
    ]);

    const [tools1, tools2] = await Promise.all([
      client1.request({ method: 'tools/list' }, ListToolsResultSchema),
      client2.request({ method: 'tools/list' }, ListToolsResultSchema),
    ]);

    expect(Array.isArray(tools1.tools)).toBe(true);
    expect(Array.isArray(tools2.tools)).toBe(true);

    await Promise.all([client1.close(), client2.close()]);
  });
});
