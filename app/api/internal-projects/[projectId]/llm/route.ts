import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/internal-projects/:projectId/llm
// Returns minimal normalized JSON for a single project
export async function GET(_req: NextRequest, context: { params: { projectId: string } }) {
  try {
    const projectId = context.params?.projectId;
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
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

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const storyCount = project.userStories.length;
    const completedCount = project.userStories.filter(s => s.status === 'Completed').length;

    const data = {
      id: project.id,
      name: project.name,
      status: project.status,
      storyCount,
      completedCount,
      stories: project.userStories.map(s => ({
        id: `US${s.storyNumber}`,
        title: s.title,
        status: s.status,
        priority: s.priority,
        testLink: s.testLink || null,
        acs: s.acceptanceCriteria
          .sort((a, b) => a.criteriaNumber - b.criteriaNumber)
          .map(ac => ({ id: `AC${ac.criteriaNumber}`, description: ac.description, status: ac.status })),
      })),
    };

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('LLM endpoint error:', err);
    return NextResponse.json({ success: false, error: 'Failed to build LLM payload' }, { status: 500 });
  }
}

