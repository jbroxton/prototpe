export type LocalSnapshot = {
  lastSummary?: string | null;
  lastDescription?: string | null;
  labels?: string[];
  lastStatus?: string | null;
};

export type JiraSnapshot = {
  summary?: string | null;
  descriptionText?: string | null;
  labels?: string[];
  status?: string | null;
};

function eqArray(a?: string[] | null, b?: string[] | null) {
  const aa = Array.isArray(a) ? a : [];
  const bb = Array.isArray(b) ? b : [];
  if (aa.length !== bb.length) return false;
  const as = new Set(aa);
  for (const x of bb) if (!as.has(x)) return false;
  return true;
}

export function fieldsDiffer(local: LocalSnapshot | null | undefined, jira: JiraSnapshot | null | undefined) {
  const l = local || {};
  const j = jira || {};
  if ((l.lastSummary ?? '') !== (j.summary ?? '')) return true;
  if ((l.lastDescription ?? '') !== (j.descriptionText ?? '')) return true;
  if (!eqArray(l.labels, j.labels)) return true;
  if ((l.lastStatus ?? '') !== (j.status ?? '')) return true;
  return false;
}

export function shouldShowDiff(local: LocalSnapshot | null | undefined, jira: JiraSnapshot | null | undefined, hasConflict?: boolean) {
  return Boolean(hasConflict) || fieldsDiffer(local, jira);
}
