"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { role: "user"|"assistant"; text: string; citations?: { title: string; url?: string }[] };

export function ExpertChat({ onClose }: { onClose?: ()=>void }) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! Ask about Firefox (releases, prefs, docs)." }
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages]);

  async function send(text: string) {
    const q = text.trim(); if (!q) return;
    setMessages(m=>[...m,{role:'user', text:q}]);
    setBusy(true);
    try {
      const r = await fetch('/api/expert/query', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ q }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error||('http_'+r.status));
      setMessages(m=>[...m,{role:'assistant', text:String(j.answer||''), citations:j.citations||[]}]);
    } catch(e:any) {
      setMessages(m=>[...m,{role:'assistant', text:`Error: ${e?.message||e}`}]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-6 bottom-6 w-[380px] max-h-[70vh] rounded-xl border border-white/10 bg-neutral-900/95 backdrop-blur shadow-2xl flex flex-col z-50">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm">Firefox Product Expert</div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Online"/>
          <button onClick={()=>{ setOpen(false); onClose?.(); }} className="px-2 py-1 rounded-md border border-white/10 text-xs bg-neutral-800">Close</button>
        </div>
      </div>
      <div ref={listRef} className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
        {messages.map((m, i)=> (
          <div key={i} className={`max-w-[90%] rounded-lg border px-3 py-2 text-sm whitespace-pre-wrap ${m.role==='assistant' ? 'ml-0 mr-auto bg-white/5 border-white/10' : 'ml-auto mr-0 bg-indigo-600/20 border-indigo-500/30'}`}> 
            <div>{m.text}</div>
            {m.citations && m.citations.length>0 && (
              <div className="mt-2 text-xs opacity-80 space-y-1">
                {m.citations.slice(0,4).map((c, ci)=> (
                  <div key={ci}>• <a className="underline" href={c.url} target="_blank" rel="noreferrer">{c.title}</a></div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10 flex items-center gap-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') { const v=input; setInput(''); send(v);} }} placeholder="Ask about Firefox…" className="flex-1 px-3 py-2 rounded-md bg-neutral-800 border border-white/10"/>
        <button disabled={busy} onClick={()=>{ const v=input; setInput(''); send(v); }} className={`px-3 py-2 rounded-md ${busy?'bg-indigo-600/50':'bg-indigo-600 hover:bg-indigo-500'} text-white text-sm`}>{busy?'…':'Send'}</button>
      </div>
    </div>
  );
}

