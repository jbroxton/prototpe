import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const runtime = 'edge';

// Intents returned by the model (high-level) — mapped to renderer ops server-side
const DeviceZ = z.enum(['mobile', 'tablet', 'web']);
const RegionZ = z.enum(['content', 'drawer']);
const TabsItemZ = z.object({ id: z.string(), label: z.string() });

const IntentZ = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('setDevice'), device: DeviceZ }),
  z.object({
    intent: z.literal('ensureScreen'),
    id: z.string(),
    name: z.string().optional(),
    appbarTitle: z.string().optional(),
    layout: z.enum(['appbar-only', 'appbar+sidebar']).optional(),
  }),
  z.object({ intent: z.literal('ensureHeader'), screenId: z.string(), title: z.string() }),
  z.object({
    intent: z.literal('ensureSidebar'),
    screenId: z.string(),
    items: z
      .array(z.object({ id: z.string(), label: z.string(), linkTo: z.string().optional() }))
      .max(20)
      .optional(),
  }),
  z.object({
    intent: z.literal('addText'),
    screenId: z.string(),
    region: RegionZ,
    variant: z.enum(['title', 'body']),
    text: z.string().optional(),
  }),
  z.object({
    intent: z.literal('addButton'),
    screenId: z.string(),
    region: RegionZ,
    label: z.string(),
    linkTo: z.string().optional(),
    open: z.enum(['drawer']).optional(),
  }),
  z.object({ intent: z.literal('addImage'), screenId: z.string(), region: RegionZ, title: z.string().optional() }),
  z.object({ intent: z.literal('addPlaceholder'), screenId: z.string(), region: RegionZ, label: z.string() }),
  z.object({
    intent: z.literal('ensureTabs'),
    screenId: z.string(),
    tabs: z.array(TabsItemZ).min(2).max(6),
    activeId: z.string().optional(),
  }),
  z.object({ intent: z.literal('setTheme'), theme: z.enum(['light','dark']) }),
  z.object({ intent: z.literal('setBlock'), screenId: z.string(), region: RegionZ.optional(), index: z.number().int().nonnegative(), patch: z.object({}).passthrough() }),
  z.object({ intent: z.literal('moveBlock'), screenId: z.string(), region: RegionZ.optional(), fromIndex: z.number().int().nonnegative(), toIndex: z.number().int().nonnegative() }),
  z.object({
    intent: z.literal('patchBlocks'),
    screenId: z.string().optional(),
    match: z
      .object({ type: z.string().optional(), labelContains: z.string().optional() })
      .optional(),
    patch: z.object({}).passthrough(),
  }),
  z.object({
    intent: z.literal('link'),
    fromScreenId: z.string(),
    toScreenId: z.string(),
    label: z.string().optional(),
  }),
]);

// Root must be an object for function-calling JSON schema
const ChatSchema = z.object({
  kind: z.enum(['reply', 'edit_prototype', 'edit_prd', 'code']),
  text: z.string().optional(),
  // Be permissive at the boundary; we will normalize/validate server-side
  intents: z.array(z.object({}).passthrough()).max(60).optional(),
  markdown: z.string().optional(),
  // Accept direct ops if the model provides them; we still prefer intents
  ops: z.array(z.object({}).passthrough()).max(60).optional(),
  // Optional code mode (hidden UI runtime)
  language: z.string().optional(),
  html: z.string().optional(),
});

// Types of renderer ops we return to the client
type Op =
  | { op: 'setDevice'; device: z.infer<typeof DeviceZ> }
  | { op: 'setTheme'; theme: 'light'|'dark' }
  | { op: 'addScreen'; id: string; name: string; layout?: 'appbar-only' | 'appbar+sidebar'; appbarTitle?: string }
  | { op: 'setAppbarTitle'; screenId: string; title: string }
  | { op: 'ensureSidebar'; screenId: string; items: { id: string; label: string; linkTo?: string }[] }
  | { op: 'addBlock'; screenId: string; region: 'content' | 'drawer'; block: any }
  | { op: 'setDrawer'; screenId: string; blocks: any[] }
  | { op: 'setBlock'; screenId: string; region: 'content'|'drawer'; index: number; patch: any }
  | { op: 'moveBlock'; screenId: string; region?: 'content'|'drawer'; fromIndex: number; toIndex: number }
  | { op: 'patchBlocks'; screenId?: string; match?: any; patch: any };

