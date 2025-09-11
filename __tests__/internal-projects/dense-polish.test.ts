import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const file = path.resolve(process.cwd(), 'app/internal-projects/[projectId]/unified/page.tsx');

function read() {
  return fs.readFileSync(file, 'utf8');
}

describe('Dense View Polish', () => {
  it('should display About section with project description', () => {
    const src = read();
    expect(src).toMatch(/About\<\/h2>/);
    expect(src).toMatch(/\{project\.about\}/);
  });

  it('should have Home button instead of Back link', () => {
    const src = read();
    expect(src).toContain('Home');
    expect(src).not.toContain('Back to Detail');
  });

  it('should not contain any emoji characters', () => {
    const src = read();
    // Basic emoji range check
    const emojiRegex = /[\u2190-\u27BF\uFE0F\uD83C-\uDBFF\uDC00-\uDFFF]/;
    expect(emojiRegex.test(src)).toBe(false);
  });

  it('should use shadcn Button components', () => {
    const src = read();
    expect(src).toContain("components/ui/button");
  });

  it('should have consistent table headers (6 columns)', () => {
    const src = read();
    // quick heuristic: header labels present in order
    expect(src).toContain('>#<');
    expect(src).toContain('Story / Acceptance Criteria');
    expect(src).toContain('>Status<');
    expect(src).toContain('>Test<');
    expect(src).toContain('>Priority<');
    expect(src).toContain('>Actions<');
  });
});

