import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

const VALID_STATUSES = ["Not Started", "In Progress", "In Review", "Completed"] as const;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const releases = await prisma.release.findMany({
      where: { projectId },
      include: { _count: { select: { userStories: true } } },
      orderBy: { releaseNumber: 'asc' },
    });

    const data = releases.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      releaseNumber: r.releaseNumber,
      name: r.name,
      status: r.status,
      about: (r as any).about ?? null,
      notes: r.notes,
      startDate: r.startDate,
      targetDate: r.targetDate,
      storiesAssigned: r._count.userStories,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ success: true, data: { projectId, releases: data } });
  } catch (error) {
    console.error('Error listing releases:', error);
    return NextResponse.json({ success: false, error: 'Failed to list releases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try { body = await request.json(); } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    const { projectId, action, release } = body || {};
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }
    if (!action || !['add','update','delete'].includes(String(action))) {
      return NextResponse.json({ success: false, error: "Invalid action. Use 'add', 'update', or 'delete'" }, { status: 400 });
    }

    if (action === 'add') {
      const last = await prisma.release.findFirst({ where: { projectId }, orderBy: { releaseNumber: 'desc' } });
      const nextNumber = last ? last.releaseNumber + 1 : 1;
      const created = await prisma.release.create({
        data: {
          projectId,
          releaseNumber: nextNumber,
          name: (release?.name && String(release.name).trim()) || `Release ${nextNumber}`,
          status: (release?.status && VALID_STATUSES.includes(release.status)) ? release.status : 'Not Started',
          about: typeof release?.about !== 'undefined' && release.about !== null ? String(release.about) : null,
          notes: release?.notes ? String(release.notes) : null,
          startDate: release?.startDate ? new Date(release.startDate) : null,
          targetDate: release?.targetDate ? new Date(release.targetDate) : null,
        },
      });
      await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
      return NextResponse.json({ success: true, data: created, message: 'Release created successfully' });
    }

    // Resolve target release by id or (projectId, releaseNumber)
    let target: { id: string } | null = null;
    if (release?.id) {
      target = await prisma.release.findUnique({ where: { id: String(release.id) } });
    } else if (typeof release?.releaseNumber === 'number') {
      target = await prisma.release.findFirst({ where: { projectId, releaseNumber: release.releaseNumber } });
    }
    if (!target) {
      return NextResponse.json({ success: false, error: 'Release not found' }, { status: 404 });
    }

    if (action === 'update') {
      if (release?.status && !VALID_STATUSES.includes(release.status)) {
        return NextResponse.json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
      }
      const updated = await prisma.release.update({
        where: { id: target.id },
        data: {
          name: (typeof release?.name !== 'undefined') ? String(release.name) : undefined,
          status: (typeof release?.status !== 'undefined') ? String(release.status) : undefined,
          about: (typeof release?.about !== 'undefined') ? (release.about === null ? null : String(release.about)) : undefined,
          notes: (typeof release?.notes !== 'undefined') ? (release.notes === null ? null : String(release.notes)) : undefined,
          startDate: (typeof release?.startDate !== 'undefined') ? (release.startDate ? new Date(release.startDate) : null) : undefined,
          targetDate: (typeof release?.targetDate !== 'undefined') ? (release.targetDate ? new Date(release.targetDate) : null) : undefined,
        },
      });
      await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
      return NextResponse.json({ success: true, data: updated, message: 'Release updated successfully' });
    }

    if (action === 'delete') {
      const count = await prisma.userStory.count({ where: { releaseId: target.id } });
      if (count > 0) {
        return NextResponse.json({ success: false, error: 'Cannot delete release with assigned stories' }, { status: 400 });
      }
      await prisma.release.delete({ where: { id: target.id } });
      await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
      return NextResponse.json({ success: true, message: 'Release deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Unhandled action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing release:', error);
    return NextResponse.json({ success: false, error: 'Failed to manage release' }, { status: 500 });
  }
}
