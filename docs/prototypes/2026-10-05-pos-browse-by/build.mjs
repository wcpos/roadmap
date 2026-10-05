// Generates the clickable "Browse by" mockup: CSS-only state machine (radios + :has()).
import { writeFileSync, mkdirSync } from 'node:fs';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT_DIR = dirname(fileURLToPath(import.meta.url));
mkdirSync(OUT_DIR, { recursive: true });

// ---------- data: a café store ----------
const P = (n, p, extra = {}) => ({ n, p, ...extra });
const products = {
	latte: P('Latte', 'From 3,20 £', { v: 3, img: true }),
	flat: P('Flat White', '3,40 £', { img: true }),
	amer: P('Americano', '2,90 £', { img: true }),
	tea: P('Tea', 'From 2,40 £', { v: 4 }),
	choc: P('Hot Chocolate', '3,30 £', { img: true }),
	espr: P('Espresso', '2,40 £'),
	iced: P('Iced Latte', '3,60 £', { img: true }),
	lemon: P('Lemonade', '2,80 £', { img: true }),
	oj: P('Orange Juice', '3,00 £'),
	cola: P('Cola', '2,20 £'),
	water: P('Still Water', '1,50 £'),
	smoo: P('Smoothie', 'From 4,20 £', { v: 3, img: true }),
	toast: P('Sourdough Toast', '4,50 £', { img: true }),
	eggs: P('Eggs on Toast', '7,50 £', { img: true }),
	soup: P('Soup of the Day', '6,00 £'),
	panini: P('Panini', 'From 6,50 £', { v: 3, img: true }),
	crois: P('Croissant', '2,60 £', { img: true }),
	brownie: P('Brownie', '3,00 £', { img: true }),
	flap: P('Flapjack', '2,40 £'),
	crisps: P('Crisps', '1,40 £'),
	mug: P('Café Mug', '12,00 £', { img: true }),
	beans: P('House Beans 250g', '9,50 £', { img: true }),
	tote: P('Tote Bag', '8,00 £'),
	gran: P('Granola Pot', '3,80 £'),
};
const all = Object.keys(products);
const hot = ['latte', 'flat', 'amer', 'tea', 'choc', 'espr'];
const cold = ['iced', 'lemon', 'oj', 'cola', 'water', 'smoo'];
const drinks = [...hot, ...cold];

const cats = [
	{ id: 'drinks', n: 'Drinks', c: 12, img: true, hue: 240 },
	{ id: 'hotfood', n: 'Hot Food', c: 4, img: true, hue: 25 },
	{ id: 'snacks', n: 'Snacks', c: 4, hue: 140 },
	{ id: 'bakery', n: 'Bakery', c: 3, img: true, hue: 60 },
	{ id: 'merch', n: 'Merch', c: 3, hue: 300 },
];
const tags = [
	{ n: 'Vegan', c: 9, hue: 140 }, { n: 'Gluten free', c: 6, hue: 60 }, { n: 'Decaf', c: 4, hue: 240 },
	{ n: 'Seasonal', c: 5, hue: 25 }, { n: 'Oat milk', c: 7, hue: 90 }, { n: 'Staff pick', c: 3, hue: 300 },
	{ n: 'Kids', c: 4, hue: 190 }, { n: 'Takeaway', c: 14, hue: 10 },
];
const brands = [
	{ n: 'Monmouth', c: 6, img: true, hue: 20 }, { n: 'Clipper', c: 5, img: true, hue: 140 },
	{ n: 'Fever-Tree', c: 3, img: true, hue: 190 }, { n: 'Oatly', c: 4, hue: 60 },
	{ n: "Tony's", c: 2, img: true, hue: 0 }, { n: 'House', c: 9, hue: 240 },
];
const shortcuts = [
	{ n: 'Breakfast', d: 'Hot Food + Bakery · in stock', hue: 60 },
	{ n: 'Lunch deal', d: 'Panini, Soup · on sale', hue: 25 },
	{ n: 'Under 3 £', d: 'Price ≤ 3,00 £', hue: 140 },
	{ n: 'Specials', d: 'Tag: Seasonal', hue: 300 },
	{ n: 'Takeaway', d: 'Tag: Takeaway', hue: 190 },
];

// ---------- svg ----------
const I = {
	search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
	scan: '<svg viewBox="0 0 24 24"><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3"/><path d="M8 9v6M11 9v6M14 9v6M17 9v6" stroke-width="2.2"/></svg>',
	grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
	list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke-width="2.2"/></svg>',
	sliders: '<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
	photo: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/></svg>',
	plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
	chev: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
	back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
	box: '<svg viewBox="0 0 24 24"><path d="M3 9l1-5h16l1 5M3 9v11h18V9M9 20v-6h6v6"/></svg>',
	filter: '<svg viewBox="0 0 24 24"><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>',
	all: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
	tagI: '<svg viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
};

// ---------- tiles ----------
const termTile = ({ n, c, img, hue, d }, to, kind) => {
	const cls = `tile term ${img ? 'photo' : 'plain'} ${kind}`;
	const style = `--h:${hue}`;
	const sub = d ?? `${c} products`;
	return `<label class="${cls}" for="${to}" style="${style}">${
		img ? `<div class="img">${I.photo}</div><div class="tx"><div class="nm">${n}</div><div class="sub">${sub}</div></div>`
			: `<div class="plainbody"><div class="nm">${n}</div><div class="sub">${sub}</div></div>`
	}</label>`;
};
const allTile = (to) =>
	`<label class="tile term all" for="${to}"><div class="plainbody">${I.all}<div class="nm">All products</div><div class="sub">${all.length} products</div></div></label>`;

