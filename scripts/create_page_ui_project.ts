import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const name = 'Page UI';

  const project = await prisma.project.create({
    data: { name, about: 'Polish dense view and overall UI for internal projects', status: 'In Progress' },
  });

  const stories = [
    {
      title: 'Replace native selects with shadcn Select',
      description: 'Adopt consistent Select components for filters and inline editors',
      status: 'In Progress',
      priority: 'High',
      ac: [
        'Status editor uses shadcn Select with proper focus ring',
        'Priority editor uses shadcn Select with consistent menu',
        'Filters at top use shadcn Select components',
      ],
    },
    {
      title: 'Add sticky table header and zebra rows',
      description: 'Improve scanability with sticky header, consistent column widths, and subtle zebra rows',
      status: 'Not Started',
      priority: 'Medium',
      ac: [
        'Header row sticks on scroll and retains column alignment',
        'Zebra background for alternating story rows (not AC rows)',
        'Column widths consistent across stories and ACs',
      ],
    },
    {
      title: 'Add global keyboard shortcuts',
      description: 'Speed up editing with keyboard actions',
      status: 'Not Started',
      priority: 'Medium',
      ac: [
        'Enter commits inline edit; Escape cancels',
        'Key N adds a new Story; Key A adds AC for focused story',
        'Slash (/) focuses a quick search input',
      ],
    },
    {
      title: 'Inline validation tooltips and toasts',
      description: 'Communicate validation failures and successes unobtrusively',
      status: 'Not Started',
      priority: 'Low',
      ac: [
        'Invalid Test link URL shows tooltip and prevents save',
        'Save success shows a brief toast; error shows a red toast',
        'All API validation errors are surfaced with specific messaging',
      ],
    },
    {
      title: 'Quick filters + saved expansion state',
      description: 'Make browsing long lists faster',
      status: 'Not Started',
      priority: 'Low',
      ac: [
        'Toggle to show only changed items in current session',
        'Remember expanded stories in localStorage and restore on load',
        'Add quick search input that filters story titles and AC descriptions',
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
          status: criteriaNumber === 2 ? 'In Progress' : 'Not Started',
        },
      });
    }
  }

  const out = await prisma.project.findUnique({
    where: { id: project.id },
    include: { userStories: { include: { acceptanceCriteria: true }, orderBy: { storyNumber: 'asc' } } },
  });

  console.log(JSON.stringify(out, null, 2));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

