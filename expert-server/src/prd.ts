import { answer, embed } from './llm.js';
import { loadIndex, retrieve } from './indexes.js';

export async function generatePRD(topic: string) {
  const index = loadIndex();
  if (!index) throw new Error('Index not built. POST /ingest first.');
  const [qv] = await embed([`Firefox product: ${topic}`]);
  const hits = retrieve(index, qv, 12);
  const context = hits.map((h, i) => `Source ${i+1}: ${h.title}${h.url?` — ${h.url}`:''}\n${h.text}`).join('\n\n');
  const prompt = `Draft a detailed PRD for: ${topic}. Use the context only. Structure strictly as:\n\n# Overview\n# Problem\n# Users\n# Solution\n# User Journeys\n# Requirements\n# Telemetry & Metrics\n# Risks & Mitigations\n# Acceptance Criteria\n# Citations\n\nKeep it concise, actionable, and cite 3–5 sources as Title — URL.\n\nContext:\n${context}`;
  const markdown = await answer(prompt, 'You are a senior Firefox PM producing a crisp, actionable PRD with citations.');
  const citations = hits.slice(0,5).map(h=>({ title: h.title, url: h.url }));
  return { markdown, citations };
}