export async function POST(req: NextRequest) {
  const { prompt, device = 'mobile', sceneSummary } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not set. Add it to your Vercel env and redeploy.' },
      { status: 500 }
    );
  }

  const system = [
    'You are an app prototyping assistant. Always return exactly ONE JSON object. No prose.',
    'Output schema: { kind, language?, html?, text?, intents?, markdown? }',
    'Primary mode: return a ready-to-render daisyUI HTML app → { kind:"code", language:"daisyui-html", html:"<…>" }.',
    'Hard requirements for daisyUI HTML:',
    '- Use ONLY daisyUI/Tailwind classes. NO <script>, NO <style>, NO inline styles.',
    '- Frame the app with a device mock: mockup-phone (mobile) or mockup-window (desktop).',
    '- Provide two sections: <section data-screen="menu"> and <section data-screen="cart">.',
    '- Navigation: elements with data-nav="cart" and data-nav="menu" to switch screens.',
    '- Navbar includes a cart button with <span data-cart-badge>0</span>.',
    '- Menu: responsive grid with AT LEAST 6 cards → grid gap-4 md:grid-cols-2 lg:grid-cols-3. Each card uses card bg-base-200 shadow-xl and contains title, short description, price, and <button class="btn btn-primary btn-sm" data-add data-item data-price>.',
    '- Cart: include <ul data-cart-list></ul> and <span data-cart-total></span>, plus Back (data-nav="menu") and Checkout buttons (optional Clear: data-clear-cart).',
    '- Mobile-first, dark theme; use p-4 md:p-6, gap-4, divider; avoid fixed heights/widths so content scrolls.',
    'Example shape (HTML snippet inside html key): <div class=\\"mockup-phone\\"><div class=\\"display bg-base-100\\"><header class=\\"navbar bg-base-200 sticky top-0 z-10\\">…<span data-cart-badge>0</span>…</header><main class=\\"p-4 md:p-6\\"><section data-screen=\\"menu\\"><div class=\\"grid gap-4 md:grid-cols-2 lg:grid-cols-3\\">…6+ cards…</div></section><section data-screen=\\"cart\\"><ul data-cart-list></ul><span data-cart-total></span></section></main></div></div>',
    'Secondary modes (only if explicitly requested by the user):',
    '- Small wireframe edits → kind=edit_prototype with minimal intents.',
    '- PRD → kind=edit_prd with concise Markdown.',
    `Device context: ${device}. Prefer mobile (mockup-phone) unless the user says desktop (mockup-window).`,
    sceneSummary ? `Prototype summary for context:\n${String(sceneSummary).slice(0, 4000)}` : '',
  ].filter(Boolean).join('\n');

  try {
    const { object } = await generateObject({
      model: openai(process.env.MODEL || 'gpt-4o-mini'),
      system,
      prompt,
      schema: ChatSchema,
    });
    // Post-validate required fields by kind
    if (object.kind === 'reply') {
      const text = object.text || "I'm here to help build prototypes.";
      return NextResponse.json({ kind: 'reply', text });
    }
    if (object.kind === 'edit_prd') {
      const markdown = object.markdown || '## PRD\n\n_TODO: model returned no markdown_';
      return NextResponse.json({ kind: 'edit_prd', markdown });
    }
    // Optional: code mode passthrough (daisyUI HTML)
    if (object.kind as any === 'code' || (object.language && object.html)) {
      const lang = String(object.language || 'daisyui-html');
      let html = String(object.html || '');
      if (lang === 'daisyui-html') {
        if (!isGoodDaisyApp(html)) {
          html = buildCoffeeAppHtml();
        }
        return NextResponse.json({ kind: 'code', language: 'daisyui-html', html });
      }
      return NextResponse.json({ kind: 'code', language: lang, html });
    }
    // edit_prototype
    // Prefer intents → ops mapping; but accept direct ops if provided
    let ops: Op[] | undefined;
    if (Array.isArray(object.ops) && object.ops.length > 0) {
      ops = normalizeOps(object.ops as any[]);
    }
    if (!ops || ops.length === 0) {
      const intentsRaw = Array.isArray(object.intents) ? object.intents : [];
      const intents = intentsRaw.map(coerceIntent).filter(Boolean) as z.infer<typeof IntentZ>[];
      ops = mapIntentsToOps(intents);
    }
    // Last-resort fallback: known templates from the prompt
    if (!ops || ops.length === 0) {
      const ptxt = String(prompt || '').toLowerCase();
      if (/add\s+sidebar/.test(ptxt)) {
        const html = buildCoffeeAppWithSidebarHtml();
        return NextResponse.json({ kind: 'code', language: 'daisyui-html', html });
      }
      if (/add\s+header/.test(ptxt)) {
        const html = buildCoffeeAppWithHeaderHtml();
        return NextResponse.json({ kind: 'code', language: 'daisyui-html', html });
      }
      if (/coffee|menu|signin|cart/.test(ptxt)) {
        const html = buildCoffeeAppHtml();
        return NextResponse.json({ kind: 'code', language: 'daisyui-html', html });
      }
      ops = templateOpsFromPrompt(String(prompt || ''), String(device || 'mobile'));

    }
    return NextResponse.json({ kind: 'edit_prototype', ops });
  } catch (err: any) {
    return NextResponse.json(
      {
        kind: 'reply',
        text:
          err?.message ||
          'I had trouble understanding that. Try prompts like "make a video app", "add a sidebar", "add a header", or "make a PRD from this prototype".',
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const model = process.env.MODEL || 'gpt-4o-mini';
  return NextResponse.json({ ok: hasKey, hasKey, model });
}

function mapIntentsToOps(intents: z.infer<typeof IntentZ>[]): Op[] {
  const ops: Op[] = [];

  for (const it of intents) {
    switch (it.intent) {
      case 'setDevice':
        ops.push({ op: 'setDevice', device: it.device });
        break;
      case 'ensureScreen': {
        const name = it.name || it.id;
        ops.push({ op: 'addScreen', id: it.id, name, layout: it.layout, appbarTitle: it.appbarTitle || name });
        break;
      }
      case 'ensureHeader':
        ops.push({ op: 'setAppbarTitle', screenId: it.screenId, title: it.title });
        break;
      case 'ensureSidebar': {
        const items = (it.items && it.items.length > 0)
          ? it.items
          : [
              { id: 'home', label: 'Home', linkTo: 'home' },
              { id: 'details', label: 'Details', linkTo: 'details' },
            ];
        ops.push({ op: 'ensureSidebar', screenId: it.screenId, items });
        break;
      }
      case 'addText':
        ops.push({ op: 'addBlock', screenId: it.screenId, region: it.region, block: { type: 'Text', variant: it.variant, text: it.text } });
        break;
      case 'addButton':
        ops.push({ op: 'addBlock', screenId: it.screenId, region: it.region, block: { type: 'Button', label: it.label, linkTo: it.linkTo, open: it.open } });
        break;
      case 'addImage':
        ops.push({ op: 'addBlock', screenId: it.screenId, region: it.region, block: { type: 'Image', title: it.title } });
        break;
      case 'addPlaceholder':
        ops.push({ op: 'addBlock', screenId: it.screenId, region: it.region, block: { type: 'Placeholder', label: it.label } });
        break;
      case 'ensureTabs':
        ops.push({ op: 'addBlock', screenId: it.screenId, region: 'content', block: { type: 'Tabs', tabs: it.tabs, activeId: it.activeId } });
        break;
      case 'patchBlocks':
        ops.push({ op: 'patchBlocks', screenId: it.screenId, match: it.match as any, patch: it.patch as any } as any);
        break;
      case 'link': {
        const label = it.label || 'Open';
        ops.push({ op: 'addBlock', screenId: it.fromScreenId, region: 'content', block: { type: 'Button', label, linkTo: it.toScreenId } });
        break;
      }
    }
  }

  return ops;
}

function coerceIntent(x: any): z.infer<typeof IntentZ> | null {
  if (!x || typeof x !== 'object') return null;
  const intent = String(x.intent || '').trim();
  switch (intent) {
    case 'setTheme': {
      const theme = x.theme === 'light' ? 'light' : 'dark';
      return { intent:'setTheme', theme } as any;
    }
    case 'setDevice': {
      const device = (x.device === 'web' || x.device === 'tablet') ? x.device : 'mobile';
      return { intent: 'setDevice', device } as any;
    }
    case 'setBlock': {
      const screenId = String(x.screenId || '').trim();
      const region = x.region === 'drawer' ? 'drawer' : 'content';
      const index = Number.isFinite(x.index) ? Number(x.index) : 0;
      const patch = (x.patch && typeof x.patch === 'object') ? x.patch : {};
      if (!screenId) return null;
      return { intent:'setBlock', screenId, region, index, patch } as any;
    }
    case 'moveBlock': {
      const screenId = String(x.screenId || '').trim();
      const region = x.region === 'drawer' ? 'drawer' : 'content';
      const fromIndex = Number.isFinite(x.fromIndex) ? Number(x.fromIndex) : 0;
      const toIndex = Number.isFinite(x.toIndex) ? Number(x.toIndex) : 0;
      if (!screenId) return null;
      return { intent:'moveBlock', screenId, region, fromIndex, toIndex } as any;
    }
    case 'ensureScreen': {
      const id = String(x.id || x.screenId || '').trim() || inferId(String(x.name || 'home'));
      const name = String(x.name || id);
      const layout = x.layout === 'appbar+sidebar' ? 'appbar+sidebar' : (x.layout === 'appbar-only' ? 'appbar-only' : undefined);
      const appbarTitle = typeof x.appbarTitle === 'string' ? x.appbarTitle : undefined;
      if (!id) return null;
      return { intent: 'ensureScreen', id, name, layout, appbarTitle } as any;
    }
    case 'ensureHeader': {
      const screenId = String(x.screenId || x.id || '').trim();
      const title = String(x.title || '').trim();
      if (!screenId || !title) return null;
      return { intent: 'ensureHeader', screenId, title } as any;
    }
    case 'ensureSidebar': {
      const screenId = String(x.screenId || x.id || '').trim();
      const items = Array.isArray(x.items) ? x.items.filter(Boolean).map((it: any) => ({
        id: String(it.id || inferId(String(it.label || 'Item'))),
        label: String(it.label || 'Item'),
        linkTo: typeof it.linkTo === 'string' ? it.linkTo : undefined,
      })) : undefined;
      if (!screenId) return null;
      return { intent: 'ensureSidebar', screenId, items } as any;
    }
    case 'addText': {
      const screenId = String(x.screenId || x.id || '').trim();
      const region = x.region === 'drawer' ? 'drawer' : 'content';
      const variant = x.variant === 'title' ? 'title' : 'body';
      const text = typeof x.text === 'string' ? x.text : undefined;
      if (!screenId) return null;
      return { intent: 'addText', screenId, region, variant, text } as any;
    }
    case 'addButton': {
      const screenId = String(x.screenId || x.id || '').trim();
      const region = x.region === 'drawer' ? 'drawer' : 'content';
      const label = String(x.label || 'Button');
      const linkTo = typeof x.linkTo === 'string' ? x.linkTo : undefined;
      const open = x.open === 'drawer' ? 'drawer' : undefined;
      if (!screenId) return null;
      return { intent: 'addButton', screenId, region, label, linkTo, open } as any;
    }
    case 'addImage': {
      const screenId = String(x.screenId || x.id || '').trim();
      const region = x.region === 'drawer' ? 'drawer' : 'content';
      const title = typeof x.title === 'string' ? x.title : undefined;
      if (!screenId) return null;
      return { intent: 'addImage', screenId, region, title } as any;
    }
    case 'addPlaceholder': {
      const screenId = String(x.screenId || x.id || '').trim();
      const region = x.region === 'drawer' ? 'drawer' : 'content';
      const label = String(x.label || 'Placeholder');
      if (!screenId) return null;
      return { intent: 'addPlaceholder', screenId, region, label } as any;
    }
    case 'ensureTabs': {
      const screenId = String(x.screenId || x.id || '').trim();
      const tabs = Array.isArray(x.tabs) ? x.tabs.filter(Boolean).map((t: any, i: number) => ({ id: String(t.id || `tab${i+1}`), label: String(t.label || `Tab ${i+1}`) })) : null;
      const activeId = typeof x.activeId === 'string' ? x.activeId : undefined;
      if (!screenId || !tabs || tabs.length < 2) return null;
      return { intent: 'ensureTabs', screenId, tabs, activeId } as any;
    }
    case 'link': {
      const fromScreenId = String(x.fromScreenId || '').trim();
      const toScreenId = String(x.toScreenId || '').trim();
      const label = typeof x.label === 'string' ? x.label : undefined;
      if (!fromScreenId || !toScreenId) return null;
      return { intent: 'link', fromScreenId, toScreenId, label } as any;
    }
    default:
      // Soft map from op-like shapes to intents
      if (typeof x.op === 'string') {
        const op = x.op;
        if (op === 'setDevice') return coerceIntent({ intent:'setDevice', device: x.device });
        if (op === 'addScreen') return coerceIntent({ intent:'ensureScreen', id: x.id, name: x.name, layout: x.layout, appbarTitle: x.appbarTitle });
        if (op === 'setAppbarTitle') return coerceIntent({ intent:'ensureHeader', screenId: x.screenId, title: x.title });
        if (op === 'ensureSidebar') return coerceIntent({ intent:'ensureSidebar', screenId: x.screenId, items: x.items });
        if (op === 'addBlock') {
          const b = x.block || {};
          if (b.type === 'Text') return coerceIntent({ intent:'addText', screenId: x.screenId, region: x.region, variant: b.variant, text: b.text });
          if (b.type === 'Button') return coerceIntent({ intent:'addButton', screenId: x.screenId, region: x.region, label: b.label, linkTo: b.linkTo, open: b.open });
          if (b.type === 'Image') return coerceIntent({ intent:'addImage', screenId: x.screenId, region: x.region, title: b.title });
          return coerceIntent({ intent:'addPlaceholder', screenId: x.screenId, region: x.region, label: b.label || b.type || 'Block' });
        }
      }
      return null;
  }
}

function inferId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'screen';
}

function normalizeOps(raw: any[]): Op[] {
  const allowedOps = new Set(['setDevice','addScreen','setAppbarTitle','ensureSidebar','addBlock','setDrawer']);
  const ops: Op[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const op = String(r.op || '');
    if (!allowedOps.has(op)) continue;
    if (op === 'setDevice') {
      const device = (r.device === 'web' || r.device === 'tablet') ? r.device : 'mobile';
      ops.push({ op: 'setDevice', device } as any);
    } else if (op === 'addScreen') {
      ops.push({ op:'addScreen', id: String(r.id||'home'), name: String(r.name||String(r.id||'Home')), layout: (r.layout==='appbar+sidebar'?'appbar+sidebar':(r.layout==='appbar-only'?'appbar-only':undefined)), appbarTitle: typeof r.appbarTitle==='string'? r.appbarTitle : undefined } as any);
    } else if (op === 'setAppbarTitle') {
      if (!r.screenId || !r.title) continue;
      ops.push({ op:'setAppbarTitle', screenId: String(r.screenId), title: String(r.title) } as any);
    } else if (op === 'ensureSidebar') {
      if (!r.screenId) continue;
      const items = Array.isArray(r.items) ? r.items.map((it:any)=>({ id:String(it.id||inferId(String(it.label||'Item'))), label:String(it.label||'Item'), linkTo: typeof it.linkTo==='string'? it.linkTo: undefined })) : [];
      ops.push({ op:'ensureSidebar', screenId: String(r.screenId), items } as any);
    } else if (op === 'addBlock') {
      if (!r.screenId || !r.region || !r.block) continue;
      const region = r.region === 'drawer' ? 'drawer' : 'content';
      const b = r.block || {};
      if (b && typeof b === 'object') {
        ops.push({ op:'addBlock', screenId:String(r.screenId), region, block: b } as any);
      }
    } else if (op === 'setDrawer') {
      if (!r.screenId) continue;
      const blocks = Array.isArray(r.blocks) ? r.blocks.filter(Boolean) : [];
      ops.push({ op:'setDrawer', screenId: String(r.screenId), blocks } as any);
    }
  }
  return ops;
}

function templateOpsFromPrompt(prompt: string, device: string): Op[] {
  const p = prompt.toLowerCase();
  // Code editor app template (web-first)
  if (/\b(code|editor|ide)\b/.test(p)) {
    const ops: Op[] = [];
    if (device !== 'web') ops.push({ op:'setDevice', device:'web' } as any);
    ops.push({ op:'setTheme', theme:'dark' } as any);
    ops.push(
      { op:'addScreen', id:'editor', name:'Editor', layout:'appbar+sidebar', appbarTitle:'Code Editor' },
      { op:'ensureSidebar', screenId:'editor', items:[ {id:'files', label:'Files', linkTo:'editor'}, {id:'run', label:'Run'} ] },
      { op:'addBlock', screenId:'editor', region:'content', block:{
        type:'Tabs',
        tabs:[ {id:'tab1',label:'Editor'}, {id:'tab2',label:'Preview'}, {id:'tab3',label:'Console'} ],
        activeId:'tab1',
        panels:{
          tab1:[ { type:'Placeholder', label:'Code Editor', fill:'vertical' }, { type:'Button', label:'Run', linkTo:'editor' } ],
          tab2:[ { type:'Placeholder', label:'Preview' } ],
          tab3:[ { type:'Placeholder', label:'Console' } ],
        }
      } }
    );
    return ops;
  }
  // Video app template
  if (/\bvideo\b/.test(p)) {
    const ops: Op[] = [];
    ops.push(
      { op:'addScreen', id:'home', name:'Home', appbarTitle:'Video' },
      { op:'addBlock', screenId:'home', region:'content', block:{ type:'Placeholder', label:'Video' } },
      { op:'addBlock', screenId:'home', region:'content', block:{ type:'List', rows:4 } },
    );
    return ops;
  }
  // Coffee app template
  if (/coffee\b|\bmenu\b/.test(p)) {
    const ops: Op[] = [];
    ops.push({ op:'setDevice', device:'mobile' } as any);
    ops.push({ op:'setTheme', theme:'dark' } as any);
    ops.push(
      { op:'addScreen', id:'menu', name:'Menu', appbarTitle:'Coffee Menu' },
      { op:'addBlock', screenId:'menu', region:'content', block:{ type:'Text', variant:'title', text:'Espresso Drinks' } },
      { op:'addBlock', screenId:'menu', region:'content', block:{ type:'Card', title:'Espresso', subtitle:'Rich and intense shot with golden crema', price:'$2.50', lines:2, ctaLabel:'Add to Cart', ctaLinkTo:'cart' } },
      { op:'addBlock', screenId:'menu', region:'content', block:{ type:'Card', title:'Americano', subtitle:'Espresso shots topped with hot water', price:'$3.00', lines:2, ctaLabel:'Add to Cart', ctaLinkTo:'cart' } },
      { op:'addBlock', screenId:'menu', region:'content', block:{ type:'Card', title:'Cappuccino', subtitle:'Foamed milk and espresso', price:'$3.50', lines:2, ctaLabel:'Add to Cart', ctaLinkTo:'cart' } },
      { op:'addScreen', id:'cart', name:'Cart', appbarTitle:'Cart' },
      { op:'addBlock', screenId:'cart', region:'content', block:{ type:'List', rows:4 } },
      { op:'addBlock', screenId:'cart', region:'content', block:{ type:'Button', label:'Checkout', linkTo:'menu' } },
    );
    return ops;
  }
  // Sidebar request
  if (/\bsidebar\b/.test(p)) {
    return [ { op:'ensureSidebar', screenId:'home', items:[ {id:'home',label:'Home',linkTo:'home'} ] } ] as any;
  }
  // Header request
  if (/\bheader\b/.test(p)) {
    return [ { op:'setAppbarTitle', screenId:'home', title:'Home' } ] as any;
  }
  // Dark mode request
  if (/dark\s*mode|dark\b/.test(p)) {
    return [ { op:'setTheme', theme:'dark' } ] as any;
  }
  // Full screen / make bigger hints on editor
  if (/(full\s*screen|entire\s*screen|take\s*up\s*the\s*entire)/.test(p)) {
    return [ { op:'patchBlocks', match:{ type:'Placeholder', labelContains:'code editor' }, patch:{ fill:'vertical', h: undefined } } ] as any;
  }
  return [];
}


function isGoodDaisyApp(html: string): boolean {
  const t = (html || '').toLowerCase();
  const hasMenu = /data-screen="menu"/.test(t);
  const hasCart = /data-screen="cart"/.test(t);
  const hasBadge = /data-cart-badge/.test(t) || /data-cart-count/.test(t);
  const hasList = /data-cart-list/.test(t);
  const hasTotal = /data-cart-total/.test(t);
  const addCount = (t.match(/data-add=/g) || []).length;
  return hasMenu && hasCart && hasBadge && hasList && hasTotal && addCount >= 4;
}

function buildCoffeeAppHtml(): string {
  return `
<div class="mockup-phone">
  <div class="camera"></div>
  <div class="display bg-base-100">
    <div class="w-full h-full flex flex-col">
      <header class="navbar bg-base-200 sticky top-0 z-10">
        <div class="flex-1 px-2">BrewWire</div>
        <div class="flex-none">
          <a class="btn btn-ghost btn-sm" data-nav="cart">
            Cart <span class="badge badge-primary ml-2" data-cart-badge>0</span>
          </a>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <section data-screen="menu" class="screen">
          <h1 class="text-xl font-semibold mb-2">Coffee Menu</h1>
          <div class="divider">Espresso Drinks</div>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            ${['Espresso|Rich and bold espresso.|2.50','Americano|Espresso + hot water.|3.00','Cappuccino|Foamed milk + espresso.|3.50','Latte|Smooth and creamy.|4.00','Mocha|Chocolate + espresso.|4.50','Flat White|Velvety microfoam.|3.75']
              .map(s=>{ const [name,desc,price]=s.split('|'); return `
              <div class=\"card bg-base-200 shadow-xl rounded-2xl\">
                <div class=\"card-body\">
                  <h2 class=\"card-title\">${name} <span class=\"ml-auto font-semibold\">$${price}</span></h2>
                  <p class=\"text-sm opacity-70\">${desc}</p>
                  <div class=\"card-actions justify-end\">
                    <button class=\"btn btn-primary btn-sm\" data-add=\"${name.toLowerCase()}\" data-item=\"${name}\" data-price=\"${price}\">Add to Cart</button>
                  </div>
                </div>
              </div>`; }).join('')}
          </div>
          <div class="mt-4 flex justify-between">
            <a href="#signin" class="btn btn-ghost btn-sm">Sign in</a>
            <button class="btn btn-outline btn-sm" data-nav="cart">View Cart</button>
          </div>
        </section>
        <section data-screen="cart" class="screen">
          <h1 class="text-xl font-semibold mb-2">Your Cart</h1>
          <ul class="menu bg-base-200 rounded-box" data-cart-list>
            <li class="disabled"><a>Cart is empty</a></li>
          </ul>
          <div class="mt-4 flex items-center justify-between">
            <div>Total: <span data-cart-total>$0.00</span></div>
            <div class="space-x-2">
              <button class="btn btn-ghost btn-sm" data-clear-cart>Clear</button>
              <button class="btn btn-outline btn-sm" data-nav="menu">Back</button>
              <button class="btn btn-primary btn-sm">Checkout</button>
            </div>
          </div>
        </section>
        <section data-screen="signin" class="screen">
          <h1 class="text-xl font-semibold mb-2">Sign in</h1>
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <label class="form-control w-full mb-2">
                <div class="label"><span class="label-text">Email</span></div>
                <input class="input input-bordered w-full" type="email" placeholder="name@example.com" />
              </label>
              <label class="form-control w-full mb-3">
                <div class="label"><span class="label-text">Password</span></div>
                <input class="input input-bordered w-full" type="password" placeholder="••••••••" />
              </label>
              <div class="card-actions justify-end">
                <button class="btn btn-ghost btn-sm" data-nav="menu">Cancel</button>
                <button class="btn btn-primary btn-sm" data-nav="menu">Sign in</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</div>`;
}

function buildCoffeeAppWithSidebarHtml(): string {
  return `
<div class="mockup-window border">
  <div class="bg-base-100 p-0">
    <header class="navbar bg-base-200 sticky top-0 z-10">
      <div class="flex-1 px-2">BrewWire</div>
      <div class="flex-none"><a class="btn btn-ghost btn-sm" data-nav="cart">Cart <span class="badge badge-primary ml-2" data-cart-badge>0</span></a></div>
    </header>
    <main class="grid gap-4 p-4 md:p-6 md:grid-cols-[220px_1fr]">
      <aside class="hidden md:block">
        <ul class="menu bg-base-200 rounded-box">
          <li><a data-nav="menu">Menu</a></li>
          <li><a data-nav="cart">Cart</a></li>
          <li><a href="#signin">Sign in</a></li>
        </ul>
      </aside>
      <section class="min-h-[60vh]">
        ${buildCoffeeAppHtml().replace('<div class="mockup-phone">','').replace('</div>\n  </div>\n</div>','')}
      </section>
    </main>
  </div>
</div>`;
}

function buildCoffeeAppWithHeaderHtml(): string {
  const base = buildCoffeeAppHtml();
  const hero = '<div class="hero bg-base-200 rounded-box mb-4"><div class="hero-content text-center"><div><h1 class="text-2xl font-bold">Welcome to BrewWire</h1><p class="py-2 opacity-70">Order delicious coffee in a few taps.</p><a href="#cart" class="btn btn-primary btn-sm">Go to Cart</a></div></div></div>';
  return base.replace('<section data-screen="menu" class="screen">','<section data-screen="menu" class="screen">'+hero);
}
