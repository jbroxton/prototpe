"use client";

export type CommentItem = {
  id: string;
  docId: string;
  from: number;
  to: number;
  snippet: string;
  text: string;
  resolved?: boolean;
  createdAt: number;
};

function key(docId: string) { return `comments:${docId}`; }

export function loadComments(docId: string): CommentItem[] {
  try { const v = sessionStorage.getItem(key(docId)); return v ? JSON.parse(v) as CommentItem[] : []; } catch { return []; }
}

export function saveComments(docId: string, list: CommentItem[]) {
  try { sessionStorage.setItem(key(docId), JSON.stringify(list)); } catch {}
  dispatchChanged(docId);
}

export function addComment(docId: string, c: Omit<CommentItem, 'id'|'createdAt'>) {
  const list = loadComments(docId);
  const item: CommentItem = { id: `c_${Math.random().toString(36).slice(2,8)}`, createdAt: Date.now(), ...c, docId };
  list.push(item);
  saveComments(docId, list);
}

export function updateComment(docId: string, id: string, patch: Partial<CommentItem>) {
  const list = loadComments(docId);
  const i = list.findIndex(x=>x.id===id); if (i>=0) { list[i] = { ...list[i], ...patch }; saveComments(docId, list); }
}

export function dispatchChanged(docId: string) {
  try { window.dispatchEvent(new CustomEvent('comments:changed', { detail: { docId } })); } catch {}
}


export function deleteComment(docId: string, id: string) {
  const list = loadComments(docId).filter(c => c.id !== id);
  saveComments(docId, list);
}
