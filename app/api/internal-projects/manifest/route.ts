import { NextResponse } from 'next/server';

// GET /api/internal-projects/manifest
// Minimal bootstrap endpoint for LLMs to discover usage programmatically
export async function GET() {
  const routes = {
    summary: '/api/internal-projects/summary',
    project: '/api/internal-projects?projectId={projectId}',
    stories: '/api/internal-projects/stories',
    acs: '/api/internal-projects/stories',
    projectLLM: '/api/internal-projects/{projectId}/llm',
  } as const;

  const vocab = {
    statuses: ['Not Started', 'In Progress', 'In Review', 'Completed'],
    priorities: ['Low', 'Medium', 'High'],
  } as const;

  const transitions = {
    // By policy, an engineer sets In Review; manager may set Completed.
    // No token is enforced at API level; teams follow process conventions.
    completedRequiresManagerToken: false,
    recommendedFlow: ['Not Started', 'In Progress', 'In Review', 'Completed'],
  } as const;

  const idPatterns = {
    storyId: 'US{number}',
    acId: 'AC{number}',
    testLink: 'Path or URL; UI displays basename (e.g., "llm", "unified")',
  } as const;

  const examples = {
    findProject: {
      method: 'GET', url: routes.summary,
      responseShape: '{ success, projects: [{ id, name, status, storyCount, completedCount }] }'
    },
    getProject: {
      method: 'GET', url: routes.project.replace('{projectId}', 'PROJECT_ID'),
    },
    addStory: {
      method: 'POST', url: routes.stories,
      body: { projectId: 'PROJECT_ID', action: 'add', story: { title: '...', description: '...', status: 'Not Started', priority: 'Medium' } },
    },
    updateStory: {
      method: 'POST', url: routes.stories,
      body: { projectId: 'PROJECT_ID', action: 'update', story: { id: 'US1', status: 'In Review', testLink: '/api/internal-projects/PROJECT_ID/llm' } },
    },
    addAC: {
      method: 'PUT', url: routes.acs,
      body: { projectId: 'PROJECT_ID', storyId: 'US1', action: 'add', acceptanceCriteria: { description: 'Given..., When..., Then...', status: 'Not Started' } },
    },
    updateAC: {
      method: 'PUT', url: routes.acs,
      body: { projectId: 'PROJECT_ID', storyId: 'US1', action: 'update', acceptanceCriteria: { id: 'AC1', status: 'In Review' } },
    },
  } as const;

  const headers = {
    managerHeader: null,
    env: null,
    note: 'No manager token enforcement at API level; follow team conventions (Engineer → In Review; Manager → Completed).'
  } as const;

  return NextResponse.json({ success: true, data: { routes, vocab, transitions, idPatterns, examples, headers } });
}

