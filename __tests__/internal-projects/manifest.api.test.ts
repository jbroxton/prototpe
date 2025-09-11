import { describe, it, expect } from '@jest/globals';
import { GET as manifestGET } from '@/app/api/internal-projects/manifest/route';

describe('Manifest Endpoint', () => {
  it('returns routes, vocab, transitions, idPatterns, examples, headers', async () => {
    const r = await manifestGET();
    const j = await (r as any).json();
    expect(j.success).toBe(true);
    const d = j.data;
    expect(d.routes).toBeDefined();
    expect(d.routes.summary).toContain('/api/internal-projects/summary');
    expect(d.vocab.statuses).toContain('In Review');
    expect(d.transitions.completedRequiresManagerToken).toBe(false);
    expect(d.idPatterns.storyId).toBe('US{number}');
    expect(d.examples).toBeDefined();
  });
});

