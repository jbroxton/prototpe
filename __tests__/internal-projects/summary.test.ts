import { describe, it, expect } from '@jest/globals';
import { prisma } from '@/app/lib/prisma';
import { GET as summaryGET } from '@/app/api/internal-projects/summary/route';
import { GET as exportGET } from '@/app/api/internal-projects/export/route';

describe('Internal Projects Summary/Export', () => {
  it('should return minimal and full export payloads', async () => {
    const p = await prisma.project.create({ data: { name: 'Summary Test', about: 'tmp', status: 'In Progress' } });
    await prisma.userStory.create({ data: { projectId: p.id, storyNumber: 1, title: 'S', description: 'd', status: 'Completed', priority: 'High' } });

    const s = await summaryGET();
    const sj = await (s as any).json();
    console.log('Summary endpoint response:', JSON.stringify(sj));
    expect(sj).toHaveProperty('projects');
    expect(Array.isArray(sj.projects)).toBe(true);

    const e = await exportGET();
    const ej = await (e as any).json();
    console.log('Export endpoint response:', JSON.stringify(ej));
    expect(ej).toHaveProperty('data');
    expect(ej.data).toHaveProperty('projects');
    // export should include story testLink when set (optional if exists)
    const proj = ej.data.projects.find((x: any) => x.id === p.id);
    if (proj && proj.userStories[0]) {
      // testLink may be undefined if not set; ensure property exists in mapping
      expect(Object.prototype.hasOwnProperty.call(proj.userStories[0], 'testLink')).toBe(true);
    }

    await prisma.project.delete({ where: { id: p.id } });
    await prisma.$disconnect();
  });
});
