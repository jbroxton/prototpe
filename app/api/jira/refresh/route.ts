import { NextRequest, NextResponse } from "next/server";
import { jiraGet, requireEnv } from "../lib/client";
import { jiraToSpeqqStatus } from "../lib/transformer";
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    requireEnv('JIRA_BASE_URL');
    requireEnv('JIRA_EMAIL');
    requireEnv('JIRA_API_TOKEN');
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ ok: false, error: "Missing key" }, { status: 400 });
    const issue = await jiraGet(`/rest/api/3/issue/${encodeURIComponent(key)}`, { fields: 'status' });
    const status = jiraToSpeqqStatus(issue);
    // Persist status if mapping exists
    const mapping = await prisma.jiraStory.findFirst({ where: { jiraKey: key } });
    if (mapping) {
      await prisma.jiraStory.update({ where: { id: mapping.id }, data: { lastStatus: String((status as any).status || (status as any) || '') } });
    }
    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    const code = err?.code || err?.status ? 'JIRA_FETCH_FAILED' : 'BAD_REQUEST';
    return NextResponse.json({ ok: false, error: code, details: err?.details || err?.message }, { status: 400 });
  }
}
