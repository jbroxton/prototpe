import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'Page UI' } });
  if (!project) throw new Error('Project "Page UI" not found');

  const story = await prisma.userStory.findFirst({ where: { projectId: project.id, storyNumber: 1 } });
  if (!story) throw new Error('US1 not found');

  // Set test link to the unified view page for quick manual validation
  const testLink = `/internal-projects/${project.id}/unified`;

  await prisma.userStory.update({
    where: { id: story.id },
    data: { status: 'Completed', testLink },
  });

  await prisma.acceptanceCriteria.updateMany({
    where: { userStoryId: story.id },
    data: { status: 'Completed' },
  });

  const updated = await prisma.userStory.findUnique({
    where: { id: story.id },
    include: { acceptanceCriteria: true },
  });

  console.log(JSON.stringify({ projectId: project.id, story: updated }, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

