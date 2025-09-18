const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const repo = process.argv[2];
    if (!repo) { console.error('Usage: node scripts/verify_links_repo.js <owner/repo>'); process.exit(2); }
    const links = await prisma.link.findMany({ where: { sourceType: 'story', sourceId: 'US1', repo }, orderBy: { createdAt: 'desc' } });
    console.log(JSON.stringify(links, null, 2));
  } catch (e) {
    console.error(e); process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

