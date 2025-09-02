import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { sceneSummary } = await req.json();
  const system = [
    'Create a concise PRD from the given prototype summary.',
    'Sections in Markdown:',
    'Title, Overview, Users, CUJs, Requirements (by screen), Acceptance Criteria, Risks, Open Questions.',
    'Keep it scannable, use short bullets, avoid fluff.',
  ].join(' ');

  const { text } = await generateText({
    model: openai(process.env.MODEL || 'gpt-4o-mini'),
    system,
    prompt: `Prototype summary (for mobile-first wireframe):\n${sceneSummary}\n\nGenerate the PRD markdown only.`,
  });

  return NextResponse.json({ markdown: text });
}

