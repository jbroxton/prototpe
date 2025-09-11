import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/internal-projects/summary
// Returns minimal project list for LLM consumption
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { userStories: true },
      orderBy: { updatedAt: 'desc' },
    });

    const summary = projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      storyCount: p.userStories.length,
      completedCount: p.userStories.filter((s) => s.status === 'Completed').length,
    }));

    return NextResponse.json({ success: true, projects: summary });
  } catch (error) {
    console.error('Error generating projects summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate summary' }, { status: 500 });
  }
}

