import { NextRequest, NextResponse } from "next/server";
import { requireEnv } from "../lib/client";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Always require explicit credentials in body for connect
    const body = (await req.json().catch(() => ({}))) as Partial<{ email: string; apiToken: string }>;
    const email = String(body?.email || '').trim();
    const apiToken = String(body?.apiToken || '').trim();
    if (!email || !apiToken) {
      return NextResponse.json({ ok: false, error: 'MISSING_CREDENTIALS' }, { status: 400 });
    }
    const baseUrl = requireEnv('JIRA_BASE_URL');
    // Validate with provided credentials against env base URL
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/rest/api/3/myself`, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'JIRA_AUTH_FAILED' }, { status: 400 });
    }
    const json = await res.json().catch(() => ({}));
    if (!json?.accountId) {
      return NextResponse.json({ ok: false, error: 'JIRA_AUTH_FAILED' }, { status: 400 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const code = err?.code || 'JIRA_CONNECT_FAILED';
    return NextResponse.json({ ok: false, error: code }, { status: 400 });
  }
}
