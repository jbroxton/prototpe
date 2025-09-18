export function getTestLabel(link: string | null | undefined): string {
  if (!link) return '';
  const trimmed = String(link).trim();
  if (!trimmed) return '';

  // Try to parse as URL first
  try {
    const u = new URL(trimmed);
    // If there is a path segment, return last non-empty segment
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      try {
        return decodeURIComponent(last);
      } catch {
        return last;
      }
    }
    // Otherwise, return hostname
    return u.hostname;
  } catch {
    // Not a full URL (could be relative); fall back to last path segment
    const parts = trimmed.split('/').filter(Boolean);
    if (parts.length === 0) return trimmed;
    const last = parts[parts.length - 1];
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  }
}

export default getTestLabel;

