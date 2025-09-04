"use client";

import { SendHorizonal, ArrowLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function PrototypeChat({ onBack, headless }: { onBack?: () => void; headless?: boolean }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hi! Describe the wireframe you want. I’ll draft an interactive prototype." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState<"checking"|"online"|"offline">("checking");
  const [mode] = useState<'agent'|'openai'>('agent');
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages]);
  useEffect(()=>{
    let cancelled = false;
    async function ping() {
      try {
        const r = await fetch('/api/proto/' + (mode==='agent'?'agent':'chat'), { method: 'GET' });
        const j = await r.json();
        if (!cancelled) setOnline(j?.ok ? 'online' : 'offline');
      } catch { if (!cancelled) setOnline('offline'); }
    }
    ping();
    const id = setInterval(ping, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [mode]);

  async function doSend(text: string) {
    const payload = { prompt: text };
    try {
      const url = mode==='agent' ? '/api/proto/agent' : '/api/proto/chat';
      const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const bodyText = await r.text();
      let data: any = null; try { data = JSON.parse(bodyText); } catch {}
      if (!r.ok || !data) throw new Error(`bad_response ${r.status}: ${bodyText}`);
      if (data.kind === 'reply') {
        setMessages((m)=>[...m,{role:'assistant', text: String(data.text || '') || "I'm here to help build prototypes." }]);
        return;
      }
      // edit_prototype disabled in demo mode
      if (data.kind === 'code' && typeof data.html === 'string') {
        const html = String(data.html);
        try { sessionStorage.setItem('sandbox:html', html); } catch {}
        try { const ev = new CustomEvent('sandbox:open', { detail: { html } }); window.dispatchEvent(ev); } catch {}
        setMessages((m)=>[...m,{role:'assistant', text:'Opened a live app preview.'}]);
        return;
      }
      if (data.kind === 'edit_prd') {
        const id = `doc_${Math.random().toString(36).slice(2,8)}`;
        try { localStorage.setItem(`doc:${id}`, String(data.markdown || '')); } catch {}
        setMessages((m)=>[...m,{role:'assistant', text:'Opening PRD draft…'}]);
        try { window.location.assign(`/requirements/${id}`); } catch {}
        return;
      }
      setMessages((m)=>[...m,{role:'assistant', text:"I can draft wireframes or PRDs. Try: 'make a video app', 'add a sidebar', or 'make a PRD'."}]);
    } catch (e:any) {
      setMessages((m)=>[...m,{role:'assistant', text:`Network error calling /api/proto/chat: ${e?.message || e}.`}]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {!headless && (
        <div className="px-3 py-2 border-b border-white/10 bg-black/60 text-white flex items-center justify-between">
          <div className="font-medium inline-flex items-center gap-2">
            <button onClick={onBack} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5"/> Back to PRD</button>
            <span className="inline-flex items-center gap-2">
              Prototype Builder (AI)
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${online==='checking'?'bg-neutral-500 animate-pulse':online==='online'?'bg-emerald-500':'bg-rose-500'}`}
                title={online==='online'? 'Online' : online==='offline' ? 'Offline (check OPENAI_API_KEY)' : 'Checking…'}
                aria-label={online}
              />
            </span>
          </div>
          <div className="text-xs opacity-70">Deterministic demo (daisyUI)</div>
        </div>
      )}
      <div ref={listRef} className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
        {messages.map((m, i)=> (
          <div key={i} className={`max-w-[80%] rounded-lg border px-3 py-2 ${m.role==='assistant' ? 'ml-0 mr-auto bg-white/5 border-white/10' : 'ml-auto mr-0 bg-indigo-600/20 border-indigo-500/30'}`}>{m.text}</div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10 flex flex-col gap-2">
        <div className="text-xs opacity-60">Deterministic demo (daisyUI)</div>
        <div className="flex flex-wrap gap-2">
          {['Make coffee app','Add add-on flow','Write PRD','Go to cart','Go to signin'].map((s) => (
            <button
              key={s}
              disabled={busy}
              onClick={async ()=>{
                if (s === 'Write PRD') {
                  setMessages((m)=>[...m,{role:'assistant', text:'Drafting PRD…'}]);
                  try { window.dispatchEvent(new Event('editor:write_prd')); } catch {}
                  return;
                }
                setMessages((m)=>[...m,{role:'user', text:s}]); setBusy(true); await doSend(s);
              }}
              className={`px-2 py-1 rounded-md text-xs border ${busy?'bg-neutral-800/60 border-white/10 text-white/50':'bg-neutral-800 border-white/10 hover:bg-neutral-700'}`}
            >{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="e.g., Coffee app, Add sidebar, Add header, Go to signin" className="flex-1 px-3 py-2 rounded-md bg-neutral-800 border border-white/10"/>
          <button disabled={busy} onClick={async ()=>{
          const text = input.trim();
          if (!text) return;
          setMessages((m)=>[...m,{role:'user', text}]);
          setInput('');
          setBusy(true);
          await doSend(text);
        }} className={`px-3 py-2 rounded-md ${busy?'bg-indigo-600/50':'bg-indigo-600 hover:bg-indigo-500'} text-white inline-flex items-center gap-2`}>
          <SendHorizonal className="w-4 h-4"/>{busy?'Working…':'Send'}
        </button>
        </div>
      </div>
    </div>
  );
}
