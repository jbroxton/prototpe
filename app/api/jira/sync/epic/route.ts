import { NextRequest, NextResponse } from 'next/server';
import { jiraPost, requireEnv } from '@/app/api/jira/lib/client';
import { buildPlainDescription, buildAdfDescriptionFromText } from '@/app/api/jira/lib/transformer';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    requireEnv('JIRA_BASE_URL');
    requireEnv('JIRA_EMAIL');
    requireEnv('JIRA_API_TOKEN');
    requireEnv('JIRA_PROJECT_KEY');
    const epicType = requireEnv('JIRA_EPIC_ISSUE_TYPE'); // Explicit for MVP

    const body = await req.json();
    const epic = body?.epic;
    if (!epic) return NextResponse.json({ ok: false, error: 'MISSING_EPIC' }, { status: 400 });
    const projectKey = process.env.JIRA_PROJECT_KEY as string;
    const summary = String(epic?.title || 'Untitled Epic');
    const text = buildPlainDescription({ description: epic?.description });
    const description = buildAdfDescriptionFromText(text);
    const rawLabels: string[] = ([] as string[])
      .concat(Array.isArray(epic?.labels) ? epic.labels.map(String) : [])
      .concat([String(epic?.id || '').trim()].filter(Boolean))
      .concat(['speqq-e2e']);
    const labels = Array.from(new Set(rawLabels.map((l) => (/^(US|AC)_\d+$/i.test(l) ? l : l.toLowerCase()))));

    const created = await jiraPost('/rest/api/3/issue', {
      fields: {
        project: { key: projectKey },
        issuetype: { name: epicType },
        summary,
        description,
        labels,
      },
    });
    const key: string = String(created?.key || '');
    if (!key) return NextResponse.json({ ok: false, error: 'JIRA_CREATE_FAILED' }, { status: 400 });

    const appEpicId: string = String(epic?.id || '');
    if (!appEpicId) return NextResponse.json({ ok: false, error: 'MISSING_EPIC_ID' }, { status: 400 });

    const existing = await prisma.jiraEpic.findFirst({ where: { OR: [{ appEpicId }, { jiraKey: key }] } });
    if (existing) {
      await prisma.jiraEpic.update({ where: { id: existing.id }, data: { appEpicId, jiraKey: key, labels, lastSummary: summary } });
    } else {
      await prisma.jiraEpic.create({ data: { appEpicId, jiraKey: key, labels, lastSummary: summary } });
    }
    // Audit record for app-originated epic creation
    await prisma.jiraSyncAudit.create({
      data: {
        source: 'app',
        jiraKey: key,
        appId: appEpicId,
        fieldsChanged: ['create'],
        diff: { appEpicId, labels },
        status: 'applied',
      },
    });
    return NextResponse.json({ ok: true, key });
  } catch (err: any) {
    const code = err?.code || err?.status ? 'JIRA_CREATE_FAILED' : 'BAD_REQUEST';
    return NextResponse.json({ ok: false, error: code, details: err?.details || err?.message }, { status: 400 });
  }
}
