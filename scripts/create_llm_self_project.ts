import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const name = 'LLM Engineering Co-Pilot';
  const about = 'High‑impact improvements to optimize LLM productivity and reliability inside Internal Projects.';

  const project = await prisma.project.create({
    data: { name, about, status: 'In Progress' },
  });

  type Def = { title: string; description: string; status: string; priority: 'High'|'Medium'|'Low'; ac: string[] };
  const stories: Def[] = [
    {
      title: 'Project Minimal LLM Endpoint',
      description: 'Expose normalized, minimal JSON for a single project to reduce tokens and ambiguity.',
      status: 'In Progress',
      priority: 'High',
      ac: [
        'GET /api/internal-projects/{id}/llm returns id,name,status,storyCount,completedCount',
        'Payload includes stories with US#, title, status, priority, testLink and ACs with AC#, description, status',
        'Error responses: 400 invalid id, 404 not found with specific messages',
      ],
    },
    {
      title: 'Add data-llm attributes to Dense View',
      description: 'Instrument table cells with stable data attributes for deterministic parsing.',
      status: 'Not Started',
      priority: 'High',
      ac: [
        'Each story row tds have data-llm-col values: id,title,status,test,priority,actions',
        'Each story/AC row has data-llm-id values like US1 and AC2',
        'No decorative element contains data-llm-* attributes',
      ],
    },
    {
      title: 'Standardize Inputs with shadcn wrappers',
      description: 'Replace native selects/inputs with shadcn-based components across filters and inline editors.',
      status: 'Not Started',
      priority: 'High',
      ac: [
        'Status and Priority inline editors use shadcn Select',
        'Top filter controls use shadcn Select',
        'Inputs show consistent focus rings and sizes',
      ],
    },
    {
      title: 'Sticky Header + Zebra + Width Consistency',
      description: 'Improve scanning on large tables with sticky header, zebra story rows, and col width locks.',
      status: 'Not Started',
      priority: 'Medium',
      ac: [
        'Header sticks on scroll without column misalignment',
        'Zebra background applied to story rows only',
        'Column widths locked via colgroup or CSS grid utilities',
      ],
    },
    {
      title: 'Keyboard Shortcuts for Speed',
      description: 'Add shortcuts to accelerate common operations.',
      status: 'Not Started',
      priority: 'Medium',
      ac: [
        'N adds a new story; A adds AC to focused story',
        'Enter saves inline edit; Escape cancels',
        '/ focuses quick search input',
      ],
    },
    {
      title: 'Batch Update API',
      description: 'Support atomic batch updates for stories and ACs.',
      status: 'Not Started',
      priority: 'High',
      ac: [
        'POST /api/internal-projects/batch applies multiple updates transactionally',
        'Response returns summary and updated entities',
        'Validation errors grouped by item with indices and fields',
      ],
    },
    {
      title: 'Copy JSON + JSON Schema',
      description: 'Enable quick copy of minimal JSON and provide schema for validation.',
      status: 'Not Started',
      priority: 'Low',
      ac: [
        'UI Copy button copies minimal JSON and shows success toast',
        'GET /api/internal-projects/{id}/schema returns JSON Schema',
        'Client-side validation errors rendered with clear messages',
      ],
    },
  ];

  let storyNumber = 1;
  for (const s of stories) {
    const story = await prisma.userStory.create({
      data: {
        projectId: project.id,
        storyNumber: storyNumber++,
        title: s.title,
        description: s.description,
        status: s.status,
        priority: s.priority,
      },
    });
    let criteriaNumber = 1;
    for (const desc of s.ac) {
      await prisma.acceptanceCriteria.create({
        data: {
          userStoryId: story.id,
          criteriaNumber: criteriaNumber++,
          description: desc,
          status: 'Not Started',
        },
      });
    }
  }

  const result = await prisma.project.findUnique({
    where: { id: project.id },
    include: { userStories: { include: { acceptanceCriteria: true }, orderBy: { storyNumber: 'asc' } } },
  });

  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