const parentTermTile = (t, backTo) => {
	const inner = t.all
		? `<div class="plainbody">${I.all}<div class="nm">All products</div></div>`
		: t.img
			? `<div class="img">${I.photo}</div><div class="tx"><div class="nm">${t.n}</div><div class="sub">${t.d ?? `${t.c} products`}</div></div>`
			: `<div class="plainbody"><div class="nm">${t.n}</div><div class="sub">${t.d ?? `${t.c} products`}</div></div>`;
	return `<label class="tile term parent ${t.all ? 'all' : t.img ? 'photo' : 'plain'}" for="${backTo}" style="--h:${t.hue ?? 240}">${inner}<div class="addc">${I.back}</div></label>`;
};
const productTile = (id, dealTo) => {
	const p = products[id];
	const variable = !!p.v;
	const tag = variable ? `label` : `div`;
	const attr = variable ? ` for="${dealTo}"` : '';
	return `<${tag} class="tile product${variable ? ' variable' : ''}"${attr}><div class="img${p.img ? '' : ' none'}">${p.img ? I.photo : ''}${variable ? `<span class="vbadge">${p.v}</span>` : ''}</div><div class="tx"><div class="nm">${p.n}</div><div class="pr">${p.p}</div></div><div class="addc">${variable ? I.chev : I.plus}</div></${tag}>`;
};
const variationTile = (n, price, stock) =>
	`<div class="tile product"><div class="img"></div><div class="tx"><div class="nm">${n}</div><div class="pr">${price}</div>${stock ? `<div class="sub low">${stock}</div>` : ''}</div><div class="addc">${I.plus}</div></div>`;
const parentTile = (id, backTo) => {
	const p = products[id];
	return `<label class="tile product parent" for="${backTo}"><div class="img">${I.photo}</div><div class="tx"><div class="nm">${p.n}</div><div class="pr">${p.p}</div></div><div class="addc">${I.back}</div></label>`;
};

// ---------- rows (table mode) ----------
const termRow = ({ n, c, img, hue, d }, to, kind) =>
	`<label class="row term" for="${to}" style="--h:${hue}"><div class="thumb ${img ? 'photo' : 'plain'}">${img ? I.photo : n[0]}</div><div class="cell grow"><div>${n}</div><div class="sub">${d ?? `${c} products`}</div></div><div class="cell r chev">${I.chev}</div></label>`;
const allRow = (to) =>
	`<label class="row term all" for="${to}"><div class="thumb plain">${I.all}</div><div class="cell grow"><div>All products</div><div class="sub">${all.length} products</div></div><div class="cell r chev">${I.chev}</div></label>`;
const productRow = (id, dealTo) => {
	const p = products[id];
	const variable = !!p.v;
	const tag = variable ? 'label' : 'div';
	const attr = variable ? ` for="${dealTo}"` : '';
	return `<${tag} class="row product"${attr}><div class="thumb ${p.img ? 'photo' : 'plain'}">${p.img ? I.photo : ''}</div><div class="cell grow"><div>${p.n}</div>${variable ? `<div class="sub">${p.v} variations</div>` : ''}</div><div class="cell r num">${p.p}</div><div class="add${variable ? ' chev' : ''}">${variable ? I.chev : I.plus}</div></${tag}>`;
};
const variationRow = (n, price, stock) =>
	`<div class="row product var"><div class="thumb plain sm"></div><div class="cell grow"><div>Latte</div><div class="sub">${n}</div></div><div class="cell r num">${price}${stock ? ` <span class="pillo low">${stock}</span>` : ''}</div><div class="add">${I.plus}</div></div>`;

// ---------- crumb ----------
const crumb = (parts, detail) => {
	// parts: [{label, to}] ancestors ... last is "here"
	const here = parts[parts.length - 1];
	const anc = parts.slice(0, -1);
	return `<div class="crumb">${anc
		.map((a, i) => `<label class="back${i === anc.length - 1 ? ' last' : ''}" for="${a.to}">${i === anc.length - 1 ? I.back : ''}${a.label}</label><span class="sep">›</span>`)
		.join('')}<span class="here">${here.label}</span>${detail ? `<span class="det">${detail}</span>` : ''}</div>`;
};

// ---------- states ----------
// modes: all | cat | tag | brand | short ; levels: lv0 lv1 lv2 lv3 lvall
const LATTE_VARS = [['Small', '3,20 £'], ['Medium', '3,60 £'], ['Large', '3,90 £', '2 left']];

