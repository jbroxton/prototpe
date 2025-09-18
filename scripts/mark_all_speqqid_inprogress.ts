import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const projectName = 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View';
  const project = await prisma.project.findFirst({ where: { name: projectName } });
  if (!project) throw new Error('Project not found');
  const stories = await prisma.userStory.findMany({ where: { projectId: project.id, storyNumber: { gte: 4, lte: 7 } }, select: { id: true } });
  for (const s of stories) {
    await prisma.acceptanceCriteria.updateMany({ where: { userStoryId: s.id }, data: { status: 'In Progress' } });
    await prisma.userStory.update({ where: { id: s.id }, data: { status: 'In Progress' } });
  }
  console.log(`Moved all SpeqqID ACs (US4–US7) to In Progress for project ${project.id}`);
}

main().then(()=>prisma.$disconnect()).catch(async e=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });

