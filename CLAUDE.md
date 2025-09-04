# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application called "Speqq DSL Demo" - a tool for Product Managers to rapidly draft PRDs and co-create clickable, low-fi prototypes with an AI Copilot. The app focuses on clarity, speed, and believable flows rather than code export or persistence.

## Commands

### Development
```bash
npm run dev              # Start development server on http://localhost:3000
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npx tsc --noEmit         # Run TypeScript type checking
```

### Vercel Local Build Verification
```bash
npm i -g vercel          # Install Vercel CLI (once)
vercel link              # Link to Vercel project
vercel pull --yes --environment=preview
vercel build             # Run Vercel build locally
vercel deploy --prebuilt # Deploy local build
```

## Architecture

### Core Structure
- **Next.js App Router**: Uses app directory structure with TypeScript
- **API Routes**: Located in `app/api/proto/` for LLM operations
  - `POST /api/proto/ops`: Returns validated operations for prototypes
  - `POST /api/proto/prd`: Generates PRD markdown from scene summaries
  - `POST /api/proto/chat`: Handles AI copilot chat interactions
- **Vercel AI SDK**: Integration with OpenAI (configurable via MODEL env var)

### Key Components

**DSL System** (`app/lib/dsl.ts`):
- YAML-based domain-specific language for defining screens and components
- Types: `DSL`, `Screen`, `ComponentCommon`
- Supports mobile/web devices, component frames, linking, and milestones

**Wireframe System** (`app/components/wireframe/`):
- `WireframePreview.tsx`: Main canvas for rendering wireframe components
- `SceneTypes.ts`: Type definitions for scenes and components
- `ops.ts`: Operations for manipulating wireframe elements

**PRD Editor** (`app/components/PRDEditor.tsx`):
- Markdown editor with dark theme using CodeMirror
- Supports standard PRD sections (Problems, Users, Goals, etc.)

**Prototype Chat** (`app/components/PrototypeChat.tsx`):
- AI copilot interface for natural language prototype modifications
- Integrates with chat API route for real-time suggestions

### Environment Configuration
Required `.env.local` variables:
```
OPENAI_API_KEY=<your-api-key>
MODEL=gpt-4o-mini
```

### Important Files
- `speqq-dsl.md`: Product requirements document (source of truth)
- `app/lib/seed.ts`: Contains default seed data for prototypes
- `app/lib/prd.ts`: PRD template and utilities
- `app/lib/proto/ops.schema.ts`: Zod schemas for operation validation

## Development Notes

- The project uses Tailwind CSS v4 with PostCSS
- TypeScript is configured with strict mode
- ESLint is configured with relaxed rules (warnings instead of errors for common issues)
- No test framework is currently configured
- The app uses client-side state management without persistence
- Components use "use client" directive for client-side rendering