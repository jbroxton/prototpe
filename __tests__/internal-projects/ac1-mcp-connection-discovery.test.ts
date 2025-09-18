/**
 * Test for AC1: LLM can discover and connect to the MCP server endpoint
 * User Story 1: MCP Connection
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const REMOTE_MCP_URL = process.env.REMOTE_MCP_URL;
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!REMOTE_MCP_URL) {
  throw new Error('REMOTE_MCP_URL must be set for MCP tests');
}

if (!MCP_API_KEY) {
  throw new Error('MCP_API_KEY must be set for MCP tests');
}

describe('AC1: LLM can discover and connect to MCP server endpoint', () => {
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

  test('MCP server endpoint responds to authorized requests', async () => {
    const response = await fetch(mcpServerUrl, {
      headers: { Authorization: `Bearer ${MCP_API_KEY}` },
    });
    expect([200, 405]).toContain(response.status);
  });

  test('MCP server accepts HTTP streaming transport connections', async () => {
    // Arrange
    const client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });
    const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
      requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
    });
    
    // Act & Assert
    await expect(client.connect(transport)).resolves.not.toThrow();
    
    // Cleanup
    await client.close();
  });

  test('MCP server returns proper JSON-RPC response format', async () => {
    // Arrange
    const initializeRequest = {
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '1.0.0',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      },
      id: 1
    };
    
    // Act
    const response = await fetch(mcpServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MCP_API_KEY}` },
      body: JSON.stringify(initializeRequest)
    });
    const result = await parseMcpResponse(response);
    
    // Assert
    expect(response.status).toBe(200);
    expect(result).toHaveProperty('jsonrpc', '2.0');
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('result');
    expect(result).not.toHaveProperty('error');
  });

  test('Server rejects unauthenticated requests', async () => {
    const response = await fetch(mcpServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', params: {}, id: 1 })
    });
    expect(response.status).toBe(401);
  });
});