function stateFor(mode, lv) {
	const root = { all: 'All products', cat: 'Categories', tag: 'Tags', brand: 'Brands', short: 'Shortcuts' }[mode];
	const R = { label: root, to: 'lv0' };
	// deal (lv3) exists in every mode; its crumb depends on where you came from
	if (lv === 'lv3') {
		const from = { cat: [R, { label: 'Drinks', to: 'lv1' }, { label: 'Hot', to: 'lv2' }], tag: [R, { label: 'Vegan', to: 'lv1' }], brand: [R, { label: 'Monmouth', to: 'lv1' }], short: [R, { label: 'Breakfast', to: 'lv1' }], all: [{ label: 'Products', to: 'lv0' }] }[mode];
		return { kind: 'deal', crumb: [...from, { label: 'Latte', to: 'lv3' }], detail: '3 variations', backTo: from[from.length - 1].to, under: mode === 'cat' ? hot : mode === 'all' ? all : drinks.slice(0, 8) };
	}
	if (mode === 'all') return { kind: 'products', crumb: null, items: all };
	if (lv === 'lvall') return { kind: 'products', crumb: [R, { label: 'All products', to: 'lvall' }], detail: `${all.length} products`, items: all, parent: parentTermTile({ n: 'All products', all: true }, 'lv0') };
	if (mode === 'cat') {
		if (lv === 'lv0') return { kind: 'terms', crumb: null, terms: cats.map((c) => termTile(c, 'lv1', 'cat')), rows: cats.map((c) => termRow(c, 'lv1', 'cat')), withAll: true };
		if (lv === 'lv1') return { kind: 'mixed', crumb: [R, { label: 'Drinks', to: 'lv1' }], detail: '12 products', parent: parentTermTile(cats[0], 'lv0'), terms: [termTile({ n: 'Hot', c: 6, img: true, hue: 20 }, 'lv2', 'cat'), termTile({ n: 'Cold', c: 6, hue: 200 }, 'lv2', 'cat')], rows: [termRow({ n: 'Hot', c: 6, img: true, hue: 20 }, 'lv2'), termRow({ n: 'Cold', c: 6, hue: 200 }, 'lv2')], items: drinks };
		return { kind: 'products', crumb: [R, { label: 'Drinks', to: 'lv1' }, { label: 'Hot', to: 'lv2' }], detail: '6 products', items: hot, parent: parentTermTile({ n: 'Hot', c: 6, img: true, hue: 20 }, 'lv1') };
	}
	if (mode === 'tag') {
		if (lv === 'lv0') return { kind: 'terms', crumb: null, terms: tags.map((t) => termTile(t, 'lv1', 'tag')), rows: tags.map((t) => termRow(t, 'lv1')), withAll: true };
		return { kind: 'products', crumb: [R, { label: 'Vegan', to: 'lv1' }], detail: '9 products', parent: parentTermTile(tags[0], 'lv0'), items: ['oj', 'lemon', 'cola', 'water', 'smoo', 'soup', 'flap', 'crisps', 'gran'] };
	}
	if (mode === 'brand') {
		if (lv === 'lv0') return { kind: 'terms', crumb: null, terms: brands.map((b) => termTile(b, 'lv1', 'brand')), rows: brands.map((b) => termRow(b, 'lv1')), withAll: true };
		return { kind: 'products', crumb: [R, { label: 'Monmouth', to: 'lv1' }], detail: '6 products', parent: parentTermTile(brands[0], 'lv0'), items: ['latte', 'flat', 'amer', 'espr', 'beans', 'iced'] };
	}
	// shortcuts
	if (lv === 'lv0') return { kind: 'terms', crumb: null, terms: shortcuts.map((s) => termTile({ n: s.n, d: s.d, hue: s.hue }, 'lv1', 'short')), rows: shortcuts.map((s) => termRow({ n: s.n, d: s.d, hue: s.hue }, 'lv1')), withAll: true };
	return { kind: 'products', crumb: [R, { label: 'Breakfast', to: 'lv1' }], detail: '7 products · in stock', parent: parentTermTile({ n: shortcuts[0].n, d: shortcuts[0].d, hue: shortcuts[0].hue }, 'lv0'), items: ['toast', 'eggs', 'crois', 'gran', 'latte', 'flat', 'oj'] };
}

function renderGrid(s) {
	let body = '';
	if (s.kind === 'terms') body = `<div class="tiles">${s.withAll ? allTile('lvall') : ''}${s.terms.join('')}</div>`;
	else if (s.kind === 'mixed') body = `<div class="tiles">${s.parent ?? ''}${s.terms.join('')}${s.items.map((id) => productTile(id, 'lv3')).join('')}</div>`;
	else if (s.kind === 'products') body = `<div class="tiles">${s.parent ?? ''}${s.items.map((id) => productTile(id, 'lv3')).join('')}</div>`;
	else if (s.kind === 'deal')
		body = `<div class="tiles dealt">${parentTile('latte', s.backTo)}${LATTE_VARS.map((v) => variationTile(...v)).join('')}</div><div class="tiles under">${s.under.map((id) => productTile(id, 'lv3')).join('')}</div>`;
	const c = s.crumb ? `<div class="crumbwrap">${crumb(s.crumb, s.detail)}</div>` : '';
	return `<div class="card">${c}<div class="scroller">${body}</div><div class="foot"><span class="l">Tax based on: shop base address</span><span>${footCount(s)}</span></div></div>`;
}
function footCount(s) {
	if (s.kind === 'deal') return 'Latte · 3 of 3';
	if (s.kind === 'terms') return '';
	const n = s.items.length;
	return `Showing ${n} of ${n}`;
}
function renderTable(s) {
	let rows = '';
	const head = `<div class="row th"><div class="thumb h"></div><div class="cell grow">Product</div><div class="cell r">Price</div><div class="add h"></div></div>`;
	if (s.kind === 'terms') rows = `${s.withAll ? allRow('lvall') : ''}${s.rows.join('')}`;
	else if (s.kind === 'mixed') rows = head + s.rows.join('') + s.items.map((id) => productRow(id, 'lv3')).join('');
	else if (s.kind === 'products') rows = head + s.items.map((id) => productRow(id, 'lv3')).join('');
	else if (s.kind === 'deal') rows = `<div class="row th"><div class="thumb h"></div><div class="cell grow">Variation</div><div class="cell r">Price</div><div class="add h"></div></div>` + LATTE_VARS.map((v) => variationRow(...v)).join('');
	const c = s.crumb ? crumb(s.crumb, s.detail) : '';
	return `${c}<div class="card"><div class="scroller">${rows}</div><div class="foot"><span class="l">Tax based on: shop base address</span><span>${footCount(s)}</span></div></div>`;
}

const MODES = ['all', 'cat', 'tag', 'brand', 'short'];
const LEVELS = ['lv0', 'lv1', 'lv2', 'lv3', 'lvall'];

