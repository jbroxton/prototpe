/**
 * Validation utility to ensure proper MCP SDK usage
 * Catches common anti-patterns and enforces best practices
 */

export interface MCPViolation {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export function validateMCPUsage(codeContent: string, fileName: string = 'unknown'): MCPViolation[] {
  const violations: MCPViolation[] = [];
  const lines = codeContent.split('\n');
  
  // Track state
  let hasConnect = false;
  let connectLine = -1;
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for connect() call
    if (/client\.connect\(/.test(line)) {
      hasConnect = true;
      connectLine = lineNumber;
    }
    
    // Anti-pattern 1: Manual initialize after connect
    if (hasConnect && /method:\s*['"]initialize['"]/.test(line)) {
      violations.push({
        line: lineNumber,
        column: line.indexOf('initialize'),
        message: `Manual initialize call detected after connect() (connect was on line ${connectLine}). Use client.serverInfo instead.`,
        severity: 'error'
      });
    }
    
    // Anti-pattern 2: Building JSON-RPC messages manually (except in proxy layer)
    if (!fileName.includes('api/mcp') && /jsonrpc:\s*['"]2\.0['"]/.test(line)) {
      violations.push({
        line: lineNumber,
        column: line.indexOf('jsonrpc'),
        message: 'Manual JSON-RPC message construction detected. Use MCP SDK methods instead.',
        severity: 'error'
      });
    }
    
    // Anti-pattern 3: Accessing protocol internals
    if (/\._protocol\b/.test(line) || /\._transport\b/.test(line)) {
      violations.push({
        line: lineNumber,
        column: line.indexOf('._'),
        message: 'Accessing private MCP client internals. Use public SDK methods only.',
        severity: 'error'
      });
    }
    
    // Warning: Direct protocol method calls
    if (/request\(\s*{\s*method:\s*['"]/.test(line) && !line.includes('initialize')) {
      violations.push({
        line: lineNumber,
        column: line.indexOf('request'),
        message: 'Direct protocol method call detected. Consider using SDK convenience methods.',
        severity: 'warning'
      });
    }
  });
  
  return violations;
}

/**
 * Assert that code follows proper SDK usage patterns
 * Throws an error if violations are found
 */
export function assertProperSDKUsage(codeFile: string, fileName?: string): void {
  const violations = validateMCPUsage(codeFile, fileName);
  
  if (violations.length > 0) {
    const errorMessages = violations
      .filter(v => v.severity === 'error')
      .map(v => `Line ${v.line}: ${v.message}`)
      .join('\n');
    
    if (errorMessages) {
      throw new Error(`SDK usage violations found:\n${errorMessages}`);
    }
  }
}

/**
 * Correct usage patterns for reference
 */
export const CORRECT_PATTERNS = {
  connect: 'await client.connect(transport);',
  serverInfo: 'const serverName = client.serverInfo?.name;',
  callTool: 'const result = await client.callTool({ name: "toolName", arguments: {} });',
  close: 'await client.close();',
  listTools: 'const tools = await client.listTools();'
};

/**
 * Anti-patterns to avoid
 */
export const ANTI_PATTERNS = {
  manualInitialize: 'client.request({ method: "initialize", ... }); // ❌ Don\'t do this after connect()',
  manualJsonRpc: '{ jsonrpc: "2.0", method: "...", ... } // ❌ Use SDK methods instead',
  protocolAccess: 'client._protocol // ❌ Never access private properties',
  doubleConnect: 'client.connect(); client.connect(); // ❌ Only connect once'
};