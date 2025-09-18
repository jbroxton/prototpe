import { prisma } from '../app/lib/prisma.ts';

async function ensureProjectByName(name: string, about: string) {
  let p = await prisma.project.findFirst({ where: { name } });
  if (!p) {
    p = await prisma.project.create({ data: { name, about, status: 'In Progress' } });
  }
  return p;
}

async function nextStoryNumber(projectId: string) {
  const last = await prisma.userStory.findFirst({ where: { projectId }, orderBy: { storyNumber: 'desc' } });
  return last ? last.storyNumber + 1 : 1;
}

async function addStory(projectId: string, title: string, description: string, acs: string[], testLink?: string) {
  const storyNumber = await nextStoryNumber(projectId);
  const story = await prisma.userStory.create({ data: { projectId, storyNumber, title, description, status: 'Not Started', priority: 'High', testLink: testLink || null } });
  for (let i = 0; i < acs.length; i++) {
    await prisma.acceptanceCriteria.create({ data: { userStoryId: story.id, criteriaNumber: i + 1, description: acs[i], status: 'Not Started' } });
  }
  return story;
}

async function main() {
  const name = 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View';
  const about = 'End-to-end lifecycle with Jira + GitHub. Drawer-driven UI and clear grouping.';
  const p = await ensureProjectByName(name, about);

  // US: GitHub Issue Creation from Requirements
  await addStory(
    p.id,
    'GitHub Issue Creation from Requirements',
    'As a PM, I need to turn a User Story and its ACs into a single, clear GitHub issue so devs can start work.',
    [
      'AC1: One User Story creates one GitHub Issue with ACs as task list items',
      'AC2: Preview shows exact issue structure before creation with title, body, and labels',
      'AC3: Created issues persist in Link table and display as chips in drawer',
    ],
    'https://example.com/tests/github-issue-default'
  );

  // US: Breakout Mode for Complex Features
  await addStory(
    p.id,
    'Breakout Mode for Complex Features',
    'As a PM, I can break complex work into per-AC GitHub issues while keeping a single parent for tracking.',
    [
      'AC1: Toggle option to create separate issues for each AC',
      'AC2: Parent issue automatically references child issues in task list',
      'AC3: All issue relationships properly tracked in Link table',
    ],
    'https://example.com/tests/github-breakout'
  );

  // US: GitHub Integration UI in Drawer
  await addStory(
    p.id,
    'GitHub Integration UI in Drawer',
    'As a PM, I can preview and push to GitHub from the story drawer with durable settings.',
    [
      'AC1: GitHub tab shows "Push to GitHub" button with preview flow',
      'AC2: Display created issues with state (Open/Closed) as chips',
      'AC3: Settings persist repo selection and grouping preference per user',
    ],
    'https://example.com/tests/github-drawer-ui'
  );

  console.log('Added GitHub US + ACs to project:', p.id);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

