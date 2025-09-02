export type Requirement = {
  lineIndex: number;
  raw: string;
  text: string;
  page: string; // home|details|checkout|confirmation|dashboard|login
  kind: "search" | "dropdown" | "list" | "carousel" | "video" | "button" | "input";
};

const pageIds = ["home", "details", "checkout", "confirmation", "dashboard", "login"] as const;

export function parseRequirements(prd: string): Requirement[] {
  const lines = prd.split("\n");
  const reqs: Requirement[] = [];
  const start = findSectionIndex(lines, "## Requirements");
  if (start === -1) return reqs;
  const end = findNextSectionIndex(lines, start + 1);
  for (let i = start + 1; i < (end === -1 ? lines.length : end); i++) {
    const line = lines[i];
    const m = line.match(/^\s*[-*]\s*(\[.\]\s*)?(.*)$/);
    if (!m) continue;
    const text = m[2].trim();
    const lower = text.toLowerCase();
    let kind: Requirement["kind"] = lower.includes("search") ? "search"
      : lower.includes("dropdown") || lower.includes("filter") ? "dropdown"
      : lower.includes("carousel") ? "carousel"
      : lower.includes("video") ? "video"
      : lower.includes("list") ? "list"
      : lower.includes("button") ? "button"
      : lower.includes("input") ? "input"
      : "input";
    let page = "home";
    for (const p of pageIds) {
      if (lower.includes(p)) { page = p; break; }
    }
    reqs.push({ lineIndex: i, raw: line, text, page, kind });
  }
  return reqs;
}

export function updateRequirementChecks(prd: string, checks: Record<number, boolean>): string {
  const lines = prd.split("\n");
  Object.entries(checks).forEach(([idxStr, ok]) => {
    const i = parseInt(idxStr, 10);
    if (isNaN(i) || i < 0 || i >= lines.length) return;
    const line = lines[i];
    const bullet = line.match(/^(\s*[-*]\s*)(\[[ xX]\]\s*)?(.*)$/);
    if (!bullet) return;
    const prefix = bullet[1];
    const body = bullet[3];
    lines[i] = `${prefix}${ok ? "[x] " : "[ ] "}${body}`;
  });
  return lines.join("\n");
}

function findSectionIndex(lines: string[], header: string): number {
  return lines.findIndex((l) => l.trim().toLowerCase() === header.toLowerCase());
}
function findNextSectionIndex(lines: string[], from: number): number {
  for (let i = from; i < lines.length; i++) if (/^##\s+/.test(lines[i])) return i; return -1;
}

export type MilestoneItem = { type: "CUJ" | "Feature" | "AC"; lineIndex: number; text: string };
export type MilestoneSpec = { version: "V0" | "V1" | "V2"; milestone: "M0" | "M1" | "M2"; items: MilestoneItem[] };

export function parseMilestones(prd: string): MilestoneSpec[] {
  const lines = prd.split("\n");
  const start = findSectionIndex(lines, "## Milestones");
  if (start === -1) return [];
  const end = findNextSectionIndex(lines, start + 1) === -1 ? lines.length : findNextSectionIndex(lines, start + 1);
  const specs: MilestoneSpec[] = [];
  let current: MilestoneSpec | null = null;
  for (let i = start + 1; i < end; i++) {
    const line = lines[i];
    const v = line.match(/^###\s+V([012])\b/i);
    if (v) {
      const vn = `V${v[1]}` as "V0" | "V1" | "V2";
      const m = vn === "V0" ? "M0" : vn === "V1" ? "M1" : "M2";
      current = { version: vn, milestone: m, items: [] };
      specs.push(current);
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s*(CUJ|Feature|Req|AC)\s*:?\s*(.*)$/i);
    if (bullet && current) {
      const t = bullet[1].toUpperCase();
      const kind = t === "REQ" ? "Feature" : (t as any);
      current.items.push({ type: kind, lineIndex: i, text: bullet[2].trim() });
    }
  }
  return specs;
}

// Simple parser for CUJs in the generic "## User Journeys" section
export function parseUserJourneys(prd: string): string[] {
  const lines = prd.split("\n");
  const start = findSectionIndex(lines, "## User Journeys");
  if (start === -1) return [];
  const end = findNextSectionIndex(lines, start + 1);
  const result: string[] = [];
  for (let i = start + 1; i < (end === -1 ? lines.length : end); i++) {
    const line = lines[i];
    const m = line.match(/^\s*(?:[-*]|\d+\.)\s*(.*)$/);
    if (m) result.push(m[1].trim());
  }
  return result;
}
