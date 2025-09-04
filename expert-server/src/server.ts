import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ingestFromSeeds } from './ingest.js';
import { queryExpert } from './query.js';
import { generatePRD } from './prd.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/ingest', async (_req, res) => {
  try {
    const r = await ingestFromSeeds();
    res.json(r);
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.post('/query', async (req, res) => {
  try {
    const q = String(req.body?.q || '').trim();
    if (!q) return res.status(400).json({ ok: false, error: 'Missing q' });
    const r = await queryExpert(q);
    res.json({ ok: true, ...r });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.post('/prd', async (req, res) => {
  try {
    const topic = String(req.body?.topic || '').trim();
    if (!topic) return res.status(400).json({ ok: false, error: 'Missing topic' });
    const r = await generatePRD(topic);
    res.json({ ok: true, ...r });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`[expert-server] listening on http://localhost:${port}`));