let blocks = '';
let rules = '';
for (const m of MODES) for (const lv of LEVELS) {
	const s = stateFor(m, lv);
	blocks += `<div class="screen" data-s="${m}-${lv}-grid">${renderGrid(s)}</div>`;
	blocks += `<div class="screen" data-s="${m}-${lv}-table">${renderTable(s)}</div>`;
	rules += `body:has(#m-${m}:checked):has(#${lv}:checked):has(#v-grid:checked) [data-s="${m}-${lv}-grid"]{display:flex}\n`;
	rules += `body:has(#m-${m}:checked):has(#${lv}:checked):has(#v-table:checked) [data-s="${m}-${lv}-table"]{display:flex}\n`;
}

// filter bar per mode
const chip = (t, cls = '') => `<span class="chip ${cls}">${t}</span>`;
const bars = {
	all: [chip(`${I.box}In stock ✕`, 'on'), chip('Featured'), chip('On sale'), chip('Category'), chip('Tag'), chip('Brand'), '<span class="vsep"></span>', chip('Breakfast', 'qf'), chip('Lunch deal', 'qf'), chip('Under 3 £', 'qf'), chip('Specials', 'qf'), chip('Takeaway', 'qf'), chip('Customise', 'ghost')],
};
for (const m of ['cat', 'tag', 'brand', 'short']) bars[m] = bars.all;
let barBlocks = '';
for (const m of MODES) {
	barBlocks += `<div class="chips" data-bar="${m}">${bars[m].join('')}</div>`;
	rules += `body:has(#m-${m}:checked) [data-bar="${m}"]{display:flex}\n`;
}

