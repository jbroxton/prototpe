import fs from 'node:fs';
import path from 'node:path';
import { addDocuments, buildPipeline } from './pipeline.js';
import { fetchSitemapUrls, fetchUrlToMarkdown, saveMarkdownFor, toDocs } from './fetch.js';

export async function ingestFromSeeds(opts?: { extractEntities?: boolean; limitFiles?: number }) {
  // If no seed files exist, create a tiny placeholder to prove the pipeline.
  const seedDir = process.cwd().endsWith('expert-server') 
    ? path.join(process.cwd(), 'data', 'seed')
    : path.join(process.cwd(), 'expert-server', 'data', 'seed');
  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true });
  const demo = path.join(seedDir, 'README.seed.md');
  if (!fs.existsSync(demo)) {
    fs.writeFileSync(demo, `# Firefox seed\n\nThis is a placeholder seed. Add real pages here (Markdown or TXT).\n- Example: release notes snippets\n- Example: firefox-source-docs excerpts\n- Example: support articles\n`);
  }
  const r = await buildPipeline(opts);
  return { ok: true, chunks: r.vectorCount };
}

export async function ingestUrls(urls: string[]) {
  if (!Array.isArray(urls) || !urls.length) return { ok: false, added: 0 } as any;
  const items: { url: string; markdown: string; title?: string }[] = [];
  for (const url of urls) {
    try {
      const { markdown, title } = await fetchUrlToMarkdown(url);
      saveMarkdownFor(url, markdown);
      items.push({ url, markdown, title });
    } catch (e) {
      // swallow fetch errors to keep ingest flowing
    }
  }
  const docs = toDocs(items);
  const r = await addDocuments(docs);
  return { ok: true, added: r.added };
}

export async function ingestSitemap(origin: string, maxPages = 1000) {
  const urls = await fetchSitemapUrls(origin, maxPages);
  return ingestUrls(urls);
}
