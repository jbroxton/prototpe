import fs from 'node:fs';
import path from 'node:path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { BM25Retriever } from '@langchain/community/retrievers/bm25';

export type Doc = { pageContent: string; metadata: { title: string; url?: string; source?: string } };

const ROOT = path.resolve(process.cwd(), 'expert-server');
const DATA_DIR = path.join(ROOT, 'data', 'seed');

export const state = {
  vector: null as null | MemoryVectorStore,
  bm25: null as null | BM25Retriever,
  docs: [] as Doc[],
};

export async function buildPipeline() {
  const files = listFiles(DATA_DIR);
  const rawDocs: Doc[] = files.map(f => ({ pageContent: fs.readFileSync(f, 'utf8'), metadata: { title: path.basename(f), source: f } }));
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
  const chunks = await splitter.splitDocuments(rawDocs as any);
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  const vector = await MemoryVectorStore.fromDocuments(chunks as any, embeddings);
  const bm25 = await BM25Retriever.fromDocuments(chunks as any);
  state.vector = vector; state.bm25 = bm25; state.docs = chunks as any;
  return { vectorCount: (chunks as any).length };
}

export async function hybridRetrieve(query: string, k = 8) {
  if (!state.vector || !state.bm25) throw new Error('Pipeline not built');
  const [dense, sparse] = await Promise.all([
    state.vector.similaritySearch(query, k),
    state.bm25.getRelevantDocuments(query)
  ]);
  const merged = [...dense, ...sparse];
  const uniq = uniqueBy(merged, d => `${d.metadata?.title}|${d.metadata?.url || d.metadata?.source || ''}|${hash(d.pageContent).slice(0,8)}`);
  return uniq.slice(0, k);
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

