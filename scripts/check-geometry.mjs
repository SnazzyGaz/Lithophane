#!/usr/bin/env node
// Headless checks for Relief Forge Litho's geometry: runs the app's own script from index.html in Node with a tiny
// stand-in for the page (no browser, no dependencies), then builds meshes for a spread of shapes and fittings and
// checks the print checks. Run: node scripts/check-geometry.mjs   (exit code 1 if anything fails)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const html = readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');

// ---- the page's form controls, with their starting values ----
const defaults = {};
for (const m of html.matchAll(/<input\b[^>]*>/g)) {
  const tag = m[0], id = /\bid="([^"]+)"/.exec(tag); if (!id) continue;
  const type = (/\btype="([^"]+)"/.exec(tag) || [])[1] || 'text', val = (/\bvalue="([^"]*)"/.exec(tag) || [])[1];
  defaults[id[1]] = { tag: 'INPUT', type, value: val ?? (type === 'range' ? '50' : ''), checked: /\bchecked\b/.test(tag) };
}
for (const m of html.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)) {
  const id = /\bid="([^"]+)"/.exec(m[1]); if (!id) continue;
  const opts = [...m[2].matchAll(/<option\b([^>]*)>/g)].map(o => ({ value: (/value="([^"]*)"/.exec(o[1]) || [])[1] ?? '', sel: /\bselected\b/.test(o[1]) }));
  defaults[id[1]] = { tag: 'SELECT', type: 'select', value: (opts.find(o => o.sel) || opts[0] || { value: '' }).value, checked: false, options: opts };
}

// ---- a forgiving stand-in element: known fields are real, anything else is a no-op that returns another stand-in ----
function stub(init = {}) {
  const t = function () {}; Object.assign(t, { hidden: false, disabled: false, textContent: '', innerHTML: '', value: '', checked: false, dataset: {}, style: {},
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, options: [{ text: '' }, { text: '' }], children: [], ...init });
  return new Proxy(t, {
    get(o, k) { if (k in o) return o[k]; if (k === Symbol.toPrimitive) return () => ''; if (typeof k === 'symbol') return undefined; return stub(); },
    set(o, k, v) { o[k] = v; return true; }, apply() { return stub(); },
  });
}
const els = new Map();
const byId = id => { if (!els.has(id)) { const d = defaults[id]; els.set(id, stub(d ? { tagName: d.tag, type: d.type, value: d.value, checked: d.checked, id } : { id })); } return els.get(id); };
const document = stub({ getElementById: byId, querySelectorAll: () => [], querySelector: () => stub(), addEventListener() {}, createElement: () => stub(), body: stub(), activeElement: null });
const store = new Map();
const ctx = {
  document, console, Math, Float32Array, Float64Array, Uint8Array, Uint16Array, Uint32Array, Int32Array, ArrayBuffer, DataView, Map, Set, Promise, JSON, Number, String, Array, Object, Error, Symbol, Blob,
  TextEncoder, URL, setTimeout: () => 0, clearTimeout() {}, requestAnimationFrame: () => 0, navigator: {}, devicePixelRatio: 1,
  localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
  ResizeObserver: class { observe() {} }, Image: class {}, ImageData: class { constructor(w, h) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); } },
  fetch: () => Promise.reject(new Error('offline in tests')), Event: class { constructor(t) { this.type = t; } },
};
ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
for (const src of scripts) vm.runInContext(src.replace(/^const Core = /m, 'var Core = '), ctx, { filename: 'index.html' });
const A = ctx.__lithoApi, S = ctx.__litho;
if (!A || !A.checkGeometry) throw new Error('__lithoApi.checkGeometry missing: is index.html up to date?');

// ---- a test picture: 160 × 120 gradient with a bright disc ----
S.W = 160; S.H = 120; S.mode = 'photo'; S.img = { naturalWidth: 1600, naturalHeight: 1200 }; S.imgName = 'test';
const B = new Float32Array(S.W * S.H); for (let y = 0; y < S.H; y++) for (let x = 0; x < S.W; x++) B[y * S.W + x] = Math.min(1, x / S.W * 0.8 + (Math.hypot(x - 80, y - 60) < 30 ? 0.2 : 0));
const base = Object.fromEntries(Object.entries(defaults).map(([k, d]) => [k, d.type === 'checkbox' ? d.checked : d.value]));
function set(shape, over = {}) {
  for (const [k, v] of Object.entries({ ...base, ...over })) { const e = byId(k); if (typeof v === 'boolean') e.checked = v; else e.value = String(v); }
  S.shape = shape; S.ltBlur = S.ltBlurB = S.ltMir = null;
}

