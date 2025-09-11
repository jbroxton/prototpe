import { prisma } from '../app/lib/prisma.ts';

async function markProjectStory(projectName: string, storyNumber: number) {
  const project = await prisma.project.findFirst({ where: { name: projectName } });
  if (!project) return;
  const story = await prisma.userStory.findFirst({ where: { projectId: project.id, storyNumber } });
  if (!story) return;
  await prisma.userStory.update({ where: { id: story.id }, data: { status: 'In Review' } });
  await prisma.acceptanceCriteria.updateMany({ where: { userStoryId: story.id }, data: { status: 'In Review' } });
  console.log(`Marked ${projectName} US${storyNumber} + ACs as In Review`);
}

async function main() {
  await markProjectStory('Page UI', 1);
  await markProjectStory('LLM Engineering Co-Pilot', 1);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

