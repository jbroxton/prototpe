import { Octokit } from '@octokit/rest';

export function getOctokit() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    const err: any = new Error('Missing GitHub token');
    err.code = 'MISSING_ENV:GITHUB_TOKEN';
    throw err;
  }
  return new Octokit({ auth: token });
}

