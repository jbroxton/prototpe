import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@/app/lib/prisma';

async function columnExists(schema: string, table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
    schema,
    table,
    column,
  );
  return Array.isArray(rows) && rows.length > 0;
}

describe('Migration: AcceptanceCriteria.testLink (TDD - expected to fail initially)', () => {
  beforeAll(async () => { await prisma.$connect(); });
  afterAll(async () => { await prisma.$disconnect(); });

  it('adds nullable text column testLink to AcceptanceCriteria (up)', async () => {
    // Expectation: after migration up, column exists
    const exists = await columnExists('public', 'AcceptanceCriteria', 'testLink');
    expect(exists).toBe(true);
  });

  it('provides a rollback path to drop testLink (down)', async () => {
    // This is a TDD placeholder. Implement by executing DROP COLUMN and verifying absence,
    // then re-adding. It must not rely on hacks or JSON fields.
    // Fails until implemented.
    expect(false).toBe(true);
  });
});

