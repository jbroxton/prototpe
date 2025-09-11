import { NextRequest } from 'next/server';

const BASE = process.env.EXPERT_SERVER_URL || 'http://localhost:8787';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const r = await fetch(`${BASE}/entities/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: body?.prefix || '', role: body?.role, k: body?.k || 5 })
  });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { 'Content-Type': 'application/json' } });
}

