import { NextRequest, NextResponse } from 'next/server';
import { jiraGet, requireEnv } from '../lib/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ ok: false, error: 'NOT_AVAILABLE' }, { status: 404 });
    }
    requireEnv('JIRA_BASE_URL');
    requireEnv('JIRA_EMAIL');
    requireEnv('JIRA_API_TOKEN');
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ ok: false, error: 'Missing key' }, { status: 400 });
  const raw = searchParams.get('raw') === '1';
  const issue = await jiraGet(`/rest/api/3/issue/${encodeURIComponent(key)}`, { fields: 'summary,labels,description,status,parent' });
  // Extract a plaintext description when ADF is present
  let descriptionText = '';
  const desc = (issue as any)?.fields?.description;
  try {
    if (desc && typeof desc === 'object' && desc.type === 'doc') {
      descriptionText = flattenAdfToText(desc);
    } else if (typeof desc === 'string') {
      descriptionText = desc;
    }
  } catch { /* ignore */ }
  const response: any = {
    ok: true,
    key: issue.key,
    fields: {
      summary: (issue as any)?.fields?.summary,
      descriptionText,
      labels: (issue as any)?.fields?.labels || [],
      status: (issue as any)?.fields?.status?.name || '',
      parent: (issue as any)?.fields?.parent || null,
    },
  };
  if (raw) {
    response.fieldsRaw = (issue as any)?.fields || {};
  }
  return NextResponse.json(response);
  } catch (err: any) {
    const code = err?.code || err?.status ? 'JIRA_FETCH_FAILED' : 'BAD_REQUEST';
    return NextResponse.json({ ok: false, error: code, details: err?.details || err?.message }, { status: 400 });
  }
}

function flattenAdfToText(adf: any): string {
  const parts: string[] = [];
  function walk(node: any) {
    if (!node) return;
    if (node.type === 'text' && node.text) parts.push(node.text);
    if (node.type === 'paragraph') parts.push('\n');
    if (node.type === 'listItem') parts.push('\n- ');
    const content = node.content || [];
    for (const c of content) walk(c);
  }
  walk(adf);
  return parts.join('').replace(/\n{2,}/g, '\n').trim();
}
