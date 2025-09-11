// Build plain description text with acceptance criteria for readability
export function buildPlainDescription(story: any) {
  const base = String(story?.description || '').trim();
  const acs: string[] = Array.isArray(story?.acList) ? story.acList.map((x: any) => String(x)) : [];
  const lines: string[] = [];
  if (base) lines.push(base);
  if (acs.length) {
    if (lines.length) lines.push('');
    lines.push('Acceptance Criteria');
    for (const ac of acs) lines.push(`- ${ac}`);
  }
  return lines.join('\n');
}

// Jira Cloud v3 prefers ADF for description. Build a minimal ADF doc.
export function buildAdfDescriptionFromText(text: string) {
  const paragraphs = String(text)
    .split(/\r?\n/)
    .reduce((nodes: any[], line: string) => {
      if (line.startsWith('- ')) {
        // Bullet item
        const content = [{ type: 'text', text: line.substring(2) }];
        const last = nodes[nodes.length - 1];
        if (!last || last.type !== 'bulletList') {
          nodes.push({ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content }] }] });
        } else {
          last.content.push({ type: 'listItem', content: [{ type: 'paragraph', content }] });
        }
      } else if (line.trim() === '') {
        nodes.push({ type: 'paragraph', content: [] });
      } else {
        nodes.push({ type: 'paragraph', content: [{ type: 'text', text: line }] });
      }
      return nodes;
    }, [] as any[]);
  return { type: 'doc', version: 1, content: paragraphs };
}

export function extractAcIds(story: any) {
  const acs: string[] = Array.isArray(story?.acList) ? story.acList.map((x: any) => String(x)) : [];
  const set = new Set<string>();
  const re = /\bAC_\d+\b/g;
  for (const s of acs) {
    const m = s.match(re) || [];
    m.forEach((id) => set.add(id));
  }
  return Array.from(set);
}

export function speqqToJiraFields(story: any) {
  const summary = story?.title || story?.name || 'Untitled';
  const text = buildPlainDescription(story);
  const rawLabels = ([] as string[])
    .concat(Array.isArray(story?.labels) ? story.labels.map((x: any) => String(x)) : [])
    .concat([String(story?.id || '').trim()].filter(Boolean))
    .concat(extractAcIds(story))
    .concat(['speqq-e2e']);
  // Lowercase all except IDs (US_*, AC_*)
  const labels = Array.from(new Set(rawLabels.map((l) => (/^(US|AC)_\d+$/i.test(l) ? l : l.toLowerCase()))));
  const projectKey = String(process.env.JIRA_PROJECT_KEY || '');
  const issueType = String(process.env.JIRA_ISSUE_TYPE || 'Story');
  // Prefer ADF description for Jira v3
  const description = buildAdfDescriptionFromText(text);
  return {
    project: { key: projectKey },
    issuetype: { name: issueType },
    summary,
    description,
    labels,
  };
}

export function jiraToSpeqqStatus(issue: any) {
  const name = issue?.fields?.status?.name || 'Unknown';
  return { status: name };
}
