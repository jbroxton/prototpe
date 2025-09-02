"use client";

import { SendHorizonal, ArrowLeft } from "lucide-react";
import type { Scene } from "./wireframe/SceneTypes";
import type { Op } from "./wireframe/ops";
import { useRef, useState, useEffect } from "react";

export function PrototypeChat({ onBack, headless, onGenerateScene, onApplyOps, scene }: { onBack?: () => void; headless?: boolean; onGenerateScene?: (scene: Scene) => void; onApplyOps?: (ops: Op[]) => void; scene?: Scene }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hi! Describe the wireframe you want. I’ll draft an interactive prototype." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {!headless && (
        <div className="px-3 py-2 border-b border-white/10 bg-black/60 text-white flex items-center justify-between">
          <div className="font-medium inline-flex items-center gap-2">
            <button onClick={onBack} className="px-2 py-1 rounded-md border border-white/10 bg-neutral-800 text-xs inline-flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5"/> Back to PRD</button>
            <span>Prototype Builder (AI)</span>
          </div>
          <div className="text-xs opacity-70">Wireframe only · Interactive</div>
        </div>
      )}
      <div ref={listRef} className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
        {messages.map((m, i)=> (
          <div key={i} className={`max-w-[80%] rounded-lg border px-3 py-2 ${m.role==='assistant' ? 'ml-0 mr-auto bg-white/5 border-white/10' : 'ml-auto mr-0 bg-indigo-600/20 border-indigo-500/30'}`}>{m.text}</div>
        ))}
      </div>
      <div className="p-3 border-t border-white/10 flex items-center gap-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="e.g., Make a coffee ordering app" className="flex-1 px-3 py-2 rounded-md bg-neutral-800 border border-white/10"/>
        <button onClick={async ()=>{
          const text = input.trim();
          if (!text) return;
          setMessages((m)=>[...m,{role:'user', text}]);
          setInput('');
          // Generate PRD command (simple detection)
          if (/\bmake\b.*\bprd\b/i.test(text) || /\bcreate\b.*\bprd\b/i.test(text)) {
            try {
              const summary = scene ? buildSceneSummary(scene) : 'Empty prototype';
              const r = await fetch('/api/proto/prd', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sceneSummary: summary }) });
              if (r.ok) {
                const data = await r.json();
                setMessages((m)=>[...m,{role:'assistant', text:`Here is a PRD draft based on your prototype:\n\n${data.markdown}` }]);
                return;
              }
            } catch {}
          }
          try {
            const r = await fetch('/api/proto/ops', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt: text, device:'mobile' }) });
            if (r.ok) {
              const data = await r.json();
              onApplyOps?.(data.ops as Op[]);
              setMessages((m)=>[...m,{role:'assistant', text:`Done. Applied ${Array.isArray(data.ops)?data.ops.length:0} changes.`}]);
              return;
            }
          } catch {}
          // Fallback: legacy keyword demos if the API is not configured
          if (/coffee|order\s+coffee|coffee\s+app/i.test(text)) {
            const ops: Op[] = [
              { op:'setDevice', device:'mobile' },
              { op:'addScreen', id:'home', name:'Home', appbarTitle:'Coffee' },
              { op:'addBlock', screenId:'home', region:'content', block:{
                type:'Tabs',
                tabs:[ {id:'menu',label:'Menu'}, {id:'featured',label:'Featured'}, {id:'cart',label:'Cart'} ],
                activeId:'menu',
                panels:{
                  menu:[ { type:'List', rows:4 }, { type:'Button', label:'Filter', open:'drawer' }, { type:'Button', label:'View Latte', linkTo:'details' } ],
                  featured:[ { type:'Card' }, { type:'Card' } ],
                  cart:[ { type:'Text', variant:'title', text:'Cart is empty' } ]
                }
              } },
              { op:'setDrawer', screenId:'home', blocks:[ { type:'Text', variant:'title', text:'Filters' }, { type:'List', rows:3 } ] },
              { op:'addScreen', id:'details', name:'Details', appbarTitle:'Latte' },
              { op:'addBlock', screenId:'details', region:'content', block:{ type:'Card', title:'Latte', lines:3 } },
              { op:'addBlock', screenId:'details', region:'content', block:{ type:'Button', label:'Add to Cart', linkTo:'checkout' } },
              { op:'addScreen', id:'checkout', name:'Checkout', appbarTitle:'Checkout' },
              { op:'addBlock', screenId:'checkout', region:'content', block:{ type:'Text', variant:'title', text:'Total: $4.50' } },
              { op:'addBlock', screenId:'checkout', region:'content', block:{ type:'Button', label:'Pay', linkTo:'confirmation' } },
              { op:'addScreen', id:'confirmation', name:'Confirmation', appbarTitle:'Done' },
              { op:'addBlock', screenId:'confirmation', region:'content', block:{ type:'Text', variant:'title', text:'Order confirmed' } },
              { op:'addBlock', screenId:'confirmation', region:'content', block:{ type:'Button', label:'Back to Home', linkTo:'home' } },
            ];
            onApplyOps?.(ops);
            const scene: Scene = {
              device: 'mobile',
              screens: [
                { id:'home', name:'Home', regions:{
                  appbar:{ title:'Coffee' },
                  content:{ blocks:[ {
                    type:'Tabs',
                    tabs:[ {id:'menu',label:'Menu'}, {id:'featured',label:'Featured'}, {id:'cart',label:'Cart'} ],
                    activeId:'menu',
                    panels:{
                      menu:[ { type:'List', rows:4 }, { type:'Button', label:'Filter', open:'drawer' }, { type:'Button', label:'View Latte', linkTo:'details' } ],
                      featured:[ { type:'Card' }, { type:'Card' } ],
                      cart:[ { type:'Text', variant:'title', text:'Cart is empty' } ]
                    }
                  } ] },
                  drawer:{ blocks:[ { type:'Text', variant:'title', text:'Filters' }, { type:'List', rows:3 } ] }
                }},
                { id:'details', name:'Details', regions:{
                  appbar:{ title:'Latte' },
                  content:{ blocks:[ { type:'Card', title:'Latte', lines:3 }, { type:'Button', label:'Add to Cart', linkTo:'checkout' } ] }
                }},
                { id:'checkout', name:'Checkout', regions:{
                  appbar:{ title:'Checkout' },
                  content:{ blocks:[ { type:'Text', variant:'title', text:'Total: $4.50' }, { type:'Button', label:'Pay', linkTo:'confirmation' } ] }
                }},
                { id:'confirmation', name:'Confirmation', regions:{
                  appbar:{ title:'Done' },
                  content:{ blocks:[ { type:'Text', variant:'title', text:'Order confirmed' }, { type:'Button', label:'Back to Home', linkTo:'home' } ] }
                }},
              ]
            };
            onGenerateScene?.(scene);
            setMessages((m)=>[...m,{role:'assistant', text:'Done. Created a simple coffee ordering prototype.'}]);
          } else if (/\badd\b.*\bsidebar\b/i.test(text)) {
            // Add a sidebar to common coffee app screens
            const ops: Op[] = [
              { op:'ensureSidebar', screenId:'home', items:[ {id:'home',label:'Home',linkTo:'home'}, {id:'details',label:'Details',linkTo:'details'}, {id:'checkout',label:'Checkout',linkTo:'checkout'} ] },
              { op:'ensureSidebar', screenId:'details', items:[ {id:'home',label:'Home',linkTo:'home'}, {id:'details',label:'Details',linkTo:'details'}, {id:'checkout',label:'Checkout',linkTo:'checkout'} ] },
              { op:'ensureSidebar', screenId:'checkout', items:[ {id:'home',label:'Home',linkTo:'home'}, {id:'details',label:'Details',linkTo:'details'}, {id:'checkout',label:'Checkout',linkTo:'checkout'} ] },
              { op:'ensureSidebar', screenId:'confirmation', items:[ {id:'home',label:'Home',linkTo:'home'} ] },
            ];
            onApplyOps?.(ops);
            setMessages((m)=>[...m,{role:'assistant', text:'Added a sidebar to the app. On mobile, open it from the top left menu.'}]);
          } else if (/web|sidebar|dashboard/i.test(text)) {
            const ops: Op[] = [
              { op:'setDevice', device:'web' },
              { op:'addScreen', id:'dashboard', name:'Dashboard', appbarTitle:'Dashboard', layout:'appbar+sidebar' },
              { op:'ensureSidebar', screenId:'dashboard', items:[ {id:'home',label:'Home', linkTo:'dashboard'}, {id:'orders',label:'Orders', linkTo:'orders'} ] },
              { op:'addBlock', screenId:'dashboard', region:'content', block:{ type:'Tabs', tabs:[{id:'t1',label:'Tab'},{id:'t2',label:'Tab'},{id:'t3',label:'Tab'}], activeId:'t1' } },
              { op:'addBlock', screenId:'dashboard', region:'content', block:{ type:'Card' } },
              { op:'addBlock', screenId:'dashboard', region:'content', block:{ type:'Card' } },
              { op:'addScreen', id:'orders', name:'Orders', appbarTitle:'Orders', layout:'appbar+sidebar' },
              { op:'ensureSidebar', screenId:'orders', items:[ {id:'back',label:'Back', linkTo:'dashboard'} ] },
              { op:'addBlock', screenId:'orders', region:'content', block:{ type:'List', rows:6 } },
            ];
            onApplyOps?.(ops);
            const scene: Scene = {
              device: 'web',
              screens: [
                { id:'dashboard', name:'Dashboard', regions:{
                  appbar:{ title:'Dashboard' },
                  sidebar:{ items:[ {id:'home', label:'Home', linkTo:'dashboard'}, {id:'orders', label:'Orders', linkTo:'orders'} ] },
                  content:{ blocks:[ { type:'Tabs', tabs:[{id:'tab1',label:'Tab'},{id:'tab2',label:'Tab'},{id:'tab3',label:'Tab'}], activeId:'tab1' }, { type:'Card' }, { type:'Card' } ] }
                }},
                { id:'orders', name:'Orders', regions:{
                  appbar:{ title:'Orders' },
                  sidebar:{ items:[ {id:'back', label:'Back', linkTo:'dashboard'} ] },
                  content:{ blocks:[ { type:'List', rows:6 } ] }
                }},
              ]
            };
            onGenerateScene?.(scene);
            setMessages((m)=>[...m,{role:'assistant', text:'Done. Created a simple web layout with sidebar.'}]);
          } else {
            setMessages((m)=>[...m,{role:'assistant', text:"I can draft mobile/web wireframes. Try: 'make a coffee ordering app'."}]);
          }
        }} className="px-3 py-2 rounded-md bg-indigo-600 text-white inline-flex items-center gap-2"><SendHorizonal className="w-4 h-4"/>Send</button>
      </div>
    </div>
  );
}

function buildSceneSummary(scene: Scene): string {
  const lines: string[] = [];
  lines.push(`Device: ${scene.device}`);
  for (const sc of scene.screens) {
    lines.push(`Screen: ${sc.id} (${sc.name})`);
    if (sc.regions.appbar?.title) lines.push(`  AppBar: ${sc.regions.appbar.title}`);
    if (sc.regions.sidebar?.items?.length) lines.push(`  Sidebar: ${sc.regions.sidebar.items.map(i=>i.label).join(', ')}`);
    lines.push(`  Content blocks:`);
    for (const b of sc.regions.content.blocks) {
      if (b.type === 'Text') lines.push(`    - Text(${b.variant})`);
      else if (b.type === 'Button') lines.push(`    - Button(label="${b.label}"${b.linkTo?`, linkTo=${b.linkTo}`:''}${b.open?`, open=${b.open}`:''})`);
      else if (b.type === 'List') lines.push(`    - List(rows=${b.rows})`);
      else if (b.type === 'Card') lines.push(`    - Card(${b.title||'card'})`);
      else if (b.type === 'Tabs') lines.push(`    - Tabs(${b.tabs.map(t=>t.label).join('/')})`);
    }
    if (sc.regions.drawer?.blocks?.length) lines.push(`  Drawer: ${sc.regions.drawer.blocks.length} blocks`);
  }
  return lines.join('\n');
}
