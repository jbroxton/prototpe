import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'LLM Engineering Co-Pilot' } });
  if (!project) throw new Error('Project not found');
  const story = await prisma.userStory.findFirst({ where: { projectId: project.id, storyNumber: 2 } });
  if (!story) throw new Error('US2 not found');

  const link = `/internal-projects/${project.id}/unified`;
  await prisma.userStory.update({ where: { id: story.id }, data: { status: 'In Review', testLink: link } });
  await prisma.acceptanceCriteria.updateMany({ where: { userStoryId: story.id }, data: { status: 'In Review' } });

  const updated = await prisma.userStory.findUnique({ where: { id: story.id }, include: { acceptanceCriteria: true } });
  console.log(JSON.stringify({ projectId: project.id, story: updated }, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

