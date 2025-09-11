import { answer } from './llm.js';
import { hybridRetrieve } from './pipeline.js';
import { extractEntitiesFromText } from './entities.js';

export async function queryExpert(q: string) {
  const k = 8;
  const [hits, ents] = await Promise.all([
    hybridRetrieve(q, k),
    extractEntitiesFromText(q).catch(() => [])
  ]);
  const entityTexts = (ents || []).map(e => String(e.text || '').toLowerCase()).filter(Boolean);
  const hasEntity = (h: any) => {
    const list = (h?.metadata?.entities || []) as { text: string }[];
    if (!Array.isArray(list) || list.length === 0 || entityTexts.length === 0) return false;
    const lower = list.map(e => String(e.text || '').toLowerCase());
    return entityTexts.some(t => lower.some(le => le === t || le.includes(t) || t.includes(le)));
  };
  // Stable partition: entity-matching hits first
  const boosted = [...hits.filter(hasEntity), ...hits.filter(h => !hasEntity(h))].slice(0, k);
  // Build concise context and citation snippets (budget ~6k tokens total)
  const mkSnippet = (s: string) => s.length > 600 ? s.slice(0, 600) + '…' : s;
  const context = boosted
    .map((h, i) => `Source ${i + 1}: ${h.metadata?.title || 'Untitled'}${h.metadata?.url ? ` — ${h.metadata?.url}` : h.metadata?.source ? ` — ${h.metadata?.source}` : ''}\n${mkSnippet(h.pageContent)}`)
    .join('\n\n');
  const prompt = `You are Mozilla Firefox Product Expert. Answer the question concisely using only the context. Do not invent sources.\n\nQuestion: ${q}\n\nContext:\n${context}`;
  const text = await answer(prompt);
  const citations = boosted.slice(0, 4).map(h => ({
    title: String(h.metadata?.title || 'Source'),
    url: (h.metadata?.url || h.metadata?.source) as string | undefined,
    snippet: mkSnippet(h.pageContent)
  }));
  return { answer: text, citations, chunks_retrieved: boosted.length, entities_detected: entityTexts };
}
