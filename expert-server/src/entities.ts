import { openai } from './llm.js';

export type Entity = { text: string; type: 'feature'|'pref'|'api'|'component'|'module' };

const SYS = `You extract Firefox product entities from text.
Return only a compact JSON array. Allowed types: feature, pref, api, component, module.
Be conservative and prefer multi-word product terms (e.g., "Bookmarks", "Places database", "Sync", "Tracking Protection", "browser.tabs.inTitlebar").
`;

export async function extractEntitiesFromText(text: string): Promise<Entity[]> {
  const prompt = `Extract up to 8 entities from the following text. JSON array only.
Text:\n${truncate(text, 1500)}\n\nFormat: [{"text":"Bookmarks","type":"feature"}]`;
  try {
    const r = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [ { role: 'system', content: SYS }, { role: 'user', content: prompt } ],
      temperature: 0
    });
    const raw = r.choices[0]?.message?.content?.trim() || '[]';
    const json = tryParseArray(raw);
    return normalizeEntities(json);
  } catch {
    return [];
  }
}

export function normalizeEntities(arr: any): Entity[] {
  const out: Entity[] = [];
  if (!Array.isArray(arr)) return out;
  for (const e of arr) {
    const text = String(e?.text || '').trim();
    const type = String(e?.type || '').toLowerCase();
    if (!text) continue;
    if (!['feature','pref','api','component','module'].includes(type)) continue;
    out.push({ text, type: type as any });
  }
  // dedupe by lowercase text
  const seen = new Set<string>();
  return out.filter(e=>{ const k=e.text.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; });
}

function tryParseArray(s: string): any[] {
  try { return JSON.parse(s); } catch {}
  // attempt to find JSON array within markdown/code fences
  const m = s.match(/\[([\s\S]*)\]/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return [];
}

function truncate(s: string, n: number) { return s.length>n ? s.slice(0,n) : s; }

