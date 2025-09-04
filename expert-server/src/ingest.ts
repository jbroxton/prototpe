import fs from 'node:fs';
import path from 'node:path';
import { buildPipeline } from './pipeline.js';

export async function ingestFromSeeds() {
  // If no seed files exist, create a tiny placeholder to prove the pipeline.
  const seedDir = path.join(process.cwd(), 'expert-server', 'data', 'seed');
  const demo = path.join(seedDir, 'README.seed.md');
  if (!fs.existsSync(demo)) {
    fs.writeFileSync(demo, `# Firefox seed\n\nThis is a placeholder seed. Add real pages here (Markdown or TXT).\n- Example: release notes snippets\n- Example: firefox-source-docs excerpts\n- Example: support articles\n`);
  }
  const r = await buildPipeline();
  return { ok: true, chunks: r.vectorCount };
}
