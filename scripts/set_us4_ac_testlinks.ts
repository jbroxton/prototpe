import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View' } });
  if (!project) throw new Error('Project not found');
  const us4 = await prisma.userStory.findFirst({ where: { projectId: project.id, storyNumber: 4 } });
  if (!us4) throw new Error('US4 not found');
  const acs = await prisma.acceptanceCriteria.findMany({ where: { userStoryId: us4.id }, orderBy: { criteriaNumber: 'asc' } });

  const base = 'https://github.com/jbroxton/prototpe/blob/main/tests/speqqid';
  const links: Record<number, string> = {
    1: `${base}/US4_AC1.octokit-refactor.test.ts`,
    2: `${base}/US4_AC2.speqqid-userstory-format.test.ts`,
    3: `${base}/US4_AC3.speqqid-ac-format.test.ts`,
    4: `${base}/US4_AC4.backfill-order.test.ts`,
  };
  for (const ac of acs) {
    const link = links[ac.criteriaNumber];
    if (!link) continue;
    await prisma.acceptanceCriteria.update({ where: { id: ac.id }, data: { testLink: link } });
  }
  console.log('US4 AC test links set.');
}

main().then(()=>prisma.$disconnect()).catch(async e=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });

