import { NextRequest } from 'next/server';
import * as IssuesRoute from '@/app/api/github/issues/route';
import * as TimelineRoute from '@/app/api/github/timeline/route';

jest.mock('@/app/api/github/lib/octokit', () => {
  const createMock = jest.fn();
  const updateMock = jest.fn();
  const pullsGet = jest.fn();
  const pullsListReviews = jest.fn();
  const combinedStatus = jest.fn();
  const issuesGet = jest.fn();
  return {
    getOctokit: () => ({
      issues: { create: createMock, update: updateMock, get: issuesGet },
      pulls: { get: pullsGet, listReviews: pullsListReviews },
      repos: { getCombinedStatusForRef: combinedStatus },
      __mocks: { createMock, updateMock, pullsGet, pullsListReviews, combinedStatus, issuesGet },
    }),
  };
});

function makeReq(url: string, method: string, body?: any) {
  const init: RequestInit = { method, headers: { 'content-type': 'application/json' } } as any;
  if (body !== undefined) (init as any).body = JSON.stringify(body);
  return new NextRequest(new Request(url, init) as any);
}

describe('US4-AC1: Octokit routes (issues + timeline)', () => {
  it('US4-AC1: creates a single issue and returns link', async () => {
    const { getOctokit } = require('@/app/api/github/lib/octokit');
    const oc = getOctokit();
    oc.issues.create.mockResolvedValueOnce({ data: { number: 123, html_url: 'https://github.com/org/repo/issues/123', state: 'open' } });
    const req = makeReq('http://local/api/github/issues', 'POST', {
      repo: 'org/repo',
      story: { id: 'cuid', storyNumber: 1, title: 'T', description: 'D' },
      acs: [{ n: 1, text: 'X' }],
      breakout: false,
    });
    const res = await (IssuesRoute as any).POST(req);
    const json = await (res as any).json();
    expect(json.ok).toBe(true);
    expect(json.created[0].number).toBe(123);
  });

  it('US4-AC1: handles rate limit gracefully with 429', async () => {
    const { getOctokit } = require('@/app/api/github/lib/octokit');
    const oc = getOctokit();
    const err: any = new Error('API rate limit exceeded');
    err.status = 403; err.details = 'API rate limit exceeded';
    oc.issues.create.mockRejectedValueOnce(err);
    const req = makeReq('http://local/api/github/issues', 'POST', {
      repo: 'org/repo',
      story: { id: 'cuid', storyNumber: 1, title: 'T', description: 'D' },
      acs: [],
      breakout: false,
    });
    const res = await (IssuesRoute as any).POST(req);
    expect((res as any).status).toBe(429);
    const json = await (res as any).json();
    expect(json.error).toBe('GITHUB_RATE_LIMIT');
  });
});