// ---- mesh checks: finite numbers, valid indices, and a closed shell (every edge used by exactly two triangles) ----
function meshProblems(parts, needClosed) {
  const out = [];
  parts.forEach(({ V, I }, p) => {
    for (let k = 0; k < V.length; k++) if (!Number.isFinite(V[k])) { out.push(`part ${p}: non-finite vertex value`); break; }
    const nv = V.length / 3; for (let k = 0; k < I.length; k++) if (I[k] >= nv) { out.push(`part ${p}: index out of range`); break; }
    if (I.length === 0) out.push(`part ${p}: no triangles`);
    if (needClosed) { const E = new Map(); for (let t = 0; t < I.length; t += 3) for (let e = 0; e < 3; e++) { const a = I[t + e], b = I[t + (e + 1) % 3], key = a < b ? a * 4294967296 + b : b * 4294967296 + a; E.set(key, (E.get(key) || 0) + 1); }
      let open = 0, over = 0; for (const c of E.values()) { if (c === 1) open++; else if (c > 2) over++; }
      if (open || over) out.push(`part ${p}: not closed (${open} open edges, ${over} edges shared by 3+ triangles)`); }
  });
  return out;
}

let fails = 0, passes = 0;
const ok = (cond, name, extra = '') => { if (cond) { passes++; console.log('  ok   ' + name); } else { fails++; console.log('  FAIL ' + name + (extra ? '\n       ' + extra : '')); } };
const chk = (shape, over) => { set(shape, over); return A.checkGeometry(A.spec(0)); };

console.log('Good settings build clean meshes and raise no errors');
const good = [
  ['flat', {}], ['flat', { hangD: 5 }], ['flat', { texSide: 'in', picX: 10 }], ['heart', { hangD: 4 }], ['disc', {}], ['arc', {}], ['arc', { texSide: 'in' }],
  ['cyl', {}], ['cyl', { botFit: 'ring', topFit: 'ring' }], ['cyl', { cylA: 180 }], ['cyl', { texSide: 'in', botFit: 'ring' }],
  ['cone', { botFit: 'ring' }], ['cone', { coneB: 60, coneT: 120 }], ['poly', { topFit: 'ring' }], ['poly', { polyN: 4, texSide: 'in' }],
  ['rev', { revProf: 'vase' }], ['rev', { revProf: 'bell', botFit: 'ring' }], ['rev', { revProf: 'barrel' }], ['rev', { revProf: 'hourglass', texSide: 'in' }],
  ['rev', { revProf: 'tulip' }], ['rev', { revProf: 'bowl' }], ['sphere', {}], ['sphere', { sphT: 30 }], ['dome', { botFit: 'ring' }], ['dome', { texSide: 'in' }],
];
for (const [sh, over] of good) {
  set(sh, over); const label = sh + ' ' + JSON.stringify(over);
  const g = A.buildGrid(B, 160), parts = A.buildMesh(g), c = A.checkGeometry(A.spec(0));
  const probs = g.forge ? [] : meshProblems(parts.slice(0, 1), true).concat(meshProblems(parts.slice(1), true));
  let tf = true; for (let k = 0; k < g.T.length; k++) if (!(g.T[k] >= g.tmin - 1e-4 && g.T[k] <= g.TF + 1e-4)) { tf = false; break; }
  ok(probs.length === 0 && tf && c.err.length === 0, label, [...probs, tf ? '' : 'thickness out of range', ...c.err].filter(Boolean).join(' | '));
  if (sh === 'flat' && !over.hangD && !over.picX) { const blob = A.ltSTL(A.buildGrid(B, 0).forge); ok(blob.size === 84 + 50 * A.fullSize().tris, 'flat: fullSize() triangle count matches the saved STL (no grid built)'); }
}

