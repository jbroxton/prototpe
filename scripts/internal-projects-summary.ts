import { prisma } from '../app/lib/prisma.ts';
import { GET as summaryGET } from '../app/api/internal-projects/summary/route.ts';
import { GET as exportGET } from '../app/api/internal-projects/export/route.ts';

async function main() {
  const p = await prisma.project.create({
    data: { name: 'LLM Test Proj', about: 'tmp', status: 'In Progress' },
  });
  await prisma.userStory.create({
    data: {
      projectId: p.id,
      storyNumber: 1,
      title: 'S1',
      description: 'd',
      status: 'Completed',
      priority: 'High',
    },
  });

  const s = await summaryGET();
  const sj = await (s as any).json();
  console.log('SUMMARY:', JSON.stringify(sj, null, 2));

  const e = await exportGET();
  const ej = await (e as any).json();
  console.log('EXPORT:', JSON.stringify(ej, null, 2));

  await prisma.project.delete({ where: { id: p.id } });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
