import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View' } });
  if (!project) throw new Error('Project not found');

  const us4 = await prisma.userStory.findFirst({ where: { projectId: project.id, storyNumber: 4 } });
  if (!us4) throw new Error('US4 not found');
  const acs = await prisma.acceptanceCriteria.findMany({ where: { userStoryId: us4.id }, orderBy: { criteriaNumber: 'asc' } });
  const testPaths = [
    'tests/speqqid/US4_AC1.octokit-refactor.test.ts',
    'tests/speqqid/US4_AC2.speqqid-userstory-format.test.ts',
    'tests/speqqid/US4_AC3.speqqid-ac-format.test.ts',
    'tests/speqqid/US4_AC4.backfill-order.test.ts',
  ];
  for (const ac of acs) {
    const idx = ac.criteriaNumber - 1;
    const marker = ` [Test: ${testPaths[idx] || 'TBD'}]`;
    if (!ac.description.includes('[Test:')) {
      await prisma.acceptanceCriteria.update({ where: { id: ac.id }, data: { description: `${ac.description}${marker}` } });
    }
  }
  console.log('Added per-AC test links for US4');
}

main().then(()=>prisma.$disconnect()).catch(async e=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });

