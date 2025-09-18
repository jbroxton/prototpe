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
    const owner = process.env.GH_ORG; const repo = process.env.GH_REPO;
    if (!owner || !repo) throw new Error('Missing GH_ORG/GH_REPO');
    const repoFull = `${owner}/${repo}`;
    // We will merge PR #6 created earlier
    const prNumber = Number(process.argv[2] || '6');
    const pr = await gh(`/repos/${owner}/${repo}/pulls/${prNumber}`);
    const sha = pr.head && pr.head.sha || '';
    await gh(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, { method: 'PUT', body: JSON.stringify({ merge_method: 'merge', commit_title: pr.title, commit_message: 'Auto-merge via Speqq test flow' }) });
    const existing = await prisma.githubPr.findFirst({ where: { repo: repoFull, prNumber } });
    if (existing) {
      await prisma.githubPr.update({ where: { id: existing.id }, data: { status: 'merged', mergedAt: new Date(), headSha: sha } });
    } else {
      await prisma.githubPr.create({ data: { repo: repoFull, prNumber, url: pr.html_url, headSha: sha, status: 'merged', mergedAt: new Date() } });
    }
    console.log(JSON.stringify({ ok: true, merged: prNumber, url: pr.html_url }, null, 2));
  } finally { await prisma.$disconnect(); }
}

main().catch((e)=>{ console.error(e); process.exit(1); });
