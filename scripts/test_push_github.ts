import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import * as IssuesRoute from '../app/api/github/issues/route.ts';

async function main() {
  const prisma = new PrismaClient();
  try {
    // Load project and first seeded story
    const projectName = 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View';
    const proj = await prisma.project.findFirst({
      where: { name: projectName },
      include: { userStories: { include: { acceptanceCriteria: true }, orderBy: { storyNumber: 'asc' } } }
    });
    if (!proj || !proj.userStories?.length) throw new Error('Project or stories not found');
    const story = proj.userStories[0]!; // US1
    const acs = story.acceptanceCriteria.map((c) => ({ n: c.criteriaNumber, text: c.description }));

    const owner = process.env.GH_ORG || '';
    const repo = process.env.GH_REPO || '';
    const repoFull = `${owner}/${repo}`;
    if (!owner || !repo) throw new Error('Missing GH_ORG/GH_REPO');

    const payload = {
      repo: repoFull,
      breakout: false,
      projectId: proj.id,
      story: { id: story.id, storyNumber: story.storyNumber, title: story.title, description: story.description },
      acs,
    };

    const req = new NextRequest(new Request('http://local/api/github/issues', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }) as any);

    const res = await (IssuesRoute as any).POST(req);
    const json = await (res as any).json();
    console.log(JSON.stringify(json, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

