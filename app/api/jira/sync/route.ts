import { NextRequest, NextResponse } from "next/server";
import { jiraGet, jiraPost, requireEnv } from "../lib/client";
import { speqqToJiraFields } from "../lib/transformer";
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    requireEnv('JIRA_BASE_URL');
    requireEnv('JIRA_EMAIL');
    requireEnv('JIRA_API_TOKEN');
    requireEnv('JIRA_PROJECT_KEY');
    requireEnv('JIRA_ISSUE_TYPE');

    const body = await req.json();
    const story = body?.story;
    if (!story) return NextResponse.json({ ok: false, error: 'MISSING_STORY' }, { status: 400 });
    let fields: any = speqqToJiraFields(story);
    // Optional: link to Epic when epicKey is provided
    const epicKey: string | undefined = body?.epicKey || story?.epicKey;
    if (epicKey) {
      // Detect project type to decide parent vs Epic Link
      const meta = await jiraGet('/rest/api/3/issue/createmeta', { projectKeys: process.env.JIRA_PROJECT_KEY!, issuetypeNames: 'Story', expand: 'projects.issuetypes.fields' });
      const project = (meta as any)?.projects?.[0];
      const storyType = project?.issuetypes?.find((t: any) => t.name === 'Story');
      const f = storyType?.fields || {};
      const isTeamManaged = !!(f as any)?.parent;
      let epicLinkField: string | undefined;
      for (const [fid, def] of Object.entries(f)) {
        const fd: any = def;
        if (fd?.name === 'Epic Link') { epicLinkField = fid; break; }
      }
      if (isTeamManaged) {
        fields = { ...fields, parent: { key: epicKey } };
      } else if (epicLinkField) {
        fields = { ...fields, [epicLinkField]: epicKey };
      }
    }
    const created = await jiraPost('/rest/api/3/issue', { fields });
    const key: string = created?.key;
    if (!key) return NextResponse.json({ ok: false, error: 'JIRA_CREATE_FAILED' }, { status: 400 });
    // Persist mapping
    const labels: string[] = Array.isArray(fields.labels) ? fields.labels.map(String) : [];
    const storyId: string = String(story.id || '');
    if (!storyId) return NextResponse.json({ ok: false, error: 'MISSING_STORY_ID' }, { status: 400 });
    const existing = await prisma.jiraStory.findFirst({ where: { OR: [{ storyId }, { jiraKey: key }] } });
    if (existing) {
      await prisma.jiraStory.update({ where: { id: existing.id }, data: { storyId, jiraKey: key, labels, epicKey: epicKey || existing.epicKey || null } });
    } else {
      await prisma.jiraStory.create({ data: { storyId, jiraKey: key, labels, epicKey: epicKey || null } });
    }
    // Audit record for app-originated creation
    await prisma.jiraSyncAudit.create({
      data: {
        source: 'app',
        jiraKey: key,
        appId: storyId,
        fieldsChanged: ['create'],
        diff: { storyId, labels, epicKey: epicKey || null },
        status: 'applied',
      },
    });
    return NextResponse.json({ ok: true, key });
  } catch (err: any) {
    const code = err?.code || err?.status ? 'JIRA_CREATE_FAILED' : 'BAD_REQUEST';
    return NextResponse.json({ ok: false, error: code, details: err?.details || err?.message }, { status: 400 });
  }
}
