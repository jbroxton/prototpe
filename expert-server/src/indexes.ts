import fs from 'node:fs';
import path from 'node:path';
import { DocChunk, IndexFile } from './types.js';
import { embed } from './llm.js';
import { chunkText, cosine } from './util.js';

const ROOT = path.resolve(process.cwd(), 'expert-server');
const DATA_DIR = path.join(ROOT, 'data', 'seed');
const STORAGE = path.join(ROOT, 'storage');
const INDEX_FILE = path.join(STORAGE, 'index.json');

export function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(STORAGE, { recursive: true });
}

export async function ingestLocal(): Promise<IndexFile> {
  ensureDirs();
  const files = listMarkdown(DATA_DIR);
  const chunks: DocChunk[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const title = path.basename(file);
    const parts = chunkText(raw);
    parts.forEach((p, i) => chunks.push({ id: `${title}:${i}`, title, url: undefined, kind: 'docs', text: p }));
  }
  const vectors = await embed(chunks.map(c => c.text));
  chunks.forEach((c, i) => (c.embeddings = vectors[i]));
  const payload: IndexFile = { createdAt: new Date().toISOString(), model: 'text-embedding-3-small', chunks };
  fs.writeFileSync(INDEX_FILE, JSON.stringify(payload));
  return payload;
}

export function loadIndex(): IndexFile | null {
  try { return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')); } catch { return null; }
}

export function retrieve(index: IndexFile, queryVector: number[], topK = 8): DocChunk[] {
  const scored = index.chunks.map(c => ({ c, s: cosine(queryVector, c.embeddings || []) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, topK).map(x => x.c);
}

function listMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...listMarkdown(p));
    else if (/\.(md|mdx|txt)$/i.test(entry)) out.push(p);
  }
  return out;
}

