import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ ok: true, mode: 'agent' });
}

export async function POST(req: NextRequest) {
  const { prompt = '' } = await req.json();
  const p = String(prompt || '').toLowerCase();

  // Deterministic mapping – DaisyUI wireframes only
  if (/star\s*bucks|starbucks/.test(p)) return code(buildStarbucksLikeWireframeHtml());
  // CUJ / add-on intents (e.g., "add add-on flow", "addons", "recommendations")
  if (/(^|\b)cuj(s)?\b/.test(p) || /basic\s*cuj/.test(p) || /select\s*items/.test(p) || /checkout/.test(p) || /add[-\s]?on/.test(p) || /addons?/.test(p) || /recommendation|upsell/.test(p)) {
    return code(buildCoffeeWireframeCUJsHtml());
  }
  if (/signin|log\s*in/.test(p)) return code(buildCoffeeWireframeInitial('signin'));
  if (/cart/.test(p)) return code(buildCoffeeWireframeInitial('cart'));
  // default: coffee/menu wireframe
  if (/coffee/.test(p) || /make\s+coffee\s+app/.test(p)) return code(buildCoffeeWireframeHtml());
  // fallback to older demo
  return code(buildCoffeeWireframeHtml());
}

function code(html: string) {
  return NextResponse.json({ kind: 'code', language: 'daisyui-html', html });
}

function buildCoffeeAppInitial(screen: 'menu'|'cart'|'signin'): string {
  // Reorder sections so the requested screen is first; sandbox shows first section by default
  const base = buildCoffeeAppHtml();
  const parts = [
    { id: 'menu', html: extractSection(base, 'menu') },
    { id: 'cart', html: extractSection(base, 'cart') },
    { id: 'signin', html: extractSection(base, 'signin') },
  ];
  const ordered = [screen, ...['menu','cart','signin'].filter(x => x !== screen)]
    .map(id => parts.find(p => p.id === id)?.html || '')
    .join('\n');
  return base.replace(/<section[^>]*data-screen="menu"[\s\S]*?<\/section>\s*<section[^>]*data-screen="cart"[\s\S]*?<\/section>\s*<section[^>]*data-screen="signin"[\s\S]*?<\/section>/, ordered);
}

function extractSection(html: string, id: string): string {
  const re = new RegExp(`<section[^>]*data-screen=\"${id}\"[\\s\\S]*?<\\/section>`);
  const m = html.match(re); return m ? m[0] : '';
}

