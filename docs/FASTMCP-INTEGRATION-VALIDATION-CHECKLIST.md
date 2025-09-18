# FastMCP Remote Deployment Checklist

This checklist validates the remote FastMCP deployment. The service must follow the official SDK documentation without custom proxies or wrappers.

## 1. Remote Server
- [ ] FastMCP server runs the stock HTTP stream transport (`transportType: 'httpStream'`, `endpoint: '/mcp'`).
- [ ] Authentication uses the built-in `authenticate` callback with a single bearer token (`MCP_API_KEY`).
- [ ] No undocumented constructor/start options are provided.
- [ ] HTTPS endpoint is published (e.g. `https://speqq-mcp.example.com/mcp`).

## 2. Configuration
- [ ] Application reads `REMOTE_MCP_URL` for the remote endpoint (no fallbacks).
- [ ] `MCP_API_KEY` is stored server-side only and never exposed in the UI.
- [ ] Desktop LLM clients connect directly using `REMOTE_MCP_URL` + bearer token.

## 3. Testing
- [ ] Jest MCP suites use `REMOTE_MCP_URL` and `MCP_API_KEY`.
- [ ] Tests rely exclusively on the FastMCP SDK (`StreamableHTTPClientTransport`, `client.callTool`).
- [ ] No local process management, lock files, or validation logs remain in the repo.

## 4. Codebase Hygiene
- [ ] `/app/api/mcp/*` and other proxy layers deleted.
- [ ] `/app/lib/mcpServer.ts` removed (no auto-start logic).
- [ ] MCP-specific UI (status cards, parity alerts) deleted.
- [ ] `package.json` no longer exposes `mcp:start` or proxy scripts.

## 5. Deployment Verification
- [ ] Remote FastMCP server responds to authenticated `POST` requests at `/mcp` (JSON-RPC 2.0).
- [ ] Unauthenticated requests return `401`.
- [ ] `tools/list` returns the expected tool catalogue (projects/stories/acs CRUD).

Checking all boxes confirms the application is fully migrated to the remote-only FastMCP architecture.
