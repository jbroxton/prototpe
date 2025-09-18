import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    const org = process.env.GH_ORG || '';
    const repo = process.env.GH_REPO || '';
    const defaultRepo = org && repo ? `${org}/${repo}` : '';
    return NextResponse.json({ ok: true, defaultRepo });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'CONFIG_FETCH_FAILED', details: err?.message }, { status: 400 });
  }
}

