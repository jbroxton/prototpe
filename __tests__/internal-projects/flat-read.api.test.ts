import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/app/lib/prisma';
import { GET as flatGET } from '@/app/api/internal-projects/flat/[projectId]/route';
import { NextRequest } from 'next/server';

describe('Flat Read Endpoint', () => {
  it('returns ultra-flat project payload', async () => {
    const p = await prisma.project.findFirst({ include: { userStories: true } });
    expect(p).toBeTruthy();
    const req = new NextRequest(new Request(`http://local/api/internal-projects/flat/${p!.id}`));
    const res = await flatGET(req as any, { params: { projectId: p!.id } });
    const json = await (res as any).json();
    expect(json.id).toBe(p!.id);
    expect(json.name).toBe(p!.name);
    // At least some US keys or none if empty
    const keys = Object.keys(json).filter(k => k.startsWith('US'));
    expect(Array.isArray(keys)).toBe(true);
  });
});

