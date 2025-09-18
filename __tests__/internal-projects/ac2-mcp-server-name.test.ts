/**
 * Test for AC2: MCP server exposes internal-projects as a named server 'speqq-projects'
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

describe('AC2: MCP server exposes internal-projects as named server "speqq-projects"', () => {
  const mcpServerUrl = REMOTE_MCP_URL;
  let client: Client;
  let transport: StreamableHTTPClientTransport;

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
          // try next chunk
        }
      }
      throw new Error('Failed to parse SSE JSON payload');
    }
    throw new Error(`Unsupported content-type: ${ct}`);
  }

  beforeEach(() => {
    client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );
    transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
      requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
    });
  });

  afterEach(async () => {
    if (client) {
      await client.close();
    }
  });

  test('Server identifies itself as "speqq-projects" in initialization response', async () => {
    // Arrange
    const expectedServerName = 'speqq-projects';
    
    // Act
    await client.connect(transport);
    
    // Assert - Use SDK method to get server info
    const serverInfo = client.getServerVersion();
    expect(serverInfo).toBeDefined();
    expect(serverInfo?.name).toBe(expectedServerName);
  });

  test('Server name is returned via direct JSON-RPC initialize call', async () => {
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
      id: 2
    };
    
    // Act
    const response = await fetch(mcpServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${MCP_API_KEY}` },
      body: JSON.stringify(initializeRequest)
    });
    const result = await parseMcpResponse(response);
    
    // Assert
    expect(result.result).toBeDefined();
    expect(result.result.serverInfo).toBeDefined();
    expect(result.result.serverInfo.name).toBe('speqq-projects');
  });

  test('Server name is consistent across multiple client connections', async () => {
    // Arrange
    const client1 = new Client(
      { name: 'test-client-1', version: '1.0.0' },
      { capabilities: {} }
    );
    const client2 = new Client(
      { name: 'test-client-2', version: '1.0.0' },
      { capabilities: {} }
    );
    const transport1 = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
      requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
    });
    const transport2 = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
      requestInit: { headers: { Authorization: `Bearer ${MCP_API_KEY}` } },
    });
    
    // Act
    await client1.connect(transport1);
    await client2.connect(transport2);
    
    // Assert - Use SDK method to get server info
    const serverInfo1 = client1.getServerVersion();
    const serverInfo2 = client2.getServerVersion();
    expect(serverInfo1?.name).toBe('speqq-projects');
    expect(serverInfo2?.name).toBe('speqq-projects');
    expect(serverInfo1?.name).toBe(serverInfo2?.name);
    
    // Cleanup
    await client1.close();
    await client2.close();
  });

  test('Server name follows FastMCP configuration pattern', async () => {
    // This test verifies the server was configured correctly with FastMCP
    // The name should be set in the FastMCP constructor
    
    // Act
    await client.connect(transport);
    
    // Assert - Use SDK method to verify server configuration
    const serverInfo = client.getServerVersion();
    expect(serverInfo).toMatchObject({
      name: 'speqq-projects',
      version: expect.any(String)
    });
  });
});
