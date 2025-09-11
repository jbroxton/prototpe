import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

function unauthorized(msg = 'UNAUTHORIZED') {
  return NextResponse.json({ ok: false, error: msg }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-jira-webhook-token');
  const expected = process.env.JIRA_WEBHOOK_TOKEN || '';
  if (!expected) return NextResponse.json({ ok: false, error: 'MISSING_ENV:JIRA_WEBHOOK_TOKEN' }, { status: 400 });
  if (!token || token !== expected) return unauthorized();
  const body = await req.json();
  const issue = body?.issue;
  const key: string | undefined = issue?.key;
  const statusName: string | undefined = issue?.fields?.status?.name;
  if (!key) return NextResponse.json({ ok: false, error: 'MISSING_ISSUE_KEY' }, { status: 400 });
  const webhookEvent: string = String(body?.webhookEvent || body?.issue_event_type_name || 'unknown');
  const summary: string | undefined = issue?.fields?.summary;
  const labels: string[] | undefined = issue?.fields?.labels;
  const updatedAt: string | undefined = issue?.fields?.updated;
  const deleted = /deleted/i.test(webhookEvent);

  const existing = await prisma.jiraStory.findFirst({ where: { jiraKey: key } });
  let auditStatus: 'applied' | 'conflict' = 'applied';
  const fieldsChanged: string[] = [];
  const changes: any[] = [];
  if (existing) {
    const jiraUpdated = updatedAt ? new Date(updatedAt) : undefined;
    const appUpdated = existing.appUpdatedAt || undefined;
    const appWins = appUpdated && jiraUpdated ? appUpdated > jiraUpdated : false;
    // Status: Jira wins always
    if (statusName && statusName !== existing.lastStatus) {
      fieldsChanged.push('status');
      changes.push({ field: 'status', from: existing.lastStatus ?? null, to: statusName });
    }

    // Summary/labels: App wins when appUpdatedAt newer than Jira's updated
    let nextSummary = existing.lastSummary ?? null;
    let nextLabels = existing.labels;
    if (!appWins) {
      if (typeof summary === 'string' && summary !== existing.lastSummary) {
        nextSummary = summary;
        fieldsChanged.push('summary');
        changes.push({ field: 'summary', from: existing.lastSummary ?? null, to: summary });
      }
      if (Array.isArray(labels)) {
        const newLabels = labels.map(String);
        if (JSON.stringify(newLabels) !== JSON.stringify(existing.labels)) {
          nextLabels = newLabels;
          fieldsChanged.push('labels');
          changes.push({ field: 'labels', from: existing.labels || [], to: newLabels });
        }
      }
    } else {
      // Conflict detected for summary/labels if webhook attempted to change them
      if (typeof summary === 'string' && summary !== existing.lastSummary) {
        auditStatus = 'conflict';
        changes.push({ field: 'summary', from: existing.lastSummary ?? null, to: summary, skipped: 'app-newer' });
      }
      if (Array.isArray(labels) && JSON.stringify(labels.map(String)) !== JSON.stringify(existing.labels)) {
        auditStatus = 'conflict';
        changes.push({ field: 'labels', from: existing.labels || [], to: labels.map(String), skipped: 'app-newer' });
      }
    }

    await prisma.jiraStory.update({
      where: { id: existing.id },
      data: {
        lastStatus: statusName || existing.lastStatus || null,
        lastSummary: nextSummary,
        labels: nextLabels,
        jiraUpdatedAt: jiraUpdated ?? existing.jiraUpdatedAt,
        deleted: deleted ? true : existing.deleted,
        deletedAt: deleted ? new Date() : existing.deletedAt,
      },
    });
  } else {
    await prisma.jiraStory.create({
      data: {
        storyId: key,
        jiraKey: key,
        lastStatus: statusName || null,
        lastSummary: summary || null,
        labels: Array.isArray(labels) ? labels.map(String) : [],
        jiraUpdatedAt: updatedAt ? new Date(updatedAt) : null,
        deleted: deleted,
        deletedAt: deleted ? new Date() : null,
      },
    });
  }
  await prisma.jiraSyncAudit.create({
    data: {
      source: 'jira',
      jiraKey: key,
      appId: null,
      fieldsChanged: fieldsChanged.length ? fieldsChanged : [
        ...(statusName ? ['status'] : []),
        ...(summary ? ['summary'] : []),
        ...(Array.isArray(labels) ? ['labels'] : []),
        ...(deleted ? ['deleted'] : []),
      ],
      diff: { origin: 'jira:webhook', changes, raw: body },
      status: auditStatus,
    },
  });
  return NextResponse.json({ ok: true });
}
