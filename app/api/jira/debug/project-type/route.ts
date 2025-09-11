import { NextRequest, NextResponse } from 'next/server';
import { jiraGet, requireEnv } from '@/app/api/jira/lib/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    requireEnv('JIRA_BASE_URL');
    requireEnv('JIRA_EMAIL');
    requireEnv('JIRA_API_TOKEN');
    const { searchParams } = new URL(req.url);
    const projectKey = String(searchParams.get('key') || '').trim();
    if (!projectKey) return NextResponse.json({ ok: false, error: 'MISSING_PROJECT_KEY' }, { status: 400 });
    const meta = await jiraGet('/rest/api/3/issue/createmeta', {
      projectKeys: projectKey,
      issuetypeNames: 'Story',
      expand: 'projects.issuetypes.fields',
    });
    const project = (meta as any)?.projects?.[0];
    const storyType = project?.issuetypes?.find((t: any) => t.name === 'Story');
    const fields = storyType?.fields || {};
    const hasParent = !!(fields as any)?.parent;
    let epicLinkField: string | undefined;
    for (const [fid, fdef] of Object.entries(fields)) {
      const def: any = fdef;
      if (def?.name === 'Epic Link') {
        epicLinkField = fid;
        break;
      }
    }
    const type = hasParent ? 'team-managed' : (epicLinkField ? 'company-managed' : 'unknown');
    return NextResponse.json({ ok: true, projectKey, type, epicLinkField });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'JIRA_FETCH_FAILED', details: err?.message }, { status: 400 });
  }
}

