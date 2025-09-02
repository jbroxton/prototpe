import { NextRequest, NextResponse } from 'next/server';
import { tool, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { OpsSchema } from '@/app/lib/proto/ops.schema';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { prompt, device = 'mobile' } = await req.json();

  const system = [
    'You are a UI wireframe generator.',
    'Use only the generate_ops tool. Return a tidy sequence of operations (Ops[]) to create or edit the prototype.',
    'Defaults reasonable. Mobile-first. Max 3 screens, 25 ops. Prefer simple stacked layouts and short labels.',
    `Target device: ${device}.`,
    'Available blocks: Text, Button, Input, List, Card, NavBar, Tabs.',
    'For navigation, set Button.block.linkTo to the target screen id. To open a filter, set Button.block.open to "drawer".',
  ].join(' ');

  const result = await streamText({
    model: openai(process.env.MODEL || 'gpt-4o-mini'),
    system,
    prompt,
    tools: {
      generate_ops: tool({
        description: 'Generate operations to modify the scene (Ops[])',
        parameters: OpsSchema as any,
        // We do not execute server-side; just echo back the ops
        execute: async (ops) => ({ ops }),
      }),
    },
  });

  const toolResults: any[] = [];
  for await (const part of result.fullStream) {
    if (part.type === 'tool-result' && (part as any).toolName === 'generate_ops') toolResults.push((part as any).result);
  }
  const last = toolResults.at(-1);
  if (!last || !last.ops) return NextResponse.json({ error: 'No ops produced' }, { status: 400 });

  return NextResponse.json({ ops: last.ops });
}
