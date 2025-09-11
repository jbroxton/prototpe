export function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    const err: any = new Error(`Missing env ${name}`);
    err.code = `MISSING_ENV:${name}`;
    throw err;
  }
  return String(val);
}

function baseUrl() {
  // Only JIRA_BASE_URL supported.
  return requireEnv('JIRA_BASE_URL').replace(/\/$/, '');
}

function authHeader() {
  const email = requireEnv('JIRA_EMAIL');
  const apiToken = requireEnv('JIRA_API_TOKEN');
  const creds = Buffer.from(`${email}:${apiToken}`).toString('base64');
  return `Basic ${creds}`;
}

export async function jiraGet(path: string, query?: Record<string, string | undefined>) {
  const host = baseUrl();
  const qs = query
    ? '?' + Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';
  const r = await fetch(`${host}${path}${qs}`, {
    headers: { Authorization: authHeader(), Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const err: any = new Error(`Jira GET ${path} failed: ${r.status}`);
    err.status = r.status;
    err.details = text;
    throw err;
  }
  return r.json();
}

export async function jiraPost(path: string, body: any) {
  const host = baseUrl();
  const r = await fetch(`${host}${path}`, {
    method: 'POST',
    headers: { Authorization: authHeader(), Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const err: any = new Error(`Jira POST ${path} failed: ${r.status}`);
    err.status = r.status;
    err.details = text;
    throw err;
  }
  return r.json();
}

export async function testConnection(): Promise<boolean> {
  try {
    const me = await jiraGet('/rest/api/3/myself');
    return Boolean(me?.accountId);
  } catch {
    return false;
  }
}