console.log('Impossible settings are caught');
const bad = [
  ['narrow lampshade, texture inside', 'cyl', { cylD: 12, texSide: 'in', ltTmax: 8 }, /textured inside/],
  ['vase with a narrow neck, texture inside', 'rev', { revProf: 'vase', revD: 24, texSide: 'in', ltTmax: 8 }, /textured inside/],
  ['tapered shade with a tiny top, texture inside', 'cone', { coneT: 10, texSide: 'in', ltTmax: 8 }, /textured inside/],
  ['small lantern, texture inside', 'poly', { polyW: 20, texSide: 'in', ltTmax: 8 }, /textured inside/],
  ['small globe, texture inside', 'sphere', { cylD: 12, sphB: 10, texSide: 'in', ltTmax: 8 }, /textured inside/],
  ['narrow vase at the 20 mm minimum, texture inside', 'rev', { revProf: 'bell', revD: 20, texSide: 'in', ltTmax: 8 }, /textured inside/],
  ['tight curved panel, texture inside', 'arc', { ltW: 20, arcA: 300, texSide: 'in', ltTmax: 8 }, /textured inside/],
  ['rims taller than the shade', 'cyl', { cylH: 20, rimT: 12, rimB: 12 }, /no room left for the picture/],
  ['rims taller than the globe', 'sphere', { cylD: 30, rimT: 30, rimB: 30, sphT: 10 }, /no room left for the picture/],
  ['side frames wider than a part-round shade', 'cyl', { cylA: 30, cylD: 30, ltFrame: 20 }, /side frames/],
  ['frame fills the ornament', 'disc', { ltW: 30, ltFrame: 16 }, /frame fills/],
  ['floor + top ring taller than the shade', 'cyl', { cylH: 10, rimT: 0, rimB: 0, botFit: 'ring', topFit: 'ring', plateT: 6 }, /as tall as the whole/],
];
for (const [name, sh, over, re] of bad) { const c = chk(sh, over); ok(c.err.some(t => re.test(t)), name, 'got errors: ' + JSON.stringify(c.err)); }

console.log('Warnings fire');
const warns = [
  ['floor hole bigger than the shade gets reduced', 'cyl', { cylD: 40, botFit: 'ring', holeD: 60 }, /Floor hole reduced to Ø 36\.0 mm/],
  ['top ring hole reduced on a vase neck', 'rev', { revProf: 'vase', topFit: 'ring', holeD: 70 }, /Top ring hole reduced/],
  ['hole reduced more with the texture inside', 'cyl', { cylD: 40, botFit: 'ring', holeD: 60, texSide: 'in' }, /Floor hole reduced to Ø 30\.0 mm/],
  ['floor thicker than the bottom rim', 'cyl', { botFit: 'ring', plateT: 4, rimB: 1 }, /thicker than the bottom rim/],
  ['Thickest too close to Thinnest', 'flat', { ltTmin: 2, ltTmax: 1 }, /at least 0\.2 mm more/],
  ['bottom hole as wide as the globe', 'sphere', { cylD: 40, sphB: 60 }, /Bottom hole/],
];
for (const [name, sh, over, re] of warns) { const c = chk(sh, over); ok(c.warn.some(t => re.test(t)), name, 'got warnings: ' + JSON.stringify(c.warn)); }

console.log('The hole the panel reports is the hole that gets built');
for (const [sh, over] of [['cyl', { cylD: 40, botFit: 'ring', holeD: 60 }], ['rev', { revProf: 'vase', topFit: 'ring', botFit: 'ring', holeD: 70, texSide: 'in' }], ['poly', { polyN: 5, polyW: 50, botFit: 'ring', holeD: 60 }], ['dome', { cylD: 40, botFit: 'ring', holeD: 50 }], ['cone', { topFit: 'ring', holeD: 80 }]]) {
  set(sh, over); const s0 = A.spec(0), g = A.buildGrid(B, 160); A.buildMesh(g);
  const same = s0.extras.length === g.extras.length && s0.extras.every((e, i) => Math.abs(e.holeUsed - g.extras[i].holeUsed) < 0.05);
  ok(same, `${sh}: reported hole ${s0.extras.map(e => (2 * e.holeUsed).toFixed(2)).join('/')} = built ${g.extras.map(e => (2 * e.holeUsed).toFixed(2)).join('/')} mm`);
}

console.log('Spread 0 is kept');
set('cyl', { lt3Spread: '0' }); ok(A.spreadMM() === 0, 'Spread 0 → 0 mm');
set('cyl', { lt3Spread: '' }); ok(A.spreadMM() === 0.3, 'Spread empty → 0.3 mm (default)');
set('cyl', { lt3Spread: '1.2' }); ok(A.spreadMM() === 1.2, 'Spread 1.2 → 1.2 mm');

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
