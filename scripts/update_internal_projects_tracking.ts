import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const projectName = 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View';
  const repo = 'jbroxton/speqq-lifecycle-test';
  const prNumber = 6; // PR-1 (Octokit refactor) as per current flow
  const prUrl = `https://github.com/${repo}/pull/${prNumber}`;

  const project = await prisma.project.findFirst({ where: { name: projectName } });
  if (!project) throw new Error('Project not found');

  // US4
  const us4 = await prisma.userStory.findFirst({ where: { projectId: project.id, storyNumber: 4 } });
  if (!us4) throw new Error('US4 not found');

  // Update story test link to PR URL for quick visibility in UI
  await prisma.userStory.update({ where: { id: us4.id }, data: { testLink: prUrl, status: 'In Progress' } });

  // Mark AC1 as Completed (PR merged), others remain In Progress
  const acs = await prisma.acceptanceCriteria.findMany({ where: { userStoryId: us4.id } });
  for (const ac of acs) {
    const desired = ac.criteriaNumber === 1 ? 'Completed' : 'In Progress';
    if (ac.status !== desired) {
      await prisma.acceptanceCriteria.update({ where: { id: ac.id }, data: { status: desired } });
    }
  }

  // Persist Link for AC1 -> PR #6 so the tool tracks PR linkage at AC granularity
  const ac1 = acs.find(a => a.criteriaNumber === 1);
  if (ac1) {
    const existing = await prisma.link.findFirst({ where: { sourceType: 'ac', sourceId: `AC${ac1.criteriaNumber}`, repo, prNumber } });
    if (!existing) await prisma.link.create({ data: { sourceType: 'ac', sourceId: `AC${ac1.criteriaNumber}`, repo, prNumber, sha: '' } });
  }

  console.log('Updated Internal Projects tracking:', { projectId: project.id, us4: us4.id, pr: prUrl });
}

main().then(()=>prisma.$disconnect()).catch(async e=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });

