export type DocChunk = {
  id: string;
  title: string;
  url?: string;
  kind: 'docs' | 'code' | 'release' | 'bug';
  text: string;
  embeddings?: number[];
};

export type IndexFile = {
  createdAt: string;
  model: string;
  chunks: DocChunk[];
};