// captions
const cap = {
	'cat-lv0': '<b>Categories, root.</b> The WooCommerce category tree as tiles: image if the category has one, otherwise the name on a tinted card. <b>All products</b> is the first tile, always. Order is the WooCommerce term order (menu_order), then name; categories with no published products are hidden, as the shop does. No crumb at the root, as today\'s grid has none. The filter bar is untouched in every mode (owner, 2026-10-05).',
	'cat-lv1': '<b>Drinks.</b> What WooCommerce calls display type <i>both</i>: the child categories first (Hot, Cold), then every product under Drinks including the children\'s, because a parent archive includes its descendants. Tapping Drinks dealt these out of the Drinks tile, which walked to the first slot and is the way back — the same deal as variations. The crumb is the existing component, unchanged. A category set to <i>subcategories</i> shows only the child tiles; one set to <i>products</i> shows only products.',
	'cat-lv2': '<b>Hot.</b> A leaf: products only. Latte and Tea carry a variations count and › instead of +; tapping one is the existing deal.',
	'cat-lv3': '<b>Latte dealt.</b> Unchanged from today\'s variations deal: Latte walks to the first slot and is the way back; its three sizes come out from under it; the Hot products fade underneath and stay mounted. The crumb just grew one segment.',
	'cat-lvall': '<b>All products, inside categories mode.</b> The escape the issue asks for: the plain grid dealt out of the All products tile, which is the way back; the crumb reads Categories › All products. This is also where search and barcode land: typing or scanning drops the drill-in and shows matches across the whole catalogue, and the crumb comes back when the search is cleared.',
	'tag-lv0': '<b>Tags.</b> Flat, no images in WooCommerce, so every tile is the name on a tinted card. Same component, depth 1.',
	'tag-lv1': '<b>Vegan.</b> Products carrying the tag. Crumb Tags › Vegan.',
	'brand-lv0': '<b>Brands.</b> WooCommerce brands carry a thumbnail and can nest, so this is the categories component with the brand taxonomy. Brand pill hidden.',
	'brand-lv1': '<b>Monmouth.</b> Products of the brand.',
	'short-lv0': '<b>Shortcuts.</b> The saved quick filters as tiles, in the merchant\'s order, each with its rule in one line. This is the curated-grid shape (Square Favorites, Lightspeed Quick Keys) built from what the filter bar already stores — The filter bar is unchanged; a tapped shortcut lights its chip in the bar as a quick-filter press does today.',
	'short-lv1': '<b>Breakfast.</b> The quick filter applied: Hot Food + Bakery, in stock, with the crumb saying so. Tapping another shortcut replaces it, as a quick-filter press does today.',
	'all-lv0': '<b>All products.</b> Today\'s screen, unchanged: this is the default and the setting\'s first option.',
	'all-lv3': '<b>Latte dealt from All products.</b> Today\'s deal, for comparison: crumb Products › Latte.',
};
let caps = '';
for (const k of Object.keys(cap)) {
	const [m, lv] = k.split('-');
	caps += `<p class="caption" data-c="${k}">${cap[k]}</p>`;
	rules += `body:has(#m-${m}:checked):has(#${lv}:checked) [data-c="${k}"]{display:block}\n`;
}
// fallbacks: levels that a mode doesn't have (tag/brand/short lv2 behave like lv1; all lv1/lv2/lvall like lv0)
for (const m of ['tag', 'brand', 'short']) {
	rules += `body:has(#m-${m}:checked):has(#lv2:checked) [data-c="${m}-lv1"]{display:block}\n`;
	rules += `body:has(#m-${m}:checked):has(#lvall:checked) [data-c="cat-lvall"]{display:block}\n`;
	rules += `body:has(#m-${m}:checked):has(#lv3:checked) [data-c="cat-lv3"]{display:block}\n`;
}
for (const lv of ['lv1', 'lv2', 'lvall']) rules += `body:has(#m-all:checked):has(#${lv}:checked) [data-c="all-lv0"]{display:block}\n`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>POS products — Browse by</title>
<style>
  :root {
    --background: oklch(0.97 0.01 250); --foreground: oklch(0.25 0.03 250); --card: oklch(1 0 0);
    --primary: oklch(0.50 0.18 240); --primary-foreground: oklch(0.98 0.01 240);
    --muted: oklch(0.965 0.008 250); --muted-foreground: oklch(0.45 0.03 250);
    --warning: oklch(0.65 0.18 45); --border: oklch(0.88 0.012 250); --input: oklch(1 0 0);
    --rail: oklch(0.955 0.01 250); --chip-tint: oklch(0.95 0.03 240); --chip-text: oklch(0.42 0.16 240);
    --chip-grey: oklch(0.93 0.01 250); --img: oklch(0.93 0.01 250);
    --tint-l: 0.95; --tint-c: 0.035; --tint-fg-l: 0.35;
  }
  html:has(#dark:checked) {
    --background: oklch(0.18 0.025 250); --foreground: oklch(0.92 0.01 250); --card: oklch(0.22 0.025 250);
    --primary: oklch(0.65 0.20 240); --primary-foreground: oklch(0.15 0.02 250);
    --muted: oklch(0.26 0.025 250); --muted-foreground: oklch(0.65 0.02 250);
    --warning: oklch(0.70 0.18 45); --border: oklch(0.38 0.025 250); --input: oklch(0.18 0.025 250);
    --rail: oklch(0.16 0.025 250); --chip-tint: oklch(0.30 0.06 240); --chip-text: oklch(0.80 0.10 240);
    --chip-grey: oklch(0.30 0.02 250); --img: oklch(0.28 0.02 250);
    --tint-l: 0.30; --tint-c: 0.05; --tint-fg-l: 0.88;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: var(--foreground); background: oklch(0.12 0.01 250); padding: 0 0 48px; }
  input[type=radio], input[type=checkbox] { position: absolute; opacity: 0; pointer-events: none; }
  svg { stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  label { cursor: pointer; }

  .strip { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 12px 20px; background: oklch(0.16 0.01 250); color: oklch(0.92 0 0); border-bottom: 1px solid oklch(0.3 0 0); font-size: 13px; }
  .strip .k { color: oklch(0.6 0 0); margin: 0 4px 0 6px; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; }
  .strip label { padding: 6px 12px; border-radius: 6px; border: 1px solid oklch(0.35 0 0); color: oklch(0.8 0 0); }
  .strip .sep { width: 1px; height: 22px; background: oklch(0.35 0 0); margin: 0 8px; }
  .strip .hint { color: oklch(0.6 0 0); margin-left: auto; }
  ${MODES.map((m) => `body:has(#m-${m}:checked) label[for=m-${m}]`).join(',')},
  body:has(#v-grid:checked) label[for=v-grid], body:has(#v-table:checked) label[for=v-table],
  body:has(#w-tab:checked) label[for=w-tab], body:has(#w-phone:checked) label[for=w-phone],
  body:has(#light:checked) label[for=light], body:has(#dark:checked) label[for=dark],
  body:has(#set:checked) label[for=set] { background: oklch(0.92 0 0); color: oklch(0.15 0 0); border-color: oklch(0.92 0 0); }

  .frame, .caption { width: 1480px; max-width: calc(100vw - 40px); margin: 28px auto 0; }
  .frame { background: var(--background); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px oklch(0 0 0 / .5); position: relative; }
  .caption { margin-top: 14px; color: oklch(0.7 0 0); font-size: 13.5px; line-height: 1.5; display: none; }
  .caption b { color: oklch(0.9 0 0); }

  .app { display: flex; height: 820px; }
  .rail { width: 64px; flex: none; background: var(--rail); display: flex; flex-direction: column; align-items: center; padding: 14px 0; gap: 6px; }
  .rail .avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--border); margin-bottom: 14px; }
  .rail .ico { width: 48px; height: 48px; border-radius: 10px; display: grid; place-items: center; color: var(--muted-foreground); }
  .rail .ico.on { background: var(--card); color: var(--primary); }
  .rail .ico svg { width: 22px; height: 22px; }
  .rail .spacer { flex: 1; }
  .main { flex: 1; display: grid; grid-template-columns: 1fr 8px 480px; min-width: 0; }
  .handle { display: grid; place-items: center; } .handle::before { content: ""; width: 3px; height: 36px; border-radius: 2px; background: var(--border); }

  .left { display: flex; flex-direction: column; min-width: 0; padding: 8px 0 8px 8px; }
  .hdr { display: flex; align-items: center; gap: 8px; height: 44px; margin-bottom: 8px; }
  .search { flex: 1; height: 44px; display: flex; align-items: center; gap: 10px; padding: 0 12px; background: var(--input); border: 1px solid var(--border); border-radius: 8px; color: var(--muted-foreground); font-size: 15px; }
  .search svg { width: 18px; height: 18px; stroke-width: 2; }
  .ibtn { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 8px; color: var(--muted-foreground); flex: none; }
  .ibtn svg { width: 22px; height: 22px; }
  .ibtn.on { background: var(--card); border: 1px solid var(--border); color: var(--foreground); }
  body:has(#v-grid:checked) .ibtn.vg, body:has(#v-table:checked) .ibtn.vt { background: var(--card); border: 1px solid var(--border); color: var(--foreground); }
  .chips { display: none; gap: 8px; align-items: center; height: 40px; margin-bottom: 8px; overflow: hidden; }
  .chip { height: 36px; padding: 0 14px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--border); border-radius: 999px; background: var(--card); font-size: 14px; white-space: nowrap; flex: none; }
  .chip svg { width: 15px; height: 15px; stroke-width: 2; }
  .chip.on { border-color: var(--primary); color: var(--primary); font-weight: 500; }
  .chip.qf { background: var(--chip-tint); color: var(--chip-text); border-color: transparent; }
  .chip.ghost { border-color: transparent; background: transparent; color: var(--muted-foreground); }
  .vsep { width: 1px; height: 22px; background: var(--border); flex: none; }

  .screen { display: none; flex-direction: column; flex: 1; min-height: 0; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 0; position: relative; }
  .scroller { flex: 1; min-height: 0; overflow: auto; }
  .crumbwrap { background: var(--card); border-bottom: 1px solid var(--border); padding: 0 8px; }
  .crumb { display: flex; align-items: center; gap: 4px; min-height: 44px; flex-wrap: wrap; }
  .crumb .back { display: inline-flex; align-items: center; gap: 4px; height: 40px; padding: 0 10px; border-radius: 8px; font-weight: 500; color: var(--foreground); }
  .crumb .back.last { padding-left: 6px; }
  .crumb .back:hover { background: var(--muted); }
  .crumb .back svg { width: 16px; height: 16px; stroke-width: 2.2; }
  .crumb .sep { color: var(--border); font-size: 18px; }
  .crumb .here { font-weight: 600; padding: 0 4px; }
  .crumb .det { color: var(--muted-foreground); margin-left: 4px; }
  .screen > .crumb { margin: -4px 0 4px; }

  /* tiles */
  .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 8px; }
  .tile { position: relative; display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 10px; background: var(--card); overflow: hidden; min-height: 150px; transition: opacity .22s ease-out, transform .22s ease-out; }
  @starting-style { .screen .tile { opacity: 0; transform: scale(.94); } }
  .tile .img { aspect-ratio: 16/10; background: var(--img); display: grid; place-items: center; color: var(--muted-foreground); position: relative; }
  .tile .img svg { width: 26px; height: 26px; opacity: .55; }
  .tile .img.none { background: var(--muted); }
  .tile .tx { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 2px; min-height: 56px; }
  .tile .nm { font-size: 15px; font-weight: 500; line-height: 1.25; }
  .tile .pr { font-size: 14px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
  .tile .sub { font-size: 12.5px; color: var(--muted-foreground); }
  .tile .sub.low { color: var(--warning); }
  .tile .addc { position: absolute; right: 8px; bottom: 8px; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); display: grid; place-items: center; color: var(--primary); }
  .tile .addc svg { width: 16px; height: 16px; stroke-width: 2.2; }
  .tile.variable .addc { color: var(--muted-foreground); }
  .tile .vbadge { position: absolute; top: 8px; right: 8px; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: var(--card); border: 1px solid var(--border); color: var(--muted-foreground); }
  .tile.parent { border-color: var(--primary); }
  .tile.parent .addc { color: var(--foreground); }
  .tiles.under { opacity: .18; pointer-events: none; }
  .tiles.under .tile { transition: none; }

  /* term tiles */
  .tile.term.photo .img { background: oklch(var(--tint-l) var(--tint-c) var(--h)); color: oklch(var(--tint-fg-l) .08 var(--h)); }
  .tile.term .plainbody { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 4px; padding: 14px 12px; background: oklch(var(--tint-l) var(--tint-c) var(--h)); color: oklch(var(--tint-fg-l) .1 var(--h)); }
  .tile.term .plainbody .nm { font-size: 18px; font-weight: 600; }
  .tile.term .plainbody .sub { color: oklch(var(--tint-fg-l) .06 var(--h)); opacity: .85; }
  .tile.term.all .plainbody { background: var(--muted); color: var(--foreground); }
  .tile.term.all .plainbody svg { width: 28px; height: 28px; color: var(--muted-foreground); margin-bottom: 4px; }
  .tile.term.all .plainbody .sub { color: var(--muted-foreground); }
  .tile.term.short .plainbody { background: oklch(var(--tint-l) var(--tint-c) var(--h)); }
  .tile.term.short .plainbody .sub { font-size: 12px; }

  /* rows */
  .row { display: grid; grid-template-columns: 56px 1fr 130px 60px; align-items: center; height: 60px; border-bottom: 1px solid var(--border); color: inherit; }
  .row.th { height: 40px; font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted-foreground); }
  .row.th .cell { padding: 0 12px; }
  .row.term { grid-template-columns: 56px 1fr 60px; height: 64px; }
  .row.var { background: color-mix(in oklch, var(--muted) 60%, var(--card)); }
  .cell { padding: 0 12px; display: flex; flex-direction: column; justify-content: center; min-width: 0; font-size: 14.5px; }
  .cell.r { align-items: flex-end; }
  .cell.chev { align-items: center; color: var(--muted-foreground); } .cell.chev svg { width: 20px; height: 20px; }
  .num { font-variant-numeric: tabular-nums; }
  .thumb { width: 40px; height: 40px; border-radius: 8px; background: var(--img); display: grid; place-items: center; color: var(--muted-foreground); margin: 0 8px; font-weight: 600; }
  .thumb svg { width: 18px; height: 18px; opacity: .6; }
  .thumb.sm { width: 32px; height: 32px; margin-left: 24px; }
  .row.term .thumb { background: oklch(var(--tint-l) var(--tint-c) var(--h)); color: oklch(var(--tint-fg-l) .1 var(--h)); }
  .row.term.all .thumb { background: var(--muted); color: var(--muted-foreground); }
  .sub { font-size: 12.5px; color: var(--muted-foreground); }
  .add { width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border); display: grid; place-items: center; color: var(--primary); justify-self: end; margin-right: 8px; }
  .add svg { width: 18px; height: 18px; stroke-width: 2.2; }
  .add.chev { color: var(--muted-foreground); }
  .add.h, .thumb.h { border: 0; background: none; }
  .pillo { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: var(--chip-grey); color: var(--muted-foreground); white-space: nowrap; }
  .pillo.low { background: color-mix(in oklch, var(--warning) 18%, var(--card)); color: var(--warning); }
  .foot { margin-top: auto; display: flex; justify-content: flex-end; gap: 12px; align-items: center; padding: 8px 12px; color: var(--muted-foreground); font-size: 13px; border-top: 1px solid var(--border); background: var(--card); }
  .foot .l { margin-right: auto; }

  .right { background: var(--card); display: flex; flex-direction: column; min-width: 0; }
  .rbar { height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 8px; border-bottom: 1px solid var(--border); background: var(--background); }
  .rbar .place { font-weight: 600; font-size: 16px; }
  .rbar .sp { flex: 1; } .rbar .ibtn { width: 40px; height: 40px; }
  .chead { display: flex; align-items: center; gap: 8px; height: 52px; padding: 6px 8px; }
  .chead .lbl { font-weight: 700; }
  .pill { font-size: 13px; padding: 4px 10px; border-radius: 999px; background: var(--chip-tint); color: var(--chip-text); white-space: nowrap; }
  .chead .sp { flex: 1; } .chead .ibtn { width: 40px; height: 40px; }
  .lines { flex: 1; display: grid; place-items: center; color: var(--muted-foreground); }
  .tabs { display: flex; gap: 6px; padding: 8px; border-top: 1px solid var(--border); }
  .tab { height: 36px; padding: 0 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted-foreground); }
  .tab.on { background: var(--muted); color: var(--foreground); font-weight: 500; }
  .tab .c { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: var(--chip-grey); }

  /* settings sheet */
  .sheet { display: none; position: absolute; top: 0; right: 0; bottom: 0; width: 420px; background: var(--card); border-left: 1px solid var(--border); box-shadow: -20px 0 60px oklch(0 0 0 / .25); flex-direction: column; z-index: 5; }
  body:has(#set:checked) .sheet { display: flex; }
  .sheet .shead { display: flex; align-items: center; height: 56px; padding: 0 16px; border-bottom: 1px solid var(--border); font-weight: 600; font-size: 16px; }
  .sheet .shead .x { margin-left: auto; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 8px; color: var(--muted-foreground); font-size: 20px; }
  .sheet .sbody { padding: 8px 16px; display: flex; flex-direction: column; gap: 18px; overflow: auto; }
  .sheet .f { display: flex; flex-direction: column; gap: 6px; }
  .sheet .f .lab { font-size: 13px; color: var(--muted-foreground); font-weight: 500; }
  .seg { display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .seg label, .seg span { flex: 1; height: 40px; display: grid; place-items: center; font-size: 14px; color: var(--muted-foreground); border-right: 1px solid var(--border); }
  .seg > :last-child { border-right: 0; }
  .seg .onv { background: var(--muted); color: var(--foreground); font-weight: 500; }
  .opts { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .opts label { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 12px; border-bottom: 1px solid var(--border); font-size: 15px; }
  .opts > :last-child { border-bottom: 0; }
  .opts label .d { margin-left: auto; font-size: 12.5px; color: var(--muted-foreground); }
  .opts label svg { width: 18px; height: 18px; stroke-width: 2.4; color: var(--primary); opacity: 0; }
  ${MODES.map((m) => `body:has(#m-${m}:checked) .opts label[for=m-${m}] svg`).join(',')} { opacity: 1; }
  ${MODES.map((m) => `body:has(#m-${m}:checked) .opts label[for=m-${m}]`).join(',')} { background: var(--muted); font-weight: 500; }
  body:has(#v-grid:checked) .seg label[for=v-grid], body:has(#v-table:checked) .seg label[for=v-table] { background: var(--muted); color: var(--foreground); font-weight: 500; }
  .srow { display: flex; align-items: center; height: 44px; font-size: 15px; } .srow .sw { margin-left: auto; width: 44px; height: 26px; border-radius: 13px; background: var(--primary); position: relative; } .srow .sw::after { content: ""; position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; }
  .srow .sw.off { background: var(--border); } .srow .sw.off::after { right: auto; left: 3px; }
  .sfoot { margin-top: auto; display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); }
  .btn { height: 40px; padding: 0 16px; border-radius: 8px; display: inline-flex; align-items: center; font-size: 14px; border: 1px solid var(--border); color: var(--foreground); }
  .btn.p { background: var(--primary); color: var(--primary-foreground); border-color: transparent; }

  /* phone */
  body:has(#w-phone:checked) .frame { width: 400px; }
  body:has(#w-phone:checked) .app { height: 780px; }
  body:has(#w-phone:checked) .rail, body:has(#w-phone:checked) .handle, body:has(#w-phone:checked) .right { display: none; }
  body:has(#w-phone:checked) .main { grid-template-columns: 1fr; }
  body:has(#w-phone:checked) .left { padding: 8px; }
  body:has(#w-phone:checked) .tiles { grid-template-columns: repeat(2, 1fr); }
  body:has(#w-phone:checked) .row { grid-template-columns: 48px 1fr 92px 52px; }
  body:has(#w-phone:checked) .row.term { grid-template-columns: 48px 1fr 44px; }
  body:has(#w-phone:checked) .thumb { margin: 0 4px; }
  body:has(#w-phone:checked) .ibtn.vt, body:has(#w-phone:checked) .ibtn.vg { display: none; }
  body:has(#w-phone:checked) .foot .l { display: none; }
  body:has(#w-phone:checked) .sheet { width: 100%; }
  .ptabs { display: none; height: 56px; border-top: 1px solid var(--border); background: var(--card); align-items: center; justify-content: space-around; font-size: 12px; color: var(--muted-foreground); }
  .ptabs .t { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .ptabs .t.on { color: var(--primary); }
  .ptabs svg { width: 22px; height: 22px; }
  body:has(#w-phone:checked) .ptabs { display: flex; }
  body:has(#w-phone:checked) .left { padding-bottom: 0; }

  ${rules}
</style>
</head>
<body>

${MODES.map((m, i) => `<input type="radio" name="m" id="m-${m}"${i === 1 ? ' checked' : ''}>`).join('')}
${LEVELS.map((l, i) => `<input type="radio" name="lv" id="${l}"${i === 0 ? ' checked' : ''}>`).join('')}
<input type="radio" name="v" id="v-grid" checked><input type="radio" name="v" id="v-table">
<input type="radio" name="w" id="w-tab" checked><input type="radio" name="w" id="w-phone">
<input type="radio" name="t" id="light" checked><input type="radio" name="t" id="dark">
<input type="checkbox" id="set">

<div class="strip">
  <span class="k">Browse by</span>
  <label for="m-all">All products</label><label for="m-cat">Categories</label><label for="m-tag">Tags</label><label for="m-brand">Brands</label><label for="m-short">Shortcuts</label>
  <span class="sep"></span>
  <span class="k">View</span><label for="v-grid">Grid</label><label for="v-table">Table</label>
  <span class="sep"></span>
  <span class="k">Width</span><label for="w-tab">Tablet</label><label for="w-phone">Phone</label>
  <span class="sep"></span>
  <span class="k">Theme</span><label for="light">Light</label><label for="dark">Dark</label>
  <span class="sep"></span>
  <label for="set">Settings sheet</label>
  <span class="hint">Tap tiles, rows and crumbs inside the frame to navigate.</span>
</div>

<div class="frame">
<div class="app">
  <div class="rail">
    <div class="avatar"></div>
    <div class="ico on"><svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M8 9V5h8v4M12 13v4"/></svg></div>
    <div class="ico"><svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M5 12v9h14v-9M12 8c-2-3-6-3-6 0h6c2-3 6-3 6 0"/></svg></div>
    <div class="ico"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg></div>
    <div class="ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 16l8-8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/></svg></div>
    <div class="ico"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6M16 4.5a3.5 3.5 0 0 1 0 7M22 20c0-3-1.5-5-4-5.5"/></svg></div>
    <div class="ico"><svg viewBox="0 0 24 24"><path d="M3 19h18M4 15l5-6 4 4 7-8"/></svg></div>
    <div class="spacer"></div>
    <div class="ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg></div>
  </div>

  <div class="main">
    <div class="left">
      <div class="hdr">
        <div class="search">${I.search}Search products</div>
        <div class="ibtn">${I.scan}</div>
        <label class="ibtn vg" for="v-grid">${I.grid}</label>
        <label class="ibtn vt" for="v-table">${I.list}</label>
        <label class="ibtn" for="set">${I.sliders}</label>
      </div>
      ${barBlocks}
      ${blocks}
      <div class="ptabs">
        <div class="t on"><svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M8 9V5h8v4M12 13v4"/></svg>Products</div>
        <div class="t"><svg viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 11h11L21 7H6.5"/></svg>Cart · 0,00 £</div>
        <div class="t"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>More</div>
      </div>
    </div>

    <div class="handle"></div>

    <div class="right">
      <div class="rbar"><span class="place">Corner Café · Register 1</span><span class="sp"></span>
        <div class="ibtn"><svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="10" rx="1"/><path d="M7 10V6h10v4M3 14h18M12 16v2"/></svg></div>
        <div class="ibtn"><svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/></svg></div>
      </div>
      <div class="chead"><span class="lbl">Customer:</span><span class="pill">Guest ✕</span><span class="sp"></span>
        <div class="ibtn">${I.plus}</div>
        <div class="ibtn">${I.sliders}</div>
      </div>
      <div class="lines">Cart is empty</div>
      <div class="tabs"><span class="tab on">Cart <span class="c">0,00 £</span></span><span class="tab">Cart <span class="c">7,00 £</span></span><span class="tab">+</span></div>
    </div>
  </div>

  <div class="sheet">
    <div class="shead">Product settings<label class="x" for="set">×</label></div>
    <div class="sbody">
      <div class="f"><div class="lab">View</div><div class="seg"><label for="v-grid">Grid</label><label for="v-table">Table</label></div></div>
      <div class="f"><div class="lab">Browse by</div>
        <div class="opts">
          <label for="m-all">${I.check}All products<span class="d">today</span></label>
          <label for="m-cat">${I.check}Categories<span class="d">5 categories</span></label>
          <label for="m-tag">${I.check}Tags<span class="d">8 tags</span></label>
          <label for="m-brand">${I.check}Brands<span class="d">6 brands</span></label>
          <label for="m-short">${I.check}Shortcuts<span class="d">5 quick filters</span></label>
        </div>
      </div>
      <div class="f"><div class="lab">Variations</div><div class="seg"><span class="onv">Drill</span><span>Inline</span></div></div>
      <div class="srow">Show out of stock<span class="sw off"></span></div>
      <div class="srow">Columns<span class="sw" style="background:none;width:auto;color:var(--muted-foreground)">4</span></div>
    </div>
    <div class="sfoot"><span class="btn">Restore</span><label class="btn p" for="set">Close</label></div>
  </div>
</div>
</div>

${caps}

</body>
</html>
`;

writeFileSync(`${OUT_DIR}/index.html`, html);
console.log('wrote', `${OUT_DIR}/index.html`, html.length, 'bytes');
