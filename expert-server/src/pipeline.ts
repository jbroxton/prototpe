import fs from 'node:fs';
import path from 'node:path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { BM25Retriever } from '@langchain/community/retrievers/bm25';

export type Doc = { pageContent: string; metadata: { title: string; url?: string; source?: string } };

const ROOT = process.cwd().endsWith('expert-server') ? process.cwd() : path.resolve(process.cwd(), 'expert-server');
const DATA_DIR = path.join(ROOT, 'data', 'seed');

export const state = {
  vector: null as null | MemoryVectorStore,
  bm25: null as null | BM25Retriever,
  docs: [] as Doc[],
};

export async function buildPipeline(opts?: { extractEntities?: boolean; limitFiles?: number }) {
  const files = listFiles(DATA_DIR).slice(0, opts?.limitFiles || undefined);
  const rawDocs: Doc[] = files.map(f => ({ pageContent: fs.readFileSync(f, 'utf8'), metadata: { title: path.basename(f), source: f } }));
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
  let chunks = await splitter.splitDocuments(rawDocs as any);
  if (opts?.extractEntities) {
    const { extractEntitiesFromText } = await import('./entities.js');
    // Annotate each chunk with extracted entities (best-effort)
    const annotated: any[] = [];
    for (const d of chunks as any[]) {
      try {
        const ents = await extractEntitiesFromText(d.pageContent);
        d.metadata = { ...(d.metadata||{}), entities: ents };
      } catch {}
      annotated.push(d);
    }
    chunks = annotated as any;
  }
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  const vector = await MemoryVectorStore.fromDocuments(chunks as any, embeddings);
  const bm25 = await BM25Retriever.fromDocuments(chunks as any);
  state.vector = vector; state.bm25 = bm25; state.docs = chunks as any;
  return { vectorCount: (chunks as any).length };
}

export async function hybridRetrieve(query: string, k = 8) {
  if (!state.vector || !state.bm25) throw new Error('Pipeline not built');
  // Dense top-k
  const dense = await state.vector.similaritySearch(query, k);
  // Sparse top-k (temporarily set k)
  const prevK = (state.bm25 as any).k;
  (state.bm25 as any).k = k;
  const sparse = await state.bm25.getRelevantDocuments(query);
  (state.bm25 as any).k = prevK;
  // Merge and de-duplicate by title+url/source
  const merged = [...dense, ...sparse];
  const uniq = uniqueBy(merged, d => `${d.metadata?.title || ''}|${d.metadata?.url || d.metadata?.source || ''}`);
  return uniq.slice(0, k);
}

// Add new documents (already as raw markdown/txt) to both vector and sparse stores.
export async function addDocuments(newDocs: Doc[]) {
  if (!newDocs.length) return { added: 0 };
  if (!state.vector || !state.bm25) throw new Error('Pipeline not built');
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
  const chunks = await splitter.splitDocuments(newDocs as any);
  await state.vector.addDocuments(chunks as any);
  await state.bm25.addDocuments?.(chunks as any);
  state.docs.push(...(chunks as any));
  return { added: (chunks as any).length };
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...listFiles(p));
    else if (/\.(md|mdx|txt)$/i.test(entry)) out.push(p);
  }
  return out;
}

function uniqueBy<T>(arr: T[], key: (t: T)=>string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) { const k = key(it); if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}

function hash(s: string){ let h=0; for (let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return String(h>>>0); }
