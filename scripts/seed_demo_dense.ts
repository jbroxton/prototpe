import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const name = `UI Polish Demo ${Date.now()}`;
  const project = await prisma.project.create({
    data: { name, about: 'Demo dataset for Dense View', status: 'In Progress' },
  });

  for (let i = 1; i <= 5; i++) {
    const story = await prisma.userStory.create({
      data: {
        projectId: project.id,
        storyNumber: i,
        title: `User Story ${i}: Clean UI interactions`,
        description: 'As a user, I want a clear, readable dense view.',
        status: i % 3 === 0 ? 'Completed' : i % 2 === 0 ? 'In Progress' : 'Not Started',
        priority: i % 2 === 0 ? 'High' : 'Medium',
        testLink: i % 2 === 0 ? 'https://example.com/test' : null,
      },
    });
    for (let j = 1; j <= 3; j++) {
      await prisma.acceptanceCriteria.create({
        data: {
          userStoryId: story.id,
          criteriaNumber: j,
          description: `AC${j}: Given..., When..., Then... (#${i}.${j})`,
          status: j === 3 ? 'Completed' : j === 2 ? 'In Progress' : 'Not Started',
        },
      });
    }
  }

  console.log('Seeded project:', project.id, name);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

