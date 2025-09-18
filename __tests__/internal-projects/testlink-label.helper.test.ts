/**
 * TDD for UI helper: getTestLabel(link)
 * We will implement and export this helper; tests expect formatting behavior.
 * Initially fails until helper is exported from the app.
 */

import { describe, it, expect } from '@jest/globals';

// Intentionally importing expected helper path to drive TDD.
// The module will be created/updated in implementation.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getTestLabel } from '@/app/internal-projects/helpers/testLinkLabel';

describe('UI helper: getTestLabel(link) (TDD)', () => {
  it('returns empty string for undefined or empty', () => {
    expect(getTestLabel(undefined as unknown as string)).toBe('');
    expect(getTestLabel('')).toBe('');
  });

  it('returns host for bare https URL', () => {
    expect(getTestLabel('https://example.com')).toBe('example.com');
  });

  it('returns last path segment when present', () => {
    expect(getTestLabel('https://example.com/a/b/c')).toBe('c');
  });

  it('handles special characters in query/fragment', () => {
    expect(getTestLabel('https://example.com/run?id=123&redirect=%2Fhome#section-2')).toBe('run');
  });

  it('gracefully handles non-http strings by splitting path', () => {
    expect(getTestLabel('/relative/path/name')).toBe('name');
  });
});

