# Firefox Product Expert — Source of Truth

Owner: AI Assistant (you). This document is the working center for the “Firefox Product Expert” MVP. Keep it current: update plans, decisions, TODOs, and lessons learned as we go.

## Vision
- Build a Product Information Center powered by an LLM that answers Firefox product questions with citations, summarizes releases/bugs/docs, and drafts PRDs/user journeys grounded in official sources.
- Prioritize speed-to-demo, correctness with citations, and minimal custom code.

## Guiding Principles
- Open-source first for storage/indexing/UI; use OpenAI API for LLM quality and speed.
- Keep components swappable (LLM and embeddings behind thin interfaces).
- Deterministic retrieval before generation; always return citations.
- Ship a small, curated corpus first; add breadth later.
- Separate service: do not disturb existing Next.js app.

## High-Level Architecture (MVP)
- Separate server in this repo: `expert-server/` (Express/TypeScript). Status: PENDING — do not ship until plan approved.
- Retrieval-Augmented Generation (RAG): hybrid retrieval using OSS frameworks (no custom plumbing).
- LLM: OpenAI `gpt-4o-mini` (answers/tool calls); `gpt-4o` optional for PRD drafts.
- Embeddings: OpenAI `text-embedding-3-small`.
- Vector store: LangChain MemoryVectorStore for fastest start; switch to LangChain–Chroma for persistence (10 lines change).
- UI: Reuse existing chat UI in this repo; point it to the new server endpoints and stream via Vercel AI SDK.

## Replace Custom Code With OSS (Decisions)
- Hybrid retrieval: use LangChain
  - `MemoryVectorStore` (or `Chroma` via LangChain) + `OpenAIEmbeddings`
  - `BM25Retriever` from `@langchain/community`
  - Merge results with `UniqueDocumentsChain` pattern (or simple de‑dupe by `title+url`).
- Markdown processing: use `markdown-it` and LangChain splitters
  - `RecursiveCharacterTextSplitter` handles overlap and chunking automatically.
- URL fetching → Markdown: use Readability + Turndown
  - `node-fetch` + `jsdom` + `@mozilla/readability` to extract article content
  - `turndown` to convert HTML → Markdown (consistent, fast, zero headless browser)
- API response streaming: use Vercel AI SDK in the existing Next.js UI
  - Server returns standard streaming; client uses `@vercel/ai` helpers for UI tokens.
- Vector store ops: use LangChain’s integrations
  - No custom Chroma wrapper; use `Chroma.fromDocuments(...)` when we move to persistence.
- PRD structured output: use Zod + LangChain structured output
  - Guarantees each required section; we can still render as Markdown for UX.

Example (hybrid retrieval in ~20 lines):
```
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 150 });
const docs = await splitter.splitDocuments(rawDocs);
const vector = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings({ model: 'text-embedding-3-small' }));
const bm25 = await BM25Retriever.fromDocuments(docs);
const dense = await vector.similaritySearch(query, 8);
const sparse = await bm25.getRelevantDocuments(query);
const hits = dedupe([...dense, ...sparse]);
```
## Data Scope (Curated First)
- Firefox official documentation (small seed set):
  - firefox-source-docs.mozilla.org (architecture, UI modules, telemetry overview)
  - Release notes for last ~6 versions (mozilla.org)
  - SUMO (support.mozilla.org) top topics (install/update, privacy, performance)
- Code snippets (not whole repo):
  - `modules/libpref/init/all.js` (prefs)
  - 2–3 WebIDL files related to common features (e.g., Downloads, Tabs)
  - Selected `browser/` or `toolkit/` docs/READMEs
- Optional live APIs (read-only):
  - Product details JSON: `https://product-details.mozilla.org/1.0/firefox_versions.json`
  - Bugzilla REST: `https://bugzilla.mozilla.org/rest/` (summaries + last 5 comments)

## Endpoints (Expert Server)
- `POST /ingest` — build/update indexes from `data/seed` (Markdown + code snippets); optional on-demand URL ingest.
- `POST /query` — `{ q, topK?, filters? }` → hybrid retrieve → LLM answer with 2–4 citations.
- `POST /prd` — `{ topic, scope? }` → retrieve 8–12 chunks → PRD draft (Overview, Problem, Users, Solution, User Journeys, Requirements, Telemetry, Metrics, Risks, ACs) + citations.

## Retrieval Strategy (Hybrid, OSS)
- Chunk with `RecursiveCharacterTextSplitter`.
- Dense retrieve with `MemoryVectorStore` (swap to `Chroma` later).
- Sparse retrieve with `BM25Retriever`.
- Merge + de‑dupe; cap 4–8 chunks per answer; keep token budget ≤ ~6–8k.

