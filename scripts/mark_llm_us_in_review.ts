import { prisma } from '../app/lib/prisma.ts';

async function mark(projectName: string, storyNumbers: number[], link?: string) {
  const project = await prisma.project.findFirst({ where: { name: projectName } });
  if (!project) throw new Error(`Project not found: ${projectName}`);
  for (const n of storyNumbers) {
    const story = await prisma.userStory.findFirst({ where: { projectId: project.id, storyNumber: n } });
    if (!story) continue;
    await prisma.userStory.update({ where: { id: story.id }, data: { status: 'In Review', ...(link ? { testLink: link } : {}) } });
    await prisma.acceptanceCriteria.updateMany({ where: { userStoryId: story.id }, data: { status: 'In Review' } });
    const refreshed = await prisma.userStory.findUnique({ where: { id: story.id }, include: { acceptanceCriteria: true } });
    console.log(`US${n} -> In Review`, refreshed?.status, refreshed?.acceptanceCriteria?.map(a=>a.status));
  }
}

async function main() {
  const projectName = 'LLM Engineering Co-Pilot';
  await mark(projectName, [2,3]);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

