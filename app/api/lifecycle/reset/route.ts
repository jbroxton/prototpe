import { NextResponse } from 'next/server';
import { reset as resetStore } from '@/app/lib/demo/lifecycleStore';

export const runtime = 'nodejs';

export async function POST() {
  if (process.env.LIFECYCLE_DEMO !== '1') {
    return NextResponse.json({ ok: false, error: 'Not implemented (demo mode off)' }, { status: 501 });
  }
  resetStore();
  return NextResponse.json({ ok: true });
}

