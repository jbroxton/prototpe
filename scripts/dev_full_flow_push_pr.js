require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function gh(path, init = {}) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error('MISSING_ENV:GITHUB_TOKEN');
  const base = 'https://api.github.com';
  const headers = Object.assign({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }, init.headers || {});
  const res = await fetch(base + path, Object.assign({}, init, { headers }));
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${init.method || 'GET'} ${path} -> ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const owner = process.env.GH_ORG;
    const repo = process.env.GH_REPO;
    if (!owner || !repo) throw new Error('Missing GH_ORG/GH_REPO');
    const repoFull = `${owner}/${repo}`;

    // Use US1 / Issue #5 from earlier steps
    const storyId = 'US1';
    const issueNumber = 5;

    // 1) Get default branch
    const repoInfo = await gh(`/repos/${owner}/${repo}`);
    const baseBranch = repoInfo.default_branch || 'main';
    const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(baseBranch)}`);
    const baseSha = ref.object.sha;

    // 2) Create a branch
    const branchName = `us-1-issue-${issueNumber}-preview`;
    await gh(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha })
    });

    // 3) Add a simple code change
    const path = 'src/github/issuePreview.ts';
    const fileSource = [
      'export type PreviewItem = { title: string; labels: string[]; body: string };',
      'export function formatGitHubIssuePreview(story: { storyNumber: number; title: string; description?: string }, acs: Array<{ n: number; text: string }>, breakout = false): { items: PreviewItem[] } {',
      "  const baseLabels = Array.from(new Set(['speqq', `US_${story.storyNumber}`]));",
      "  const lines = [String(story.description || '').trim(), '', '### Acceptance Criteria', ...acs.map(a => `- [ ] AC_${a.n}: ${a.text}`)];",
      "  const parent: PreviewItem = { title: `US_${story.storyNumber}: ${story.title}`, labels: baseLabels, body: lines.join('\\n') };",
      "  if (!breakout) return { items: [parent] };",
      "  const children: PreviewItem[] = acs.map(a => ({ title: `AC_${a.n}: ${a.text.slice(0, 80)}`, labels: Array.from(new Set([...baseLabels, `AC_${a.n}`])), body: `- [ ] AC_${a.n}: ${a.text}` }));",
      '  return { items: [parent, ...children] };',
      '}',
    ].join('\n');
    const content = Buffer.from(fileSource).toString('base64');
    await gh(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      body: JSON.stringify({ message: 'feat(us-1): add issue preview util (Closes #' + issueNumber + ')', content, branch: branchName })
    });

    // 4) Open PR referencing the Issue
    const pr = await gh(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title: `US_1: Add formatGitHubIssuePreview util`,
        head: branchName,
        base: baseBranch,
        body: `Closes #${issueNumber}\n\nImplements preview structure per AC.`,
      })
    });

    // 5) Persist Link + GithubPr rows for lifecycle visibility
    const prNumber = pr.number;
    const prUrl = pr.html_url;
    const headSha = pr.head && pr.head.sha || '';
    // Link: story -> PR
    const linkExists = await prisma.link.findFirst({ where: { sourceType: 'story', sourceId: storyId, repo: repoFull, prNumber } });
    if (!linkExists) await prisma.link.create({ data: { sourceType: 'story', sourceId: storyId, repo: repoFull, prNumber, sha: headSha } });
    // GithubPr row
    const prRow = await prisma.githubPr.findFirst({ where: { repo: repoFull, prNumber } });
    if (prRow) await prisma.githubPr.update({ where: { id: prRow.id }, data: { headSha, status: 'open', url: prUrl } });
    else await prisma.githubPr.create({ data: { repo: repoFull, prNumber, url: prUrl, headSha, status: 'open' } });

    console.log(JSON.stringify({ ok: true, branch: branchName, pr: { number: prNumber, url: prUrl } }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
