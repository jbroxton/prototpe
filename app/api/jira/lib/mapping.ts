// In-memory mapping for storyId -> Jira key (per-process)
const map = new Map<string, string>();

export function putStoryKey(storyId: string, key: string) {
  if (!storyId) return;
  map.set(String(storyId), String(key));
}

export function getStoryKey(storyId: string) {
  return map.get(String(storyId));
}

export function resetMapping() {
  map.clear();
}

