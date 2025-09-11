import { Response } from 'express';

export async function pipeOpenAIStreamToSSE(res: Response, stream: any, meta?: any) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content || '';
      if (delta) res.write(`data: ${escapeSSE(delta)}\n\n`);
    }
    if (meta) {
      res.write(`data: ${JSON.stringify({ meta })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e:any) {
    res.write(`data: ${JSON.stringify({ error: String(e?.message || e) })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}

function escapeSSE(s: string) {
  return s.replace(/\r?\n/g, '\\n');
}