// DaisyUI wireframe versions (grayscale, mobile-first)
function buildCoffeeWireframeHtml(): string {
  return `
<div class="w-full h-full flex flex-col bg-base-100">
    <header class="navbar bg-base-200 sticky top-0 z-10">
      <div class="flex-1 px-2">Coffee Wireframe</div>
      <div class="flex-none">
        <a class="btn btn-ghost btn-sm" data-nav="cart">Cart <span class="badge ml-2" data-cart-badge>0</span></a>
      </div>
    </header>
    <main class="flex-1 overflow-y-auto p-4 space-y-4">
      <section data-screen="menu" class="screen">
        <div class="alert bg-base-200">
          <span class="opacity-70">Rewards progress</span>
          <progress class="progress w-40" value="30" max="100"></progress>
        </div>
        <h1 class="text-lg font-semibold">Menu</h1>
        <div class="grid gap-3 grid-cols-1">
          ${['Espresso|2.50','Americano|3.00','Latte|4.00','Cappuccino|3.50','Mocha|4.50','Flat White|3.75']
            .map(s=>{ const [name,price]=s.split('|'); return `
            <div class="card bg-base-200">
              <div class="card-body gap-2">
                <div class="flex items-center gap-3">
                  <div class="w-16 h-16 bg-base-300 rounded-md grid place-items-center text-xs">image</div>
                  <div class="flex-1">
                    <div class="font-medium">${name}</div>
                    <div class="opacity-60 text-sm">$${price}</div>
                  </div>
                  <button class="btn btn-neutral btn-sm" data-add="${name.toLowerCase()}" data-item="${name}" data-price="${price}">Add</button>
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
        <h1 class="text-lg font-semibold">Cart</h1>
        <ul class="menu bg-base-200 rounded-box" data-cart-list>
          <li class="disabled"><a>Cart is empty</a></li>
        </ul>
        <div class="mt-3 flex items-center justify-between">
          <div>Total: <span data-cart-total>$0.00</span></div>
          <div class="space-x-2">
            <button class="btn btn-ghost btn-sm" data-clear-cart>Clear</button>
            <button class="btn btn-outline btn-sm" data-nav="menu">Back</button>
            <button class="btn btn-neutral btn-sm" data-nav="checkout">Checkout</button>
          </div>
        </div>
      </section>
      <section data-screen="checkout" class="screen">
        <h1 class="text-lg font-semibold mb-2">Checkout</h1>
        <div class="card bg-base-200 mb-3">
          <div class="card-body gap-3">
            <div class="flex items-center justify-between">
              <div class="font-medium">Add-on recommendations</div>
              <div class="space-x-2">
                <button class="btn btn-ghost btn-xs" data-action="skip-addons">Skip</button>
                <button class="btn btn-outline btn-xs" data-action="continue-addons">Continue</button>
              </div>
            </div>
            ${['Croissant|2.25','Banana Bread|2.75','Extra Shot|1.00'].map(s=>{ const [name,price]=s.split('|'); return `
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-base-300 rounded-md grid place-items-center text-xs">image</div>
              <div class="flex-1">
                <div>${name}</div>
                <div class="text-xs opacity-60">$${price}</div>
              </div>
              <button class="btn btn-sm" data-add="${name.toLowerCase()}" data-item="${name}" data-price="${price}">Add</button>
            </div>`;}).join('')}
          </div>
        </div>
        <div class="card bg-base-200">
          <div class="card-body">
            <div class="font-medium mb-2">Payment & review</div>
            <div class="text-sm opacity-70">Wireframe placeholder</div>
            <div class="card-actions justify-end mt-3">
              <button class="btn btn-ghost btn-sm" data-nav="cart">Back</button>
              <button class="btn btn-neutral btn-sm" data-place-order>Place order</button>
            </div>
          </div>
        </div>
      </section>
      <section data-screen="signin" class="screen">
        <h1 class="text-lg font-semibold">Sign in</h1>
        <div class="card bg-base-200">
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
              <button class="btn btn-neutral btn-sm" data-nav="menu">Sign in</button>
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer class="btm-nav btm-nav-sm bg-base-200">
      <button class="active" data-nav="menu">Menu</button>
      <button data-nav="cart">Cart</button>
      <a href="#signin">Account</a>
    </footer>
  </div>`;
}

function buildCoffeeWireframeInitial(screen: 'menu'|'cart'|'signin'): string {
  const base = buildCoffeeWireframeHtml();
  const parts = [
    { id: 'menu', html: extractSection(base, 'menu') },
    { id: 'cart', html: extractSection(base, 'cart') },
    { id: 'checkout', html: extractSection(base, 'checkout') },
    { id: 'signin', html: extractSection(base, 'signin') },
  ];
  const ordered = [screen, ...['menu','cart','checkout','signin'].filter(x => x !== screen)]
    .map(id => parts.find(p => p.id === id)?.html || '')
    .join('\n');
  return base.replace(/<section[^>]*data-screen=\"menu\"[\s\S]*?<\/section>\s*<section[^>]*data-screen=\"cart\"[\s\S]*?<\/section>\s*<section[^>]*data-screen=\"checkout\"[\s\S]*?<\/section>\s*<section[^>]*data-screen=\"signin\"[\s\S]*?<\/section>/, ordered);
}

function buildCoffeeWireframeCUJsHtml(): string {
  // Ensure cart first to highlight add-on step in demo
  const base = buildCoffeeWireframeHtml();
  const parts = [
    { id: 'cart', html: extractSection(base, 'cart') },
    { id: 'menu', html: extractSection(base, 'menu') },
    { id: 'checkout', html: extractSection(base, 'checkout') },
    { id: 'signin', html: extractSection(base, 'signin') },
  ];
  return base.replace(/<section[^>]*data-screen=\"menu\"[\s\S]*?<\/section>\s*<section[^>]*data-screen=\"cart\"[\s\S]*?<\/section>\s*<section[^>]*data-screen=\"checkout\"[\s\S]*?<\/section>\s*<section[^>]*data-screen=\"signin\"[\s\S]*?<\/section>/, parts.map(p=>p.html).join('\n'));
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
              <div class="card bg-base-200 shadow-xl rounded-2xl">
                <div class="card-body">
                  <h2 class="card-title">${name} <span class="ml-auto font-semibold">$${price}</span></h2>
                  <p class="text-sm opacity-70">${desc}</p>
                  <div class="card-actions justify-end">
                    <button class="btn btn-primary btn-sm" data-add="${name.toLowerCase()}" data-item="${name}" data-price="${price}">Add to Cart</button>
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


function buildCoffeeAppWithMobileSidebarHtml(): string {
  return `
<div class="mockup-phone">
  <div class="camera"></div>
  <div class="display bg-base-100">
    <div class="drawer w-full h-full">
      <input id="app-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        <header class="navbar bg-base-200 sticky top-0 z-10">
          <div class="navbar-start">
            <label for="app-drawer" class="btn btn-ghost btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div class="flex-1 px-2">BrewWire</div>
          <div class="navbar-end">
            <a class="btn btn-ghost btn-sm" data-nav="cart">Cart <span class="badge badge-primary ml-2" data-cart-badge>0</span></a>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          ${extractSection(buildCoffeeAppHtml(),'menu')}
          ${extractSection(buildCoffeeAppHtml(),'cart')}
          ${extractSection(buildCoffeeAppHtml(),'signin')}
        </main>
      </div>
      <div class="drawer-side z-20">
        <label for="app-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu p-4 w-64 min-h-full bg-base-200">
          <li><a data-nav="menu" onclick="document.getElementById('app-drawer').checked=false">Menu</a></li>
          <li><a data-nav="cart" onclick="document.getElementById('app-drawer').checked=false">Cart</a></li>
          <li><a href="#signin" onclick="document.getElementById('app-drawer').checked=false">Sign in</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>`;
}

function buildStarbucksLikeWireframeHtml(): string {
  // Grayscale, mobile-first, rewards banner and featured items; not branded.
  return `
<div class="w-full h-full flex flex-col bg-base-100">
    <header class="navbar bg-base-200 sticky top-0 z-10">
      <div class="flex-1 px-2">Coffee App</div>
      <div class="flex-none"><button class="btn btn-ghost btn-sm" data-nav="cart">Cart <span class="badge ml-2" data-cart-badge>0</span></button></div>
    </header>
    <main class="flex-1 overflow-y-auto p-4 space-y-4">
      <section data-screen="menu" class="screen">
        <div class="card bg-base-200">
          <div class="card-body py-3">
            <div class="flex items-center gap-3">
              <div class="avatar placeholder"><div class="bg-base-300 text-neutral-content rounded-full w-10"><span>RW</span></div></div>
              <div class="flex-1">
                <div class="font-medium">Rewards</div>
                <progress class="progress w-40" value="50" max="100"></progress>
              </div>
              <button class="btn btn-ghost btn-xs">Details</button>
            </div>
          </div>
        </div>
        <div class="tabs tabs-bordered">
          <a class="tab tab-active">Featured</a>
          <a class="tab">Hot</a>
          <a class="tab">Cold</a>
        </div>
        <div class="grid gap-3">
          ${['Iced Latte|4.00','Cappuccino|3.50','Cold Brew|3.25']
            .map(s=>{ const [name,price]=s.split('|'); return `
            <div class="card bg-base-200">
              <div class="card-body">
                <div class="flex items-center gap-3">
                  <div class="w-16 h-16 bg-base-300 rounded-md grid place-items-center text-xs">image</div>
                  <div class="flex-1">
                    <div class="font-medium">${name}</div>
                    <div class="opacity-60 text-sm">$${price}</div>
                  </div>
                  <button class="btn btn-neutral btn-sm" data-add="${name.toLowerCase()}" data-item="${name}" data-price="${price}">Add</button>
                </div>
              </div>
            </div>`; }).join('')}
        </div>
        <div class="mt-4 flex justify-end">
          <button class="btn btn-outline btn-sm" data-nav="cart">View Cart</button>
        </div>
      </section>
      ${extractSection(buildCoffeeWireframeHtml(),'cart')}
      ${extractSection(buildCoffeeWireframeHtml(),'checkout')}
      ${extractSection(buildCoffeeWireframeHtml(),'signin')}
    </main>
    <footer class="btm-nav btm-nav-sm bg-base-200">
      <button class="active" data-nav="menu">Menu</button>
      <button data-nav="cart">Cart</button>
      <a href="#signin">Account</a>
    </footer>
  </div>`;
}
