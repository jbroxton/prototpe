import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const file = path.resolve(process.cwd(), 'app/internal-projects/[projectId]/unified/page.tsx');
const src = fs.readFileSync(file, 'utf8');

describe('US2: Data-LLM Attributes', () => {
  it('AC2.1: Story rows have correct data-llm-col attributes', () => {
    // id, title, status, test, priority, actions
    expect(src).toMatch(/<tr[^>]+data-llm-id={`US\$\{story\.storyNumber\}`}/);
    expect(src).toMatch(/<td[^>]+data-llm-col="id"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="title"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="status"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="test"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="priority"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="actions"/);
  });

  it('AC2.2: Each AC row has proper data-llm-id and columns', () => {
    expect(src).toMatch(/<tr[^>]+data-llm-id={`AC\$\{ac\.criteriaNumber\}`}/);
    expect(src).toMatch(/<td[^>]+data-llm-col="id"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="description"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="status"/);
    expect(src).toMatch(/<td[^>]+data-llm-col="actions"/);
  });

  it('AC2.3: No decorative elements have data-llm attributes', () => {
    // Ensure header row has no data-llm attributes (non-greedy match just within thead)
    const theadMatch = src.match(/<thead>[\s\S]*?<\/thead>/);
    if (theadMatch) {
      expect(theadMatch[0]).not.toMatch(/data-llm/);
    }
    // Expand/collapse button should not have data-llm
    expect(src).not.toMatch(/<button[^>]*data-llm/);
    // Empty cells should not declare data-llm-col
    const lines = src.split('\n');
    const emptyCells = lines.filter(l => l.includes('<td className="p-2"></td>'));
    emptyCells.forEach(l => expect(l).not.toContain('data-llm-col'));
  });
});
