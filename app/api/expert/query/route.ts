import { NextRequest } from 'next/server';

const BASE = process.env.EXPERT_SERVER_URL || 'http://localhost:8787';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const r = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: body?.q || '' })
  });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { 'Content-Type': 'application/json' } });
}

