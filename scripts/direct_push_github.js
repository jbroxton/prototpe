require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) throw new Error('MISSING_ENV:GITHUB_TOKEN');
    const owner = process.env.GH_ORG;
    const repo = process.env.GH_REPO;
    if (!owner || !repo) throw new Error('Missing GH_ORG/GH_REPO');

    // Load first seeded story (US1)
    const proj = await prisma.project.findFirst({
      where: { name: 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View' },
      include: { userStories: { include: { acceptanceCriteria: true }, orderBy: { storyNumber: 'asc' } } }
    });
    if (!proj || !proj.userStories?.length) throw new Error('Project or stories not found');
    const story = proj.userStories[0];
    const title = `US_${story.storyNumber}: ${story.title}`;
    const body = [
      (story.description || '').trim(),
      '',
      '### Acceptance Criteria',
      ...story.acceptanceCriteria.map(c => `- [ ] AC_${c.criteriaNumber}: ${c.description}`),
    ].join('\n');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body, labels: ['speqq', `US_${story.storyNumber}`] }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub create failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    const number = json.number;
    // Persist Link (story → issue)
    const sourceId = `US${story.storyNumber}`;
    const repoFull = `${owner}/${repo}`;
    const exists = await prisma.link.findFirst({ where: { sourceType: 'story', sourceId, repo: repoFull, prNumber: number } });
    if (!exists) await prisma.link.create({ data: { sourceType: 'story', sourceId, repo: repoFull, prNumber: number, sha: '' } });

    console.log(JSON.stringify({ ok: true, issue: { repo: repoFull, number, url: json.html_url } }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

