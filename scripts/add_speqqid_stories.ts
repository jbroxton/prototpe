import { prisma } from '../app/lib/prisma.ts';

type StoryDef = { title: string; description: string; acs: string[] };

const PROJECT_NAME = 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View';

const STORIES: StoryDef[] = [
  {
    title: 'SpeqqID Data Model',
    description: 'Add universal SpeqqID (SPQ-###) for User Stories and ACs with a global counter allocator.',
    acs: [
      'AC1: Add global SpeqqIdCounter table with auto-incrementing counter',
      'AC2: Add speqqId field to UserStory table with format validation (SPQ-###)',
      'AC3: Add speqqId field to AcceptanceCriteria table with format validation (SPQ-###-AC#)',
      'AC4: Backfill all existing stories with sequential SpeqqIDs in creation order',
    ],
  },
  {
    title: 'SpeqqID UI Integration',
    description: 'Replace legacy US# with SpeqqID across Internal Projects and Timeline; provide copy helpers.',
    acs: [
      'AC1: Replace all visible US# references with SpeqqID in Internal Projects views',
      'AC2: Add "Copy SpeqqID" button to story rows and drawer',
      'AC3: Display SpeqqID format (SPQ-###) in timeline grouping',
      'AC4: Hide legacy US# from UI but maintain parsing for compatibility',
    ],
  },
  {
    title: 'SpeqqID GitHub Integration',
    description: 'Include SpeqqID in Issue/PR titles/labels and branch names; parse SpeqqID for grouping.',
    acs: [
      'AC1: Include SpeqqID in GitHub issue titles when pushing (SPQ-###: Title)',
      'AC2: Add SpeqqID labels to created GitHub issues',
      'AC3: Generate branch names with SpeqqID format (spq-###-slug)',
      'AC4: Parse SpeqqIDs from PR titles/branches for timeline grouping',
    ],
  },
  {
    title: 'Timeline SpeqqID Grouping',
    description: 'Group Issue → Branch → PR → Merge under SpeqqID, including related/shared cases.',
    acs: [
      'AC1: Group timeline events by SpeqqID to show clear issue→branch→PR→merge chain',
      'AC2: Display SpeqqID prominently in timeline headers',
      'AC3: Show related PRs/branches under their parent SpeqqID',
      'AC4: Handle edge cases (multiple PRs per story, shared PRs)',
    ],
  },
];

async function ensureProject() {
  const p = await prisma.project.findFirst({ where: { name: PROJECT_NAME } });
  if (!p) throw new Error('Project not found: ' + PROJECT_NAME);
  return p;
}

async function nextStoryNumber(projectId: string) {
  const last = await prisma.userStory.findFirst({ where: { projectId }, orderBy: { storyNumber: 'desc' } });
  return last ? last.storyNumber + 1 : 1;
}

async function main() {
  const project = await ensureProject();
  const created: Array<{ id: string; storyNumber: number; title: string }> = [];
  for (const def of STORIES) {
    const storyNumber = await nextStoryNumber(project.id);
    const story = await prisma.userStory.create({
      data: {
        projectId: project.id,
        storyNumber,
        title: def.title,
        description: def.description,
        status: 'In Review',
        priority: 'High',
      },
    });
    for (let i = 0; i < def.acs.length; i++) {
      await prisma.acceptanceCriteria.create({
        data: {
          userStoryId: story.id,
          criteriaNumber: i + 1,
          description: def.acs[i],
          status: 'In Review',
        },
      });
    }
    created.push({ id: story.id, storyNumber, title: def.title });
  }
  console.log('Created SpeqqID stories:', created.map(s => `US${s.storyNumber}:${s.title}`).join(', '));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

