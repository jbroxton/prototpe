import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const fp = path.resolve(process.cwd(), 'app/internal-projects/[projectId]/unified/page.tsx');
const src = fs.readFileSync(fp, 'utf8');

describe('US3: shadcn standardization', () => {
  it('imports shadcn Select and Input', () => {
    expect(src).toContain("components/ui/select");
    expect(src).toContain("components/ui/input");
  });

  it('uses Select for filters and editors', () => {
    const selectCount = (src.match(/<Select/g) || []).length;
    expect(selectCount).toBeGreaterThanOrEqual(3);
  });

  it('uses Input for inline text edits', () => {
    // Presence check for Input wrapper usage
    expect(src).toMatch(/<Input[\s>]/);
  });
});
