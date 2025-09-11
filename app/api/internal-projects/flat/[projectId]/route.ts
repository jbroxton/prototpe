import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

const compact = (s: string) => s.replace(/\s+/g, '');

export async function GET(_req: NextRequest, ctx: { params: { projectId: string } }) {
  try {
    const projectId = ctx.params?.projectId;
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        userStories: {
          include: { acceptanceCriteria: true },
          orderBy: { storyNumber: 'asc' },
        },
      },
    });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const flat: Record<string, string | string> = {
      id: project.id,
      name: project.name,
    };

    for (const s of project.userStories) {
      const completedACs = s.acceptanceCriteria.filter(ac => ac.status === 'Completed').length;
      flat[`US${s.storyNumber}`] = `${compact(s.status)}|${completedACs}/${s.acceptanceCriteria.length}`;
    }

    return NextResponse.json(flat);
  } catch (e) {
    console.error('flat read error', e);
    return NextResponse.json({ error: 'Failed to build flat payload' }, { status: 500 });
  }
}

