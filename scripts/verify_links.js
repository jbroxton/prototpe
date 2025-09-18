const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const links = await prisma.link.findMany({ where: { sourceType: 'story', sourceId: 'US1' }, orderBy: { createdAt: 'desc' } });
    console.log(JSON.stringify(links, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

