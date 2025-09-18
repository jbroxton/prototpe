import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const name = 'Shared Data Table (TanStack + shadcn)';
  const about = `# Objective\n\nCreate a shared, reusable DataTable component built on TanStack Table and shadcn UI to replace bespoke tables across the app.\n\n# Introduction\n\nAdopt a headless table (TanStack) with shadcn styling for consistent UX, easier feature evolution (sorting, filtering, pagination, virtualization), and reduced code duplication.\n\n# Current State\n\nMultiple pages render raw HTML tables with ad-hoc sorting/filtering and inconsistent UI. No shared component or test surface.\n\n# Users\n\nEngineers, PMs, and managers who navigate and manage projects and stories need consistent interactions (sorting, filters, keyboard nav) and a clean, accessible table.\n\n# Solution\n\nIntroduce a shared DataTable built on TanStack + shadcn. Migrate Internal Projects first (pilot), then roll out to story tables and Launch. Ensure TDD and clear ACs.`;

  const project = await prisma.project.create({ data: { name, about, status: 'Not Started' } });

  const stories: Array<{ title: string; description: string; priority: 'High'|'Medium'|'Low'; ac: string[] }> = [
    {
      title: 'Implement shared DataTable component',
      description: 'Create components/ui/data-table.tsx using TanStack + shadcn with typed columns and cells.',
      priority: 'High',
      ac: [
        'DataTable renders columns and rows using TanStack flexRender',
        'Empty state renders when no rows',
        'Works with shadcn Buttons/Badges in cells',
      ],
    },
    {
      title: 'Migrate Internal Projects table to DataTable',
      description: 'Replace static table with shared component preserving filters and actions.',
      priority: 'High',
      ac: [
        'Default sort by Updated desc maintained',
        'Status column uses shadcn Badge',
        'Actions column links to project view',
      ],
    },
    {
      title: 'Manager Review (Stages 3-4)',
      description: 'Submit Overview for Engineering Manager review and approval as per process.',
      priority: 'Medium',
      ac: [
        'Overview includes Objective, Introduction, Current State, Users, Solution',
        'EM provides decision and updates About in MCP if approved',
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
        status: 'Not Started',
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

