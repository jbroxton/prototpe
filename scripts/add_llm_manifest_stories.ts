import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'LLM Engineering Co-Pilot' } });
  if (!project) throw new Error('Project not found');

  const last = await prisma.userStory.findFirst({ where: { projectId: project.id }, orderBy: { storyNumber: 'desc' } });
  let n = (last?.storyNumber || 0) + 1;

  const s1 = await prisma.userStory.create({
    data: {
      projectId: project.id,
      storyNumber: n++,
      title: 'Minimal Bootstrap Manifest Endpoint',
      description: 'Expose /api/internal-projects/manifest to describe routes, vocab, transitions, examples, and IDs.',
      status: 'In Review',
      priority: 'High',
      testLink: '/api/internal-projects/manifest',
    }
  });
  const s1acs = [
    'Returns routes: summary, project, stories, acs, projectLLM',
    'Vocab includes statuses [Not Started, In Progress, In Review, Completed] and priorities [Low, Medium, High]',
    'Transitions specify completedRequiresManagerToken=false and recommended flow',
    'ID patterns US{number}, AC{number}; testLink label shows basename',
    'Includes canonical examples for add/update story and AC'
  ];
  for (let i = 0; i < s1acs.length; i++) {
    await prisma.acceptanceCriteria.create({ data: { userStoryId: s1.id, criteriaNumber: i + 1, description: s1acs[i], status: 'In Review' } });
  }

  const s2 = await prisma.userStory.create({
    data: {
      projectId: project.id,
      storyNumber: n++,
      title: 'Process: No Manager Token Enforcement',
      description: 'Trust roles operationally; do not require API token for Completed.',
      status: 'In Progress',
      priority: 'Medium',
    }
  });
  const s2acs = [
    'APIs allow setting Completed without token',
    'Manifest transitions reflect no-token requirement',
    'Docs and examples omit X-Manager-Token'
  ];
  for (let i = 0; i < s2acs.length; i++) {
    await prisma.acceptanceCriteria.create({ data: { userStoryId: s2.id, criteriaNumber: i + 1, description: s2acs[i], status: 'Not Started' } });
  }

  const out = await prisma.project.findUnique({ where: { id: project.id }, include: { userStories: { include: { acceptanceCriteria: true }, orderBy: { storyNumber: 'asc' } } } });
  console.log(JSON.stringify(out, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

