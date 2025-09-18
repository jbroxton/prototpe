import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View' } });
  if (!project) throw new Error('Project not found');
  const stories = await prisma.userStory.findMany({ where: { projectId: project.id, storyNumber: { in: [4,5,6,7] } }, select: { id: true } });
  for (const s of stories) {
    await prisma.acceptanceCriteria.updateMany({ where: { userStoryId: s.id }, data: { status: 'In Progress' } });
    await prisma.userStory.update({ where: { id: s.id }, data: { status: 'In Progress' } });
  }
  console.log('Marked SpeqqID ACs and stories In Progress for US4–US7');
}

main().then(()=>prisma.$disconnect()).catch(async e=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });

