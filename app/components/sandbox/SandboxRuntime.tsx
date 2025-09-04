"use client";

import { useEffect, useMemo, useRef } from "react";

export function SandboxRuntime({ html, onClose, chromeless = true }: { html: string; onClose?: ()=>void; chromeless?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);

  const srcdoc = useMemo(()=>{
    const tailwindCdn = 'https://cdn.tailwindcss.com';
    const cssDaisy = 'https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css';
    const csp = "default-src 'none'; style-src 'unsafe-inline' https:; img-src data: https:; script-src 'unsafe-inline' https:";
    // Embed initial content snapshot for iframe
    const initial = String(html || '');
    return `<!DOCTYPE html><html data-theme="dim"><head><meta charset="utf-8"/><meta http-equiv="Content-Security-Policy" content="${csp}"><script src="${tailwindCdn}"></script><link rel="stylesheet" href="${cssDaisy}"><style>html,body,#root{height:100%} #root{width:100%;overflow:auto} body{background:#0b0b0b;color:#e5e7eb} .screen{display:none} .screen.active{display:block} .mockup-phone{width:min(420px,100%);height:100%;margin-left:auto;margin-right:auto} .mockup-phone .display{height:100%;overflow-y:auto} .mockup-window{max-width:1200px;margin-left:auto;margin-right:auto}</style></head><body><div id="root"><div class="mockup-phone"><div class="camera"></div><div id="device-display" class="display bg-base-100"></div></div></div><script>
(function(){
  const initial = ${JSON.stringify(String(html||''))};
  const allowedTags = new Set(['div','section','header','main','nav','button','a','ul','li','img','span','p','h1','h2','h3','h4','input','label','dialog']);
  const allowedAttrs = new Set(['class','id','href','type','value','placeholder','for','tabindex','name','checked']);
  function sanitize(node){
    if(node.nodeType===1){
      const tag = node.tagName.toLowerCase();
      if(!allowedTags.has(tag)){ node.remove(); return null; }
      [...node.attributes].forEach(a=>{
        const n=a.name.toLowerCase(); const v=a.value||'';
        if(n.startsWith('data-')||n.startsWith('aria-')) return;
        if(n==='href' && v.startsWith('#')) return;
        if(!allowedAttrs.has(n)){ node.removeAttribute(a.name); }
        if(n.startsWith('on')) node.removeAttribute(a.name);
      });
    }
    const children=[...node.childNodes];
    for(const c of children){ if(c.nodeType===1) sanitize(c); if(c.nodeType===8) c.remove(); }
    return node;
  }
  function mount(html){
    const device = document.getElementById('device-display');
    if(!device) return;
    const inner = document.createElement('div');
    inner.id = 'inner';
    inner.className = 'w-full h-full';
    inner.innerHTML = html;
    device.innerHTML = '';
    device.appendChild(inner);
    sanitize(inner);
    // screens + navigation
    const screens = Array.from(document.querySelectorAll('[data-screen]'));
    function show(id){ screens.forEach(el=>{ el.classList.toggle('active', String(el.getAttribute('data-screen'))===id); }); }
    if(screens.length){ show(String(screens[0].getAttribute('data-screen'))); }
    document.querySelectorAll('[data-nav]').forEach(el=>{ el.addEventListener('click', e=>{ e.preventDefault(); const id=String(el.getAttribute('data-nav')||''); if(id) show(id); }); });
    document.querySelectorAll('a[href^="#"]').forEach(el=>{ el.addEventListener('click', e=>{ const href = el.getAttribute('href')||''; if(href.startsWith('#')){ e.preventDefault(); const id = href.slice(1); if(id) show(id); } }); });
    // modal open/close helpers (Daisy dialog)
    document.querySelectorAll('[data-open]').forEach(el=>{ el.addEventListener('click', e=>{ e.preventDefault(); const id = String(el.getAttribute('data-open')||'').replace('#',''); const dlg = id? document.getElementById(id) : null; if(dlg && 'showModal' in dlg) { (dlg).showModal(); } }); });
    document.querySelectorAll('[data-close]').forEach(el=>{ el.addEventListener('click', e=>{ e.preventDefault(); const sel = String(el.getAttribute('data-close')||''); const target = sel? document.querySelector(sel) : (el.closest('dialog')); if(target && 'close' in target) { (target).close(); } }); });
    // cart store: badge, list, total
    let count = 0; const items = [];
    const badgeEls = document.querySelectorAll('[data-cart-badge],[data-cart-count]');
    const listEl = document.querySelector('[data-cart-list]');
    const totalEl = document.querySelector('[data-cart-total]');
    function currency(n){ try{ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);}catch{return '$'+Number(n||0).toFixed(2);} }
    function update(){
      badgeEls.forEach(el=> el.textContent = String(count));
      if(listEl){ listEl.innerHTML = items.length? '' : '<li class="disabled"><a>Cart is empty</a></li>'; items.forEach(it=>{ const li=document.createElement('li'); li.innerHTML = '<a>'+it.name+' <span class="ml-auto">'+currency(it.price)+'</span></a>'; listEl.appendChild(li); }); }
      if(totalEl){ const sum = items.reduce((a,b)=> a+(Number(b.price)||0),0); totalEl.textContent = currency(sum); }
    }
    document.querySelectorAll('[data-add]').forEach(el=>{ el.addEventListener('click', e=>{ e.preventDefault(); count++; const name = el.getAttribute('data-item') || el.getAttribute('data-add') || 'Item'; const price = parseFloat(el.getAttribute('data-price')||'0')||0; items.push({ name, price }); update(); }); });
    document.querySelectorAll('[data-clear-cart]').forEach(el=>{ el.addEventListener('click', e=>{ e.preventDefault(); count=0; items.length=0; update(); }); });
    document.querySelectorAll('[data-place-order]').forEach(el=>{ el.addEventListener('click', e=>{ e.preventDefault(); count=0; items.length=0; update(); show('menu'); }); });
    update();
  }
  window.addEventListener('message', (ev)=>{ if(ev.data && ev.data.__html){ mount(ev.data.__html.slice(0, 20000)); } });
  if (initial) { mount(initial.slice(0, 20000)); } else {
    mount('<div class="w-full h-full grid place-items-center text-base-content/60"><div><div class="text-sm text-center">App preview</div><div class="text-xs opacity-60 text-center">Describe a wireframe in chat</div></div></div>');
  }
})();
</script></body></html>`;
  }, [html]);

  // On html change, re-send into iframe (and the srcdoc also re-renders via memo deps)
  useEffect(()=>{
    const f = ref.current; if (!f || !html) return;
    try { f.contentWindow?.postMessage({ __html: html }, '*'); } catch {}
  }, [html]);

  return (
    <div className="h-full w-full flex flex-col">
      {!chromeless && (
        <div className="px-3 py-2 border-b border-white/10 text-xs flex items-center justify-between">
          <div className="opacity-70">Sandbox App (daisyUI)</div>
          {onClose && <button className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800" onClick={onClose}>Close</button>}
        </div>
      )}
      <iframe ref={ref} className="flex-1 w-full bg-black" sandbox="allow-scripts" srcDoc={srcdoc} />
    </div>
  );
}
