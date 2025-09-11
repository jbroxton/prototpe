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

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  try {
    requireEnv('JIRA_BASE_URL');
    requireEnv('JIRA_EMAIL');
    requireEnv('JIRA_API_TOKEN');
    const { key } = await ctx.params;
    if (!key) return NextResponse.json({ ok: false, error: 'MISSING_KEY' }, { status: 400 });

    // Fetch local; 404 if not found
    const local = await prisma.jiraStory.findFirst({ where: { jiraKey: key } });
    if (!local) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });

    // Attempt Jira fetch; fallback to partial response
    let fields: any = null;
    let jiraError: string | null = null;
    try {
      const issue = await jiraGet(`/rest/api/3/issue/${encodeURIComponent(key)}`, {
        fields: 'summary,labels,description,status,assignee,updated',
      });
      fields = (issue as any)?.fields || {};
    } catch {
      jiraError = 'JIRA_FETCH_FAILED';
    }

    const descriptionText = fields?.description && typeof fields.description === 'object' && fields.description.type === 'doc'
      ? flattenAdfToText(fields.description)
      : (typeof fields?.description === 'string' ? fields.description : '');

    const audits = await prisma.jiraSyncAudit.findMany({ where: { jiraKey: key }, orderBy: { createdAt: 'desc' }, take: 20 });

    // Conflict: Jira updated > local.localUpdatedAt
    let hasConflict = false;
    try {
      const jiraUpdated = fields?.updated ? new Date(fields.updated) : null;
      const localUpdatedAt = local.localUpdatedAt ? new Date(local.localUpdatedAt) : null;
      if (jiraUpdated && localUpdatedAt && jiraUpdated > localUpdatedAt) hasConflict = true;
    } catch {}

    return NextResponse.json({
      ok: true,
      key,
      jira: fields ? {
        summary: fields.summary || '',
        descriptionText,
        labels: fields.labels || [],
        status: fields.status?.name || '',
        assignee: fields.assignee?.displayName || null,
        updated: fields.updated || null,
        fields,
      } : null,
      local: {
        storyId: local.storyId,
        lastSummary: local.lastSummary ?? null,
        lastDescription: local.lastDescription ?? null,
        labels: local.labels || [],
        lastStatus: local.lastStatus ?? null,
        appUpdatedAt: local.appUpdatedAt ?? null,
        jiraUpdatedAt: local.jiraUpdatedAt ?? null,
        localUpdatedAt: local.localUpdatedAt ?? null,
        deleted: local.deleted,
        deletedAt: local.deletedAt ?? null,
        updatedAt: local.updatedAt,
      },
      audits,
      hasConflict,
      jiraError,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'DETAILS_FETCH_FAILED', details: err?.message }, { status: 400 });
  }
}
