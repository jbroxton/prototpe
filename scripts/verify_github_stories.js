const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const proj = await prisma.project.findFirst({
      where: { name: 'Lifecycle Editor MVP - Jira to GitHub Flow - Dense View' },
      include: {
        userStories: {
          include: { acceptanceCriteria: true },
          orderBy: { storyNumber: 'asc' }
        }
      }
    });
    console.log(JSON.stringify({
      ok: !!proj,
      id: proj && proj.id,
      name: proj && proj.name,
      storyCount: proj && proj.userStories && proj.userStories.length,
      stories: proj && proj.userStories && proj.userStories.map(s => ({ num: s.storyNumber, title: s.title, acs: s.acceptanceCriteria.length }))
    }, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

