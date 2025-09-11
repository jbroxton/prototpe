import { NextRequest, NextResponse } from 'next/server';
import { jiraGet, requireEnv } from '@/app/api/jira/lib/client';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

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
  try { walk(adf); } catch {}
  return parts.join('').replace(/\n{2,}/g, '\n').trim();
}

function arrayDiff(a: string[] = [], b: string[] = []) {
  const as = new Set(a);
  const bs = new Set(b);
  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];
  for (const x of bs) { if (as.has(x)) unchanged.push(x); else added.push(x); }
  for (const x of as) { if (!bs.has(x)) removed.push(x); }
  return { added, removed, unchanged };
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  try {
    requireEnv('JIRA_BASE_URL');
    requireEnv('JIRA_EMAIL');
    requireEnv('JIRA_API_TOKEN');
    const { key } = await ctx.params;
    if (!key) return NextResponse.json({ ok: false, error: 'MISSING_KEY' }, { status: 400 });

    const local = await prisma.jiraStory.findFirst({ where: { jiraKey: key } });
    if (!local) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });

    let fields: any = {};
    try {
      const issue = await jiraGet(`/rest/api/3/issue/${encodeURIComponent(key)}`, {
        fields: 'summary,labels,description,status,updated',
      });
      fields = (issue as any)?.fields || {};
    } catch (e: any) {
      return NextResponse.json({
        ok: true,
        key,
        updated: { jira: null, local: local.localUpdatedAt ?? null },
        fields: {
          summary: { jira: null, local: local.lastSummary ?? null, equal: false },
          description: { jiraText: null, localText: local.lastDescription ?? null, equal: false },
          labels: { added: [], removed: [], unchanged: [] },
          status: { jira: null, local: local.lastStatus ?? null, equal: false },
        },
        jiraError: 'JIRA_FETCH_FAILED',
      });
    }

    const jiraSummary: string | null = fields.summary ?? null;
    const jiraLabels: string[] = Array.isArray(fields.labels) ? fields.labels.map(String) : [];
    const jiraStatus: string | null = fields.status?.name ?? null;
    const jiraUpdated: string | null = fields.updated ?? null;
    const jiraText: string | null = fields?.description && typeof fields.description === 'object' && fields.description.type === 'doc'
      ? flattenAdfToText(fields.description)
      : (typeof fields.description === 'string' ? fields.description : null);

    const localSummary = local.lastSummary ?? null;
    const localLabels = local.labels || [];
    const localStatus = local.lastStatus ?? null;
    const localText = local.lastDescription ?? null;
    const localUpdated = (local.localUpdatedAt ?? local.updatedAt) ?? null;

    const summaryEqual = (jiraSummary ?? '') === (localSummary ?? '');
    const statusEqual = (jiraStatus ?? '') === (localStatus ?? '');
    const descEqual = (jiraText ?? '') === (localText ?? '');
    const labels = arrayDiff(localLabels, jiraLabels);

    return NextResponse.json({
      ok: true,
      key,
      updated: { jira: jiraUpdated, local: localUpdated },
      fields: {
        summary: { jira: jiraSummary, local: localSummary, equal: summaryEqual },
        description: { jiraText, localText, equal: descEqual },
        labels,
        status: { jira: jiraStatus, local: localStatus, equal: statusEqual },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'DIFF_FAILED', details: err?.message }, { status: 400 });
  }
}
