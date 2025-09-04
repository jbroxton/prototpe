export function cosine(a: number[], b: number[]): number {
  let s = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length && i < b.length; i++) { s += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return s / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export function chunkText(text: string, size = 1000, overlap = 150): string[] {
  const parts: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + size);
    parts.push(text.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
    if (i >= text.length) break;
  }
  return parts;
}

