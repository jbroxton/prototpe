import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';
export const openai = new OpenAI({ apiKey });

export async function embed(texts: string[], model = 'text-embedding-3-small'): Promise<number[][]> {
  const res = await openai.embeddings.create({ model, input: texts });
  return res.data.map(v => v.embedding as number[]);
}

export async function answer(prompt: string, system = 'You are Mozilla Firefox Product Expert. Prefer official sources and always add citations.'): Promise<string> {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2
  });
  return r.choices[0]?.message?.content || '';
}

