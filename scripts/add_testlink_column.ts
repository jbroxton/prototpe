import { prisma } from '../app/lib/prisma.ts';

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "UserStory" ADD COLUMN IF NOT EXISTS "testLink" TEXT');
  console.log('Added testLink column (if not exists).');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
