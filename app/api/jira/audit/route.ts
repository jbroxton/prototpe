import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jiraKey = searchParams.get('key') || undefined;
    const appId = searchParams.get('appId') || undefined;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limitParam = Number(searchParams.get('limit') || '100');
    const limit = Math.min(Math.max(1, isFinite(limitParam) ? limitParam : 100), 100);
    const offsetParam = Number(searchParams.get('offset') || '0');
    const offset = Math.max(0, isFinite(offsetParam) ? offsetParam : 0);
    const order = (searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    if (!jiraKey && !appId && !from && !to) {
      // Require at least one filter to avoid dumping entire table in MVP
      return bad('MISSING_FILTER');
    }

    const where: any = {};
    if (jiraKey) where.jiraKey = jiraKey;
    if (appId) where.appId = appId;
    if (from || to) {
      where.createdAt = {} as any;
      if (from) (where.createdAt as any).gte = new Date(from);
      if (to) (where.createdAt as any).lte = new Date(to);
    }

    const items = await prisma.jiraSyncAudit.findMany({
      where,
      orderBy: { createdAt: order as any },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'AUDIT_QUERY_FAILED', details: err?.message }, { status: 400 });
  }
}

