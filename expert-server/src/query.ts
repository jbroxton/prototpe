import { answer } from './llm.js';
import { hybridRetrieve } from './pipeline.js';

export async function queryExpert(q: string) {
  const hits = await hybridRetrieve(q, 8);
  const context = hits.map((h, i) => `Source ${i+1}: ${h.metadata?.title || 'Untitled'}${h.metadata?.url?` — ${h.metadata?.url}`: h.metadata?.source?` — ${h.metadata?.source}`:''}\n${h.pageContent}`).join('\n\n');
  const prompt = `Answer the user question using only the context. Then list 2–4 citations as Title — URL (or file name if no URL).\n\nQuestion: ${q}\n\nContext:\n${context}`;
  const text = await answer(prompt);
  const citations = hits.slice(0,4).map(h=>({ title: String(h.metadata?.title || 'Source'), url: (h.metadata?.url || h.metadata?.source) }));
  return { answer: text, citations };
}
