import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/internal-projects/export
// Returns full structured export matching UI's LLM-Readable Format
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        userStories: {
          include: { acceptanceCriteria: true },
          orderBy: { storyNumber: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const payload = {
      exported_at: new Date().toISOString(),
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        about: p.about,
        status: p.status,
        userStories: p.userStories.map((s) => ({
          id: `US${s.storyNumber}`,
          title: s.title,
          description: s.description,
          testLink: s.testLink || null,
          status: s.status,
          priority: s.priority,
          acceptanceCriteria: s.acceptanceCriteria
            .sort((a, b) => a.criteriaNumber - b.criteriaNumber)
            .map((ac) => ({ id: `AC${ac.criteriaNumber}`, description: ac.description, status: ac.status })),
        })),
      })),
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate export' }, { status: 500 });
  }
}