## Prompts (Initial)
- System: “You are Mozilla Firefox Product Expert. Prefer official sources (firefox-source-docs, mozilla.org release notes, SUMO, Bugzilla, gecko-dev). Answer concisely, then list 2–4 sources with title + URL. If unsure, ask a clarifying question.”
- PRD template: Compose sections listed above; add a “Citations” section (bullet list of Title — URL). Keep requirements/actionable and include telemetry signals where relevant.

## Repository Layout (new)
```
expert-server/
  package.json
  tsconfig.json
  .env.example
  src/
    server.ts        # Express, CORS, routes
    llm.ts           # OpenAI client (chat, stream, embed)
    pipeline.ts      # LangChain loaders/splitters/vector store + BM25 retriever (no custom math)
    ingest.ts        # load seed files (Markdown/TXT); optional URL fetch → markdown via Readability + Turndown
    query.ts         # hybrid retrieval (LangChain) + prompt compose
    prd.ts           # PRD generator
  data/seed/         # curated markdown + code snippets
  storage/           # embeddings / index files (gitignored)
```

## Environment
- `OPENAI_API_KEY` (required)
- Optional: `BUGZILLA_API_KEY` (public queries work without it)
- Ports: default `8787` (configurable via `PORT`)

## Runbook
1) `cd expert-server && npm i && cp .env.example .env` (set `OPENAI_API_KEY`)
2) `npm run dev` (starts on `http://localhost:8787`)
3) `POST /ingest` (no body needed) to build the index
4) Point existing chat UI to `POST /query` and `POST /prd`
5) Enable streaming in UI via Vercel AI SDK (no backend change required beyond streaming response).

## MVP Roadmap
- [ ] Scaffold expert-server with routes, CORS, health
- [ ] Add OpenAI wrapper (chat + embeddings)
- [ ] Add Chroma + BM25 hybrid retrieval
- [ ] Seed `data/seed` with curated docs + code snippets
- [ ] Implement `/ingest` (files → chunks → embeddings → store)
- [ ] Implement `/query` (hybrid retrieve → LLM answer + citations)
- [ ] Implement `/prd` (retrieval → PRD draft + citations)
- [ ] Hook existing UI to endpoints
- [ ] Add Bugzilla + product-details tools (optional)

## Testing & Validation
- Golden queries (aim for correct answers with good citations):
  - “What’s new in Firefox 130 for privacy?”
  - “Explain pref `browser.tabs.inTitlebar` and where it is defined.”
  - “Top open bugs for Firefox UI performance.”
  - “Generate PRD: Download resume improvements.”
- Measure: retrieval hit rate, answer latency, citation quality.

## Security & Compliance
- Attribute sources; respect licenses.
- No write operations to external systems.
- Sanitise and log only non-sensitive metadata.

## Decisions (Log)
- 2025‑09‑04: Use OpenAI for LLM + embeddings; Chroma for vectors; BM25 in-memory. Separate server inside repo.

## Risks
- Retrieval gaps → fallback to on-demand fetcher (future work)
- Source drift → periodic re-ingest job (manual for MVP)
- Token limits → aggressive chunk trimming and result merging

## Stretch (Post‑MVP)
- Re-ranking using LLM or Cohere Rerank (OSS alt: bge-reranker)
- On-demand URL ingestion from the chat
- Version/channel filters (Stable, Beta, Nightly, ESR)
- Compare releases (diff summaries)

## TODO (Owner)
- [x] Create `expert-server/` scaffold
- [x] Add `.env.example` with `OPENAI_API_KEY`
- [ ] Replace any custom retrieval with LangChain MemoryVectorStore + BM25Retriever
- [ ] Implement URL → Markdown pipeline using Readability + Turndown (optional for MVP)
- [ ] Seed `data/seed` with 20–40 curated pages
- [ ] Implement `/ingest` using LangChain loaders + splitters
- [ ] Implement `/query` hybrid merger via LangChain
- [ ] Wire chat UI to new endpoints and enable streaming with Vercel AI SDK
- [ ] Draft PRD generator (Zod + structured output) and test

## Status Gate
- Implementation is paused until this plan is approved. Once approved, proceed to replace any custom code with the OSS components listed above and wire endpoints.

## Lessons Learned (append as we go)
- 2025‑09‑04: Keep LLM/embeddings behind a simple interface; made switching easy. Curated docs beat broad crawling for MVP speed.
