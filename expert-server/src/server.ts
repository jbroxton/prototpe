import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ingestFromSeeds, ingestUrls, ingestSitemap } from './ingest.js';
import { queryExpert } from './query.js';
import { generatePRD, streamPRDMarkdown } from './prd.js';
import { pipeOpenAIStreamToSSE } from './sse.js';
import { state } from './pipeline.js';
import { openai } from './llm.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    vectorStoreReady: !!state.vector,
    documentsLoaded: state.docs.length || 0,
    openaiConnected: !!process.env.OPENAI_API_KEY
  });
});

app.post('/ingest', async (req, res) => {
  try {
    let opts: any = undefined;
    try { opts = req.body && typeof req.body === 'object' ? req.body : undefined; } catch {}
    const r = await ingestFromSeeds(opts);
    res.json(r);
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.post('/ingest/urls', async (req, res) => {
  try {
    const urls: string[] = req.body?.urls || [];
    if (!Array.isArray(urls) || urls.length === 0) return res.status(400).json({ ok: false, error: 'Missing urls[]' });
    const r = await ingestUrls(urls);
    res.json(r);
  } catch (e:any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Temporary debug endpoint to inspect stored entities on chunks
app.get('/entities/debug', async (_req, res) => {
  try {
    const samples = (state.docs || []).slice(0, 3).map((d: any) => ({
      content: String(d.pageContent || '').slice(0, 100),
      entities: d?.metadata?.entities || []
    }));
    res.json({ samples });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Checkpoint 4: entity extraction test endpoint
app.post('/entities/extract', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ ok: false, error: 'Missing text' });
    const { extractEntitiesFromText } = await import('./entities.js');
    const entities = await extractEntitiesFromText(text);
    res.json({ ok: true, entities });
  } catch (e:any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.post('/ingest/sitemap', async (req, res) => {
  try {
    const origin = String(req.body?.origin || '').trim();
    const maxPages = Number(req.body?.maxPages || 1000);
    if (!origin) return res.status(400).json({ ok: false, error: 'Missing origin' });
    const r = await ingestSitemap(origin, maxPages);
    res.json(r);
  } catch (e:any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Checkpoint 6: simple entity suggestions (autocomplete)
app.post('/entities/suggest', async (req, res) => {
  try {
    const prefix = String(req.body?.prefix || '').trim();
    const k = Number(req.body?.k || 5);
    const role = req.body?.role ? String(req.body.role) : undefined;
    if (!prefix) return res.status(400).json({ ok: false, error: 'Missing prefix' });
    const suggestions = suggestEntities(prefix, k, role);
    res.json({ suggestions });
  } catch (e:any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

function suggestEntities(prefix: string, k = 5, role?: string): string[] {
  const p = prefix.toLowerCase();
  const counts = new Map<string, { name: string; count: number }>();
  const docs = state.docs || [];
  for (const d of docs as any[]) {
    const ents: any[] = Array.isArray(d?.metadata?.entities) ? d.metadata.entities : [];
    for (const e of ents) {
      const name = String(e?.text || '').trim(); if (!name) continue;
      const lower = name.toLowerCase();
      if (!(lower.startsWith(p) || lower.includes(p))) continue; // basic prefix/substring match
      const cur = counts.get(lower) || { name, count: 0 };
      // Heuristic role weighting by source host
      let weight = 1;
      if (role) {
        const src: string = String(d?.metadata?.url || d?.metadata?.source || '').toLowerCase();
        const inferred = inferRoleFromSource(src);
        if (inferred && inferred !== role.toLowerCase()) weight = 0.5; // downweight mismatched role
      }
      cur.count += weight;
      counts.set(lower, cur);
    }
  }
  const ranked = Array.from(counts.values()).sort((a,b)=> b.count - a.count);
  return ranked.slice(0, k).map(x => x.name);
}

function inferRoleFromSource(src: string): 'developer'|'enduser'|'admin'|null {
  if (!src) return null;
  if (src.includes('support.mozilla.org')) return 'enduser';
  if (src.includes('developer.mozilla.org') || src.includes('firefox-source-docs.mozilla.org') || src.includes('github.com')) return 'developer';
  if (src.includes('enterprise') || src.includes('policy')) return 'admin';
  return null;
}

app.post('/query', async (req, res) => {
  try {
    const q = String(req.body?.q || '').trim();
    if (!q) return res.status(400).json({ ok: false, error: 'Missing q' });
    const stream = !!req.body?.stream;
    if (stream) {
      // Build retrieval first for citations/meta and context
      const { queryExpert } = await import('./query.js');
      const k = await queryExpert(q); // reuse to build context and citations deterministically
      // Recreate prompt for streaming (same as in query.ts)
      const mkSnippet = (s: string) => s.length > 600 ? s.slice(0, 600) + '…' : s;
      const hitsCount = k.chunks_retrieved;
      const context = k.citations.map((c, i) => `Source ${i+1}: ${c.title}${c.url?` — ${c.url}`:''}\n${mkSnippet(c.snippet)}`).join('\n\n');
      const prompt = `You are Mozilla Firefox Product Expert. Answer the question concisely using only the context. Do not invent sources.\n\nQuestion: ${q}\n\nContext:\n${context}`;
      const openaiStream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [ { role: 'system', content: 'You are Mozilla Firefox Product Expert.' }, { role: 'user', content: prompt }],
        temperature: 0.2,
        stream: true
      });
      await pipeOpenAIStreamToSSE(res, openaiStream, { citations: k.citations, chunks_retrieved: hitsCount });
      return;
    }
    const r = await queryExpert(q);
    res.json({ answer: r.answer, citations: r.citations, chunks_retrieved: r.chunks_retrieved, entities_detected: r.entities_detected });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.post('/prd', async (req, res) => {
  try {
    const topic = String(req.body?.topic || '').trim();
    if (!topic) return res.status(400).json({ ok: false, error: 'Missing topic' });
    const stream = !!req.body?.stream;
    if (stream) {
      const { stream, hits } = await streamPRDMarkdown(topic);
      const citations = hits.slice(0, 5).map(h => ({ title: String(h.metadata?.title || 'Source'), url: (h.metadata?.url || h.metadata?.source) }));
      await pipeOpenAIStreamToSSE(res, stream, { citations });
      return;
    }
    const r = await generatePRD(topic);
    res.json({ ok: true, ...r });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`[expert-server] listening on http://localhost:${port}`));
