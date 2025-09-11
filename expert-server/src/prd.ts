import { answer, streamAnswer } from './llm.js';
import { hybridRetrieve } from './pipeline.js';
import { z } from 'zod';

export async function generatePRD(topic: string) {
  const hits = await hybridRetrieve(`Firefox product: ${topic}`, 12);
  const context = hits.map((h, i) => `Source ${i+1}: ${h.metadata?.title || 'Untitled'}${h.metadata?.url?` — ${h.metadata?.url}`: h.metadata?.source?` — ${h.metadata?.source}`:''}\n${h.pageContent}`).join('\n\n');
  const schema = z.object({
    overview: z.string(),
    problem: z.string(),
    users: z.array(z.string()).min(1),
    solution: z.string(),
    userJourneys: z.array(z.string()).min(1),
    requirements: z.array(z.string()).min(1),
    metrics: z.array(z.string()).min(1),
    risks: z.array(z.string()).min(1),
    citations: z.array(z.object({ title: z.string(), url: z.string().optional() })).min(2)
  });

  const prompt = `Produce a strict JSON object for a PRD based ONLY on Context. Fields: overview, problem, users (array), solution, userJourneys (array), requirements (array), metrics (array), risks (array), citations (array of {title,url}). No extra keys.\n\nTopic: ${topic}\n\nContext:\n${context}`;

  // Ask for JSON; then validate with Zod
  const jsonText = await answer(prompt + '\n\nReturn ONLY JSON.', 'You are a precise system that outputs strict JSON matching the requested schema.');
  let obj: any;
  try { obj = JSON.parse(jsonText); } catch { throw new Error('Model did not return JSON'); }
  const prd = schema.parse(obj);
  const markdown = prdToMarkdown(prd as any);
  return { markdown, citations: prd.citations };
}

function buildSchema() {
  return z.object({
    overview: z.string(),
    problem: z.string(),
    users: z.array(z.string()).min(1),
    solution: z.string(),
    userJourneys: z.array(z.string()).min(1),
    requirements: z.array(z.string()).min(1),
    metrics: z.array(z.string()).min(1),
    risks: z.array(z.string()).min(1),
    citations: z.array(z.object({ title: z.string(), url: z.string().optional() })).min(2)
  });
}

export type PRDSchema = z.infer<ReturnType<typeof buildSchema>>;

export function prdToMarkdown(prd: PRDSchema) {
  const sec = (t: string) => `## ${t}`;
  const list = (arr: string[]) => arr.map(x => `- ${x}`).join('\n');
  const md = [
    `# Product Requirements Document`,
    sec('Overview'), prd.overview,
    sec('Problem'), prd.problem,
    sec('Users'), list(prd.users),
    sec('Solution'), prd.solution,
    sec('User Journeys'), list(prd.userJourneys),
    sec('Requirements'), list(prd.requirements),
    sec('Metrics'), list(prd.metrics),
    sec('Risks'), list(prd.risks),
    sec('Citations'), prd.citations.map(c => `- ${c.title}${c.url ? ` — ${c.url}` : ''}`).join('\n')
  ].join('\n\n');
  return md;
}

// Streaming helper for PRD (markdown). Uses a markdown prompt and streams tokens.
export async function streamPRDMarkdown(topic: string) {
  const hits = await hybridRetrieve(`Firefox product: ${topic}`, 10);
  const context = hits.map((h, i) => `Source ${i+1}: ${h.metadata?.title || 'Untitled'}${h.metadata?.url?` — ${h.metadata?.url}`: h.metadata?.source?` — ${h.metadata?.source}`:''}\n${h.pageContent}`).join('\n\n');
  const prompt = `Draft a PRD in Markdown for: ${topic}. Sections: Overview, Problem, Users, Solution, User Journeys, Requirements, Metrics, Risks, and a Citations section at the end (Title — URL). Use ONLY the Context.\n\nContext:\n${context}`;
  return { stream: await streamAnswer(prompt, 'You are a senior Firefox PM producing a crisp, actionable PRD with citations.'), hits };
}
