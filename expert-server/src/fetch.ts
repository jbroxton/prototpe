import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
// @ts-ignore no types
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { Doc } from './pipeline.js';

const td = new TurndownService({ headingStyle: 'atx' });

export async function fetchUrlToMarkdown(url: string): Promise<{ markdown: string; title: string }> {
  const r = await fetch(url, { headers: { 'User-Agent': 'Firefox-Expert/0.1 (+demo)' } });
  if (!r.ok) throw new Error(`fetch_failed ${r.status}`);
  const html = await r.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  const contentHtml = article?.content || dom.window.document.body.innerHTML;
  const title = article?.title || dom.window.document.title || url;
  const markdown = td.turndown(contentHtml);
  return { markdown, title };
}

export async function fetchSitemapUrls(origin: string, maxPages = 1000): Promise<string[]> {
  const sitemapUrl = origin.endsWith('/') ? origin + 'sitemap.xml' : origin + '/sitemap.xml';
  const r = await fetch(sitemapUrl, { headers: { 'User-Agent': 'Firefox-Expert/0.1 (+demo)' } });
  if (!r.ok) throw new Error(`sitemap_fetch_failed ${r.status}`);
  const xml = await r.text();
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);
  return urls.slice(0, maxPages);
}

export function saveMarkdownFor(url: string, markdown: string) {
  const dir = path.join(process.cwd(), 'data', 'seed', hostDir(url));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, safeName(url) + '.md');
  fs.writeFileSync(file, `# ${url}\n\n${markdown}`);
  return file;
}

export function toDocs(urlsAndMd: { url: string; markdown: string; title?: string }[]): Doc[] {
  return urlsAndMd.map(({ url, markdown, title }) => ({ pageContent: markdown, metadata: { title: title || url, url } }));
}

function hostDir(url: string) {
  try { const u = new URL(url); return u.host.replace(/[:/]/g, '_'); } catch { return 'external'; }
}
function safeName(url: string) { return url.replace(/[^a-z0-9]+/gi, '_').slice(0, 120); }

