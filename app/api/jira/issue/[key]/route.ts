import { NextRequest, NextResponse } from 'next/server';
import { requireEnv } from '@/app/api/jira/lib/client';
import { buildAdfDescriptionFromText } from '@/app/api/jira/lib/transformer';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

function normalizeLabels(input?: any): string[] {
  const raw = Array.isArray(input) ? input.map((x) => String(x)) : [];
  const out = raw.map((l) => (/^(US|AC)_\d+$/i.test(l) ? l : l.toLowerCase()));
  return Array.from(new Set(out));
}

async function jiraUpdateIssue(key: string, fields: any) {
  const host = requireEnv('JIRA_BASE_URL').replace(/\/$/, '');
  const email = requireEnv('JIRA_EMAIL');
  const token = requireEnv('JIRA_API_TOKEN');
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const r = await fetch(`${host}/rest/api/3/issue/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const err: any = new Error(`Jira update failed: ${r.status}`);
    err.status = r.status;
    err.details = text;
    throw err;
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await ctx.params;
    if (!key) return NextResponse.json({ ok: false, error: 'MISSING_KEY' }, { status: 400 });

    // Validate body
    const body = await req.json();
    const summary = String(body?.summary ?? '').trim();
    const descriptionText: string | undefined = body?.description ? String(body.description) : undefined;
    const labelsInput = body?.labels;
    const baselineUpdated: string | undefined = body?.baselineUpdated ? String(body.baselineUpdated) : undefined;
    if (!summary) return NextResponse.json({ ok: false, error: 'VALIDATION_FAILED:summary' }, { status: 400 });
    if (!baselineUpdated) return NextResponse.json({ ok: false, error: 'MISSING_BASELINE' }, { status: 400 });

    // Fetch Jira updated timestamp for optimistic locking
    const host = requireEnv('JIRA_BASE_URL').replace(/\/$/, '');
    const email = requireEnv('JIRA_EMAIL');
    const token = requireEnv('JIRA_API_TOKEN');
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    const metaRes = await fetch(`${host}/rest/api/3/issue/${encodeURIComponent(key)}?fields=updated`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!metaRes.ok) return NextResponse.json({ ok: false, error: 'JIRA_FETCH_FAILED' }, { status: 500 });
    const meta = await metaRes.json();
    const jiraUpdatedStr: string | undefined = meta?.fields?.updated;
    if (jiraUpdatedStr && new Date(jiraUpdatedStr) > new Date(baselineUpdated)) {
      return NextResponse.json({ ok: false, error: 'CONFLICT_DETECTED', jiraUpdated: jiraUpdatedStr }, { status: 409 });
    }

    // Build Jira fields
    const fields: any = { summary };
    if (typeof descriptionText === 'string') fields.description = buildAdfDescriptionFromText(descriptionText);
    const labels = normalizeLabels(labelsInput);
    if (labels.length) fields.labels = labels;

    // Update Jira first
    await jiraUpdateIssue(key, fields);

    // Update local DB
    const existing = await prisma.jiraStory.findFirst({ where: { jiraKey: key } });
    const now = new Date();
    const updates: any = { lastSummary: summary, localUpdatedAt: now };
    if (typeof descriptionText === 'string') updates.lastDescription = descriptionText;
    if (labels.length) updates.labels = labels;
    if (existing) {
      await prisma.jiraStory.update({ where: { id: existing.id }, data: updates });
    }

    // Audit entry
    // Compute human-readable changes
    const changes: any[] = [];
    if (existing) {
      if (summary !== existing.lastSummary) changes.push({ field: 'summary', from: existing.lastSummary ?? null, to: summary });
      if (typeof descriptionText === 'string' && descriptionText !== existing.lastDescription) changes.push({ field: 'description', from: existing.lastDescription ?? null, to: descriptionText });
      if (labels.length && JSON.stringify(labels) !== JSON.stringify(existing.labels)) changes.push({ field: 'labels', from: existing.labels || [], to: labels });
    }

    await prisma.jiraSyncAudit.create({
      data: {
        source: 'app',
        jiraKey: key,
        appId: existing?.storyId || null,
        fieldsChanged: [
          'update',
          ...(summary !== existing?.lastSummary ? ['summary'] : []),
          ...(typeof descriptionText === 'string' && descriptionText !== existing?.lastDescription ? ['description'] : []),
          ...(labels.length ? ['labels'] : []),
        ],
        diff: { origin: 'ui:lifecycle-drawer', changes },
        status: 'applied',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err?.status === 409 ? 409 : (err?.status && Number.isFinite(err.status) ? err.status : 500);
    const code = status === 409 ? 'CONFLICT_DETECTED' : (status >= 500 ? 'JIRA_UPDATE_FAILED' : 'BAD_REQUEST');
    return NextResponse.json({ ok: false, error: code, details: err?.details || err?.message }, { status });
  }
}
