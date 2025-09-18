const { describe, it, expect } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

const file = path.resolve(process.cwd(), 'app/internal-projects/[projectId]/unified/page.tsx');

function read() {
  return fs.readFileSync(file, 'utf8');
}

describe('About Editor Markdown Toggle', () => {
  it('includes CodeMirror integration for About', () => {
    const src = read();
    // dynamic import pattern for @uiw/react-codemirror
    expect(src).toMatch(/import\(\"@uiw\/react-codemirror\"\)/);
    // markdown language extension import
    expect(src).toMatch(/@codemirror\/lang-markdown/);
  });

  it('exposes Markdown/Preview toggle UI for About', () => {
    const src = read();
    expect(src).toContain('data-testid="about-mode-markdown"');
    expect(src).toContain('data-testid="about-mode-preview"');
  });

  it('wraps About content in a shadcn ScrollArea with constrained height', () => {
    const src = read();
    expect(src).toContain('components/ui/scroll-area');
    expect(src).toContain('data-testid="about-scroll"');
    // heuristic for max height utility
    expect(src).toContain('max-h-64');
  });

  it('initializes editor value from project.about', () => {
    const src = read();
    // ensure we still reference project.about for initial value
    expect(src).toMatch(/project\.about/);
  });

  it('renders Markdown preview using a converter', () => {
    const src = read();
    expect(src).toMatch(/markdown-it/);
    expect(src).toMatch(/md.render\(/);
  });
});
