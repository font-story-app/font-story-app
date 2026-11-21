// FontStory Mini App front-end — Poufi-style UI, plain JS, no framework.
// Talks to the bot only through tgcloud endpoints:
//   register, saveDesign, myDesigns, deleteDesign
// (Telegram.WebApp.Serverless.call sends verified init data for us.)

const FONTS = [
  { id: 'Vazir', label: 'وزیر', family: "'Vazir', sans-serif", lang: 'fa' },
  { id: 'IRANYekanXNoEn', label: 'ایران یکان ایکس', family: "'IRANYekanXNoEn', sans-serif", lang: 'fa' },
  { id: 'IRAN', label: 'ایران', family: "'IRAN', sans-serif", lang: 'fa' },
  { id: 'YekanBakh', label: 'یکان‌بخ', family: "'Yekan Bakh NoEn', sans-serif", lang: 'fa' },
  { id: 'Vazirmatn', label: 'وزیرمتن', family: "'Vazirmatn', sans-serif", lang: 'fa' },
  { id: 'Lalezar', label: 'لاله‌زار', family: "'Lalezar', sans-serif", lang: 'fa' },
  { id: 'Estedad', label: 'استعداد', family: "'Estedad', sans-serif", lang: 'fa' },
  { id: 'Parastoo', label: 'پرستو', family: "'Parastoo', sans-serif", lang: 'fa' },
  { id: 'Amiri', label: 'امیری', family: "'Amiri', serif", lang: 'fa' },
  // From the Ghalamoom «best free Persian fonts» list (2026-11-16): the
  // four rastikerdar fonts, lazy-loaded from their jsDelivr font-face.css
  // (same pattern as Vazir). Weights are the faces each CSS declares.
  { id: 'Shabnam', label: 'شبنم', family: "'Shabnam', sans-serif", lang: 'fa', lazy: true, gname: 'Shabnam', cssUrl: 'https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@master/dist/font-face.css', weights: [100, 300, 400, 500, 700] },
  { id: 'Sahel', label: 'ساحل', family: "'Sahel', sans-serif", lang: 'fa', lazy: true, gname: 'Sahel', cssUrl: 'https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@master/dist/font-face.css', weights: [300, 400, 600, 700, 900] },
  { id: 'Samim', label: 'صمیم', family: "'Samim', sans-serif", lang: 'fa', lazy: true, gname: 'Samim', cssUrl: 'https://cdn.jsdelivr.net/gh/rastikerdar/samim-font@master/dist/font-face.css', weights: [400, 500, 700] },
  { id: 'Gandom', label: 'گندم', family: "'Gandom', sans-serif", lang: 'fa', lazy: true, gname: 'Gandom', cssUrl: 'https://cdn.jsdelivr.net/gh/rastikerdar/gandom-font@master/dist/font-face.css', weights: [400] },
  // Self-hosted (downloaded from Ghalamoom, converted TTF -> WOFF2 into
  // web/fonts/ — local only, NOT in the repo, served by tgcloud static
  // hosting like the 3 bought fonts).
  { id: 'SGKara', label: 'کارا', family: "'SG Kara', sans-serif", lang: 'fa' },
  { id: 'MolsaqArabic', label: 'ملصق', family: "'Molsaq Arabic', sans-serif", lang: 'fa' },
  { id: 'Dastkhat', label: 'دستخط', family: "'Dastkhat', sans-serif", lang: 'fa' },
  // English fonts (Google Fonts, lazy-loaded — see ensureLazyFont):
  // nothing is fetched until the card scrolls into view or the font is
  // picked, so the first paint stays light. `css` is the css2 family
  // param, `weights` the faces we load, `sample` the Latin preview text
  // (these faces have no Persian glyphs).
  { id: 'Poppins', label: 'Poppins', family: "'Poppins', sans-serif", lang: 'en', lazy: true, gname: 'Poppins', css: 'family=Poppins:wght@400;700;900', weights: [400, 700, 900], sample: 'Your text' },
  { id: 'Montserrat', label: 'Montserrat', family: "'Montserrat', sans-serif", lang: 'en', lazy: true, gname: 'Montserrat', css: 'family=Montserrat:wght@400;700;900', weights: [400, 700, 900], sample: 'Your text' },
  { id: 'BebasNeue', label: 'Bebas Neue', family: "'Bebas Neue', sans-serif", lang: 'en', lazy: true, gname: 'Bebas Neue', css: 'family=Bebas+Neue', weights: [400], sample: 'Your text' },
  { id: 'Anton', label: 'Anton', family: "'Anton', sans-serif", lang: 'en', lazy: true, gname: 'Anton', css: 'family=Anton', weights: [400], sample: 'Your text' },
  { id: 'Oswald', label: 'Oswald', family: "'Oswald', sans-serif", lang: 'en', lazy: true, gname: 'Oswald', css: 'family=Oswald:wght@400;600;700', weights: [400, 600, 700], sample: 'Your text' },
  { id: 'PlayfairDisplay', label: 'Playfair Display', family: "'Playfair Display', serif", lang: 'en', lazy: true, gname: 'Playfair Display', css: 'family=Playfair+Display:wght@400;700;900', weights: [400, 700, 900], sample: 'Your text' },
  { id: 'DancingScript', label: 'Dancing Script', family: "'Dancing Script', cursive", lang: 'en', lazy: true, gname: 'Dancing Script', css: 'family=Dancing+Script:wght@400;700', weights: [400, 700], sample: 'Your text' },
  { id: 'Lobster', label: 'Lobster', family: "'Lobster', cursive", lang: 'en', lazy: true, gname: 'Lobster', css: 'family=Lobster', weights: [400], sample: 'Your text' },
  { id: 'Pacifico', label: 'Pacifico', family: "'Pacifico', cursive", lang: 'en', lazy: true, gname: 'Pacifico', css: 'family=Pacifico', weights: [400], sample: 'Your text' },
  { id: 'Caveat', label: 'Caveat', family: "'Caveat', cursive", lang: 'en', lazy: true, gname: 'Caveat', css: 'family=Caveat:wght@400;700', weights: [400, 700], sample: 'Your text' },
  { id: 'ArchivoBlack', label: 'Archivo Black', family: "'Archivo Black', sans-serif", lang: 'en', lazy: true, gname: 'Archivo Black', css: 'family=Archivo+Black', weights: [400], sample: 'Your text' },
  { id: 'Rubik', label: 'Rubik', family: "'Rubik', sans-serif", lang: 'en', lazy: true, gname: 'Rubik', css: 'family=Rubik:wght@400;700;900', weights: [400, 700, 900], sample: 'Your text' },
  // Note: Liana (Poufi's default) is a commercial FontIran font with no
  // public CDN — it is intentionally NOT listed here until Reza buys /
  // self-hosts it. Vazir comes from jsDelivr (not Google Fonts); the other
  // five are all real Google Fonts.
];

const STYLES = [
  { id: 'bold', label: 'پررنگ' },
  { id: 'highlight', label: 'هایلایت' },
  { id: 'neon', label: 'نئون' },
  { id: 'glass', label: 'شیشه‌ای' },
  { id: 'retro', label: 'رترو' },
  { id: 'shadow', label: 'سایه‌دار' },
  { id: 'glow', label: 'درخشان' },
  { id: 'gradient', label: 'گرادیان' },
  { id: 'stroke', label: 'استروک' },
  { id: 'brush', label: 'قلم‌مو' },
  { id: 'pastille', label: 'پاستیل' },
  { id: 'round', label: 'راوند' },
  { id: 'arcadia', label: 'آرکادیا' },
  { id: 'underline', label: 'خط زیر' },
  { id: 'pixel', label: 'پیکسلی' },
  { id: 'quotes', label: 'نقل‌قول' },
  { id: 'winter', label: 'زمستانی' },
  { id: 'rosseta', label: 'رُزتا' },
  { id: 'sticker', label: 'استیکر' },
  { id: 'tweet', label: 'توییت' },
];

const COLORS = ['#FFFFFF', '#1F2421', '#E6483F', '#F4D93E', '#3FA98A', '#2E7DD1'];

// Per-style extra controls, shown in the settings sheet under
// «تنظیمات این استایل» for the currently selected style.
// type 'range': { min, max, step, def, unit } — type 'color': { def }.
const STYLE_CONTROLS = {
  neon: [
    { key: 'neonGlow', label: 'شدت درخشش', type: 'range', min: 0, max: 80, step: 1, def: 45, unit: '' },
  ],
  glow: [
    { key: 'glowGlow', label: 'شدت درخشش', type: 'range', min: 0, max: 80, step: 1, def: 35, unit: '' },
  ],
  winter: [
    { key: 'winterGlow', label: 'شدت درخشش', type: 'range', min: 0, max: 60, step: 1, def: 30, unit: '' },
  ],
  glass: [
    { key: 'glassOpacity', label: 'غلظت شیشه', type: 'range', min: 5, max: 50, step: 1, def: 16, unit: '٪' },
  ],
  retro: [
    { key: 'retroOffset', label: 'فاصله لایه‌ها', type: 'range', min: 0, max: 30, step: 1, def: 10, unit: 'px' },
  ],
  shadow: [
    { key: 'shadowBlur', label: 'میزان سایه', type: 'range', min: 0, max: 40, step: 1, def: 22, unit: 'px' },
    { key: 'shadowOffset', label: 'فاصله سایه', type: 'range', min: 0, max: 30, step: 1, def: 12, unit: 'px' },
  ],
  gradient: [
    { key: 'gradientC1', label: 'رنگ اول گرادیان', type: 'color', def: '#FF2E88' },
    { key: 'gradientC2', label: 'رنگ دوم گرادیان', type: 'color', def: '#F4D93E' },
  ],
  arcadia: [
    { key: 'arcadiaC1', label: 'رنگ اول گرادیان', type: 'color', def: '#FF7A18' },
    { key: 'arcadiaC2', label: 'رنگ دوم گرادیان', type: 'color', def: '#FF2E63' },
  ],
  stroke: [
    { key: 'strokeWidth', label: 'ضخامت خط دور', type: 'range', min: 5, max: 25, step: 1, def: 14, unit: '٪' },
  ],
  pastille: [
    { key: 'pastilleStroke', label: 'ضخامت خط دور', type: 'range', min: 5, max: 20, step: 1, def: 10, unit: '٪' },
  ],
  round: [
    { key: 'roundStroke', label: 'ضخامت خط دور', type: 'range', min: 4, max: 16, step: 1, def: 8, unit: '٪' },
  ],
  rosseta: [
    { key: 'rossetaStroke', label: 'ضخامت خط دور', type: 'range', min: 1, max: 8, step: 0.5, def: 2.5, unit: 'px' },
  ],
  brush: [
    { key: 'brushTilt', label: 'کجی قلم‌مو', type: 'range', min: -10, max: 10, step: 1, def: -2, unit: '°' },
  ],
  underline: [
    { key: 'underlineWidth', label: 'ضخامت خط زیر', type: 'range', min: 2, max: 40, step: 1, def: 8, unit: 'px' },
    { key: 'underlineC1', label: 'رنگ اول خط زیر', type: 'color', def: '#7C3AED' },
    { key: 'underlineC2', label: 'رنگ دوم خط زیر', type: 'color', def: '#2563EB' },
  ],
  pixel: [
    { key: 'pixelSize', label: 'اندازه پیکسل', type: 'range', min: 2, max: 12, step: 1, def: 6, unit: 'px' },
  ],
  sticker: [
    { key: 'stickerOutline', label: 'ضخامت خط دور', type: 'range', min: 5, max: 20, step: 1, def: 12, unit: '٪' },
    { key: 'stickerShadow', label: 'فاصله سایه', type: 'range', min: 0, max: 40, step: 1, def: 25, unit: '٪' },
  ],
  // Tweet: everything is editable — name, handle, like/reply counts,
  // card colour, and the avatar (its own row below, in
  // renderStyleControls). The defaults are the FontStory brand.
  tweet: [
    { key: 'tweetTextSize', label: 'اندازه فونت متن', type: 'range', min: 50, max: 150, step: 5, def: 100, unit: '٪' },
    { key: 'tweetName', label: 'نام', type: 'text', def: 'FontStory', max: 30 },
    { key: 'tweetHandle', label: 'هندل', type: 'text', def: '@fontstory', max: 30 },
    { key: 'tweetLikes', label: 'لایک‌ها', type: 'text', def: '4.1k', max: 12 },
    { key: 'tweetReplies', label: 'ریپلای‌ها', type: 'text', def: '18', max: 12 },
    { key: 'tweetCard', label: 'رنگ کارت', type: 'color', def: '#000000' },
  ],
};

// Flat key -> control map, for defaults and sanitising.
const STYLE_PARAM_DEFS = {};
for (const list of Object.values(STYLE_CONTROLS)) {
  for (const c of list) STYLE_PARAM_DEFS[c.key] = c;
}

// Read one per-style parameter, falling back to its default.
function sp(key) {
  const v = state.styleParams[key];
  return v === undefined ? STYLE_PARAM_DEFS[key]?.def : v;
}

// Keep only known keys, clamped/validated (input may be an object or a
// JSON string, e.g. a saved design from the server).
function sanitizeStyleParams(input) {
  let raw = input;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = {}; }
  }
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const [key, c] of Object.entries(STYLE_PARAM_DEFS)) {
    const v = raw[key];
    if (c.type === 'color') {
      if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) out[key] = v;
    } else if (c.type === 'text') {
      // Free text (tweet header/footer): trimmed, capped, empty = unset.
      if (typeof v === 'string') {
        const t = v.trim().slice(0, c.max || 30);
        if (t) out[key] = t;
      }
    } else {
      const n = Number(v);
      if (Number.isFinite(n)) out[key] = Math.min(c.max, Math.max(c.min, n));
    }
  }
  return out;
}
const ASPECTS = { '9:16': [1080, 1920], '1:1': [1080, 1080] };

// Poufi-style background gradients (pink-orange default, cycles on tap).
// Black and white are solid colours, not gradients — same list, same cycle.
const BACKGROUNDS = [
  'linear-gradient(180deg, #ff3b5c 0%, #ff7a3d 100%)',
  'linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)',
  'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
  'linear-gradient(180deg, #0ea47a 0%, #84cc16 100%)',
  '#000000',
  '#FFFFFF',
];

const state = {
  text: 'سلام دنیا',
  font: 'Vazir',
  style: 'bold',
  color: '#FFFFFF',
  // Has the user picked a text colour in the رنگ tab? The box styles
  // (highlight, brush) auto-contrast their text against the box colour
  // until the user does — so the default stay readable, but the text
  // colour becomes changeable the moment they pick one.
  colorTouched: false,
  aspect: '1:1',
  align: 'center',
  size: 110,
  bg: 0,
  caret: false,
  weight: 800,
  letterSpacing: 0,
  wordSpacing: 0,
  lineHeight: 1.4,
  rotX: 0,
  rotY: 0,
  // Style settings (2026-11-15): background/border colour for the styles
  // that have a box, and the box's corner radius.
  styleColor: '#F4D93E',
  borderRadius: 18,
  // Per-style extras (2026-11-15): only the keys the user touched are
  // stored; sp() falls back to each control's default.
  styleParams: {},
};

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
let ctx = canvas.getContext('2d');
// NOTE: `ctx` is `let`, not `const` — paintStickerSamples() temporarily
// swaps it to a card's small canvas so the sticker preview is painted
// with the real sticker code (restored in a finally).
const statusEl = $('status');
const textInput = $('textInput');
let toastTimer = null;

// Dismissible "tap to type" hint: the × hides it and remembers the
// choice, so it stays gone on later opens.
const hintPill = $('hintPill');
const hintClose = $('hintClose');
try {
  if (localStorage.getItem('fontstory:hintDismissed') === '1') hintPill?.classList.add('hidden');
} catch { /* private mode */ }
hintClose?.addEventListener('click', (e) => {
  e.stopPropagation();
  hintPill?.classList.add('hidden');
  try { localStorage.setItem('fontstory:hintDismissed', '1'); } catch { /* private mode */ }
});

function setStatus(msg, sticky) {
  if (!msg) { statusEl.hidden = true; return; }
  statusEl.textContent = msg;
  statusEl.hidden = false;
  clearTimeout(toastTimer);
  // Sticky toasts (e.g. "sending…") stay up until the next status
  // replaces them, so a slow request never looks like it vanished.
  if (!sticky) toastTimer = setTimeout(() => { statusEl.hidden = true; }, 2600);
}
function inTelegram() { return typeof Telegram !== 'undefined' && Telegram.WebApp; }

function callEndpoint(name, input) {
  return new Promise((resolve, reject) => {
    if (!inTelegram() || !Telegram.WebApp.Serverless) {
      reject(new Error('خارج از تلگرام باز شده — ذخیره و کارهای اخیر فقط داخل تلگرام کار می‌کنه.'));
      return;
    }
    Telegram.WebApp.Serverless.call(name, input || {}, (err, result) => {
      if (err) reject(new Error(err.message || 'خطا در تماس با سرور'));
      else resolve(result);
    });
  });
}

// --- Canvas rendering (transparent background; PNG export has no bg) ---
function fontFamily() {
  const f = FONTS.find((x) => x.id === state.font) || importedFonts.get(state.font);
  return f ? f.family : "'Vazirmatn', sans-serif";
}

function isRTLText(text) {
  // Persian/Arabic/Hebrew ranges — the app is Persian-first.
  return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

function spaceWidth() {
  return ctx.measureText(' ').width;
}

// Full width of one line, including letter + word spacing.
function lineWidth(line) {
  const words = line.split(' ').filter((w) => w !== '');
  if (!words.length) return 0;
  let total = words.reduce((sum, w) => sum + ctx.measureText(w).width, 0);
  total += (words.length - 1) * (spaceWidth() + state.wordSpacing);
  return total;
}

// Text colour that stays readable on a given background: dark text on
// light backgrounds, white text on dark ones.
function contrastText(hex) {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex || '');
  if (!m) return '#FFFFFF';
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1F2421' : '#FFFFFF';
}

// '#RRGGBB' + opacity -> 'rgba(r,g,b,a)'.
function hexAlpha(hex, alpha) {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex || '');
  if (!m) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function wrapLines(text, maxWidth) {
  return wrapLineRanges(text, maxWidth).map((r) => r.text);
}

// Same wrapping as wrapLines, but each line also carries its character
// range [start, end] in the original text — the canvas-drawn selection
// highlight needs to know which characters each line holds. Keep the
// wrapping loop identical to wrapLines so the ranges never drift.
// \n is a hard break: wrap each paragraph on its own and keep empty
// lines, so Enter in the editor really moves to the next line.
function wrapLineRanges(text, maxWidth) {
  const ranges = [];
  let paraStart = 0;
  for (const para of text.split('\n')) {
    const words = [...para.matchAll(/\S+/g)].map((m) => ({ w: m[0], i: m.index }));
    if (!words.length) { ranges.push({ text: '', start: paraStart, end: paraStart }); paraStart += para.length + 1; continue; }
    let line = '';
    let lineStart = -1; // offset of the line's first word in the original text
    let lineEnd = -1;   // offset just past the line's last word
    for (const { w, i } of words) {
      const test = line ? line + ' ' + w : w;
      if (lineWidth(test) > maxWidth && line) {
        ranges.push({ text: line, start: lineStart, end: lineEnd });
        line = w; lineStart = paraStart + i; lineEnd = paraStart + i + w.length;
      } else {
        if (!line) lineStart = paraStart + i;
        line = test; lineEnd = paraStart + i + w.length;
      }
    }
    if (line) ranges.push({ text: line, start: lineStart, end: lineEnd });
    paraStart += para.length + 1;
  }
  return ranges.length ? ranges : [{ text: '', start: 0, end: 0 }];
}

// Width of the first n characters of a line, measured the same way the
// line is drawn (word by word, with the word gaps). Used to place the
// canvas-drawn selection highlight. extraGap is the justify stretch
// for this line (0 unless the line is justified — see justifyGap).
function prefixWidth(line, n, extraGap = 0) {
  n = Math.max(0, Math.min(n, line.length));
  if (n === 0) return 0;
  const words = line.split(' ').filter((w) => w !== '');
  const gap = spaceWidth() + state.wordSpacing + extraGap;
  let x = 0, off = 0;
  for (const w of words) {
    if (n <= off) return x;
    if (n <= off + w.length) {
      const k = n - off;
      // The boundary after k chars of a word sits one letter-spacing
      // past the measured k-char prefix (the spacing before the next
      // char), except at the word's edges.
      const extra = (k > 0 && k < w.length && 'letterSpacing' in ctx) ? state.letterSpacing : 0;
      return x + ctx.measureText(w.slice(0, k)).width + extra;
    }
    x += ctx.measureText(w).width + gap;
    off += w.length + 1;
  }
  return x;
}

// Draw one line word by word (word spacing has no canvas API, so the
// words are positioned manually). RTL text runs right-to-left.
function drawWords(line, cx, y, dx = 0, dy = 0, mode = 'fill') {
  const words = line.split(' ').filter((w) => w !== '');
  if (!words.length) return;
  const lw = lineWidth(line);
  const rtl = isRTLText(line);
  const gap = spaceWidth() + state.wordSpacing + lineJustifyGap;
  // A justified line is wider than its natural width: the extra gap
  // per word gap stretches it to the block's full width.
  const visW = lw + lineJustifyGap * (words.length - 1);
  let x = rtl ? cx + visW / 2 : cx - visW / 2;
  ctx.textAlign = rtl ? 'right' : 'left';
  for (const word of words) {
    if (mode === 'stroke') ctx.strokeText(word, x + dx, y + dy);
    else ctx.fillText(word, x + dx, y + dy);
    const ww = ctx.measureText(word).width;
    x += rtl ? -(ww + gap) : (ww + gap);
  }
  ctx.textAlign = 'center';
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// --- Style painting ---
// Each paint function draws ONE line of text at (cx, y) with that style's
// look. `lw` is the line's full width (incl. spacing), `fs` the font size.
function bgBox(cx, y, lw, fs, { fill, stroke, strokeWidth = 0, radius = 18, padX = 28 }) {
  const h = fs * 1.24;
  const w = lw + padX * 2;
  const r = Math.min(radius, h / 2, w / 2);
  ctx.save();
  roundRect(cx - w / 2, y - h / 2, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeWidth; ctx.stroke(); }
  ctx.restore();
}

function textGradient(cx, lw, stops) {
  const g = ctx.createLinearGradient(cx - lw / 2, 0, cx + lw / 2, 0);
  stops.forEach(([at, color]) => g.addColorStop(at, color));
  return g;
}

function strokeWords(line, cx, y, color, width, dx = 0, dy = 0) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  drawWords(line, cx, y, dx, dy, 'stroke');
  ctx.restore();
}

const STYLE_PAINT = {
  bold: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  highlight: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: state.styleColor, radius: state.borderRadius, padX: 24 });
    // Text colour: the رنگ tab's colour once the user picks one, else
    // auto-contrast against the box so the default stays readable.
    ctx.fillStyle = state.colorTouched ? state.color : contrastText(state.styleColor); drawWords(line, cx, y);
  },
  neon: (line, cx, y) => {
    ctx.shadowColor = state.color; ctx.shadowBlur = sp('neonGlow'); ctx.fillStyle = state.color;
    drawWords(line, cx, y); ctx.shadowBlur = 0; drawWords(line, cx, y);
  },
  glow: (line, cx, y) => {
    ctx.shadowColor = state.color; ctx.shadowBlur = sp('glowGlow'); ctx.fillStyle = state.color;
    drawWords(line, cx, y); ctx.shadowBlur = 0; drawWords(line, cx, y);
  },
  glass: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  retro: (line, cx, y) => {
    const v = sp('retroOffset');
    ctx.fillStyle = '#FF2E88'; drawWords(line, cx, y, v, v);
    ctx.fillStyle = '#22D3EE'; drawWords(line, cx, y, -0.6 * v, -0.6 * v);
    ctx.fillStyle = state.color; drawWords(line, cx, y);
  },
  shadow: (line, cx, y) => {
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = sp('shadowBlur'); ctx.shadowOffsetY = sp('shadowOffset');
    ctx.fillStyle = state.color; drawWords(line, cx, y);
  },
  gradient: (line, cx, y, lw) => {
    ctx.fillStyle = textGradient(cx, lw, [[0, sp('gradientC1')], [1, sp('gradientC2')]]);
    drawWords(line, cx, y);
  },
  stroke: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#111111', fs * (sp('strokeWidth') / 100));
    ctx.fillStyle = state.color; drawWords(line, cx, y);
  },
  brush: (line, cx, y, lw, fs) => {
    ctx.save(); ctx.translate(cx, y); ctx.rotate((sp('brushTilt') * Math.PI) / 180);
    ctx.fillStyle = state.styleColor;
    roundRect(-lw / 2 - 30, -fs * 0.62, lw + 60, fs * 1.24, state.borderRadius); ctx.fill(); ctx.restore();
    ctx.fillStyle = state.colorTouched ? state.color : contrastText(state.styleColor); drawWords(line, cx, y);
  },
  pastille: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#7c3aed', fs * (sp('pastilleStroke') / 100));
    ctx.fillStyle = state.color; drawWords(line, cx, y);
  },
  round: (line, cx, y, lw, fs) => {
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    strokeWords(line, cx, y, '#ffffff', fs * (sp('roundStroke') / 100));
    ctx.fillStyle = state.color; drawWords(line, cx, y);
  },
  arcadia: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#ffffff', fs * 0.06);
    ctx.fillStyle = textGradient(cx, lw, [[0, sp('arcadiaC1')], [1, sp('arcadiaC2')]]);
    drawWords(line, cx, y);
  },
  underline: (line, cx, y, lw, fs) => {
    ctx.fillStyle = state.color; drawWords(line, cx, y);
    const uw = sp('underlineWidth');
    ctx.save(); ctx.fillStyle = textGradient(cx, lw, [[0, sp('underlineC1')], [1, sp('underlineC2')]]);
    roundRect(cx - lw / 2, y + fs * 0.58, lw, uw, Math.min(4, uw / 2)); ctx.fill(); ctx.restore();
  },
  pixel: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  quotes: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  winter: (line, cx, y) => {
    ctx.shadowColor = state.color; ctx.shadowBlur = sp('winterGlow'); ctx.fillStyle = state.color;
    drawWords(line, cx, y); ctx.shadowBlur = 0; drawWords(line, cx, y);
  },
  rosseta: (line, cx, y, lw, fs) => {
    ctx.font = `300 ${fs}px ${fontFamily()}`;
    strokeWords(line, cx, y, '#a7f3d0', sp('rossetaStroke'));
  },
  sticker: (line, cx, y, lw, fs) => {
    // Sticker look, matched to the reference (restored 2026-11-16: Reza
    // tried the maroon as a concentric ring in v4, liked it, but asked
    // for the maroon layer back as a shadow): golden fill, red outline
    // (border 1), a solid maroon shadow (border 2, the darker one) and a
    // thick white outer outline (border 3) wrapping the whole silhouette.
    // The maroon is a 3D EXTRUSION — the text shape swept from (0,0) to
    // (dx,dy), filled solid — so the maroon band hugs the red outline
    // continuously, exactly filled. A single shifted copy can't do that:
    // it breaks up below short letters and in word gaps, leaving white
    // between the maroon and the text. The white ring is stroked at every
    // sweep step too, so it wraps the swept silhouette uniformly.
    const w = fs * (sp('stickerOutline') / 100);
    const ww = w * 2.5;
    const dy = fs * (sp('stickerShadow') / 100);
    const dx = -0.6 * dy;
    const steps = Math.max(1, Math.min(24, Math.ceil(Math.hypot(dx, dy) / 3)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      strokeWords(line, cx, y, '#ffffff', ww, dx * t, dy * t);
    }
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      ctx.fillStyle = '#5C1220';
      drawWords(line, cx, y, dx * t, dy * t);
    }
    strokeWords(line, cx, y, '#ED1C24', w);
    ctx.fillStyle = '#FFC531';
    drawWords(line, cx, y);
  },
  // Tweet card: the text itself is grey (the black card + header +
  // footer are painted block-level in draw(), like glass/quotes).
  tweet: (line, cx, y) => {
    // Grey by default (the mockup); a colour picked in the رنگ tab wins.
    ctx.fillStyle = state.colorTouched ? state.color : '#A1A1AA';
    drawWords(line, cx, y);
  },
};

// Text alignment happens INSIDE the text block, which stays centred on
// the canvas: وسط‌چین centres each line; راست‌چین lines every line's
// right edge up with the widest line's right edge, چپ‌چین every line's
// left edge with the widest line's left edge. هم‌تراز (justify) stretches
// every line that already covers at least 60% of the block to the
// block's full width (gap > 0 means this line is stretched, so its
// centre is the block centre); a shorter line stays natural and anchors
// to the start side (right for RTL, left for LTR). A single line never moves.
function alignCx(lw, maxLw, line = '', gap = 0) {
  const w = canvas.width || 1080;
  if (state.align === 'right') return w / 2 + maxLw / 2 - lw / 2;
  if (state.align === 'left') return w / 2 - maxLw / 2 + lw / 2;
  if (state.align === 'justify') {
    if (gap > 0) return w / 2;
    return isRTLText(line) ? w / 2 + maxLw / 2 - lw / 2 : w / 2 - maxLw / 2 + lw / 2;
  }
  return w / 2;
}

// Extra px added to each word gap when the alignment is justify: the
// line is stretched to the block's full width. A line is only stretched
// when it already covers at least 60% of the block — stretching a much
// shorter line would leave absurd gaps between its few words (e.g. a
// two-word last line «می کنم»). Single-word lines have no gap to
// stretch. The last line of a paragraph stretches too when it is long
// enough — that is the point of justify here: two Enter-separated
// lines of similar length end up the same length.
let lineJustifyGap = 0;
function justifyGap(line, lw, maxLw) {
  if (state.align !== 'justify') return 0;
  const words = line.split(' ').filter((w) => w !== '');
  if (words.length < 2) return 0;
  if (lw < maxLw * 0.6) return 0;
  const extra = maxLw - lw;
  if (extra <= 0) return 0;
  return extra / (words.length - 1);
}

// The text block's rect from the last draw (canvas px): centre, half-size
// and the rotation scales — used by tap-to-dismiss below.
let lastBlock = null;

// Caret position for a text offset p: which visual line it is on, the
// x of the char boundary and the line's centre y. Follows the same
// ranges/widths the selection highlight uses, so the caret always sits
// on the visible glyphs. A p in a gap (the space/newline between two
// lines) lands at the end of the upper line; p at a line's start lands
// at the start of that line.
function caretGeometry(p, lineRanges, lines, maxLw, lineHeight, blockH, h, gaps = null) {
  let li = 0;
  for (let i = 0; i < lineRanges.length; i++) {
    if (lineRanges[i].start <= p) li = i; else break;
  }
  const lr = lineRanges[li];
  const line = lines[li];
  const n = Math.max(0, Math.min(p - lr.start, line.length));
  const lw = lineWidth(line);
  const gap = gaps ? gaps[li] || 0 : 0;
  const lcx = alignCx(lw, maxLw, line, gap);
  const y = h / 2 - blockH / 2 + lineHeight / 2 + li * lineHeight;
  const visW = lw + gap * Math.max(0, line.split(' ').filter((w) => w !== '').length - 1);
  const x = isRTLText(line) ? lcx + visW / 2 - prefixWidth(line, n, gap) : lcx - visW / 2 + prefixWidth(line, n, gap);
  return { x, y, li, n };
}

// Minimum size of the tweet card: at least as wide as its chrome — the
// header row (avatar + name/handle + X logo) and the footer line,
// measured at their own font sizes — and at least as tall as one
// full-size body line. Without it, a small body text (tweetTextSize <
// 100%) shrinks the card until the name runs into the X logo and the
// footer is clipped (Reza's screenshot, 2026-11-21). The caller's
// ctx.font is restored.
function tweetMinSize(fs) {
  const name = (sp('tweetName') || '').trim() || 'FontStory';
  let handle = (sp('tweetHandle') || '').trim() || '@fontstory';
  if (!handle.startsWith('@')) handle = '@' + handle;
  const likes = (sp('tweetLikes') || '').trim() || '4.1k';
  const replies = (sp('tweetReplies') || '').trim() || '18';
  const prevFont = ctx.font;
  ctx.font = `700 ${fs * 0.42}px 'Vazir', system-ui, sans-serif`;
  const nameW = ctx.measureText(name).width;
  ctx.font = `400 ${fs * 0.34}px 'Vazir', system-ui, sans-serif`;
  const handleW = ctx.measureText(handle).width;
  ctx.font = `400 ${fs * 0.32}px 'Vazir', system-ui, sans-serif`;
  const footerW = ctx.measureText(`${likes} likes  ${replies} replies`).width;
  ctx.font = prevFont;
  const av = fs * 0.8, logoSize = fs * 0.5, padX = 56; // same as tweetLayout
  return {
    minW: Math.max(padX * 2 + av + 16 + Math.max(nameW, handleW) + 24 + logoSize, padX * 2 + footerW),
    minBlockH: fs * state.lineHeight,
  };
}

// Geometry of the tweet card (black rounded card with an X-post header
// and a likes/replies footer) around the text block. All chrome scales
// with the font size, so the card keeps its proportions at any size.
// cx is the block centre x, h the canvas height. minW/minBlockH (from
// tweetMinSize) keep a small body text from collapsing the card.
function tweetLayout(fs, maxLw, blockH, lineHeight, h, cx, minW = 0, minBlockH = 0) {
  const padX = 56;                    // card padding left/right
  const padTop = fs * 0.45;           // card top edge -> avatar top
  const padBottom = fs * 0.45;        // stats line -> card bottom edge
  const av = fs * 0.8;                // avatar diameter
  const gapHeaderText = fs * 0.35;    // avatar bottom -> first line top
  const gapTextStats = fs * 0.4;      // last line bottom -> stats line
  const statsH = fs * 0.32;           // stats line height
  const bodyH = Math.max(blockH, minBlockH);
  const cardW = Math.max(maxLw + padX * 2, minW);
  const cardX = cx - cardW / 2;
  const textTop = h / 2 - bodyH / 2;
  const textBottom = h / 2 + bodyH / 2;
  const cardTop = textTop - gapHeaderText - padTop - av;
  const cardBottom = textBottom + gapTextStats + statsH + padBottom;
  const avatarX = cardX + padX + av / 2;
  const avatarY = cardTop + padTop + av / 2;
  return {
    x: cardX, y: cardTop, w: cardW, h: cardBottom - cardTop, r: 36,
    padX, av, avatarX, avatarY,
    nameX: avatarX + av / 2 + 16,
    nameY: avatarY - fs * 0.16,
    handleY: avatarY + fs * 0.22,
    logoSize: fs * 0.5,
    logoX: cardX + cardW - padX - fs * 0.25,
    logoY: avatarY,
    statsX: cardX + padX,
    statsY: textBottom + gapTextStats + statsH / 2,
    statsH,
  };
}

// The X logo (Simple Icons path, 24x24 viewBox), drawn once at module
// load; a bold «X» letter is the fallback if Path2D is unavailable.
const X_LOGO_PATH = 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z';
let xLogoPath = null;
try { xLogoPath = new Path2D(X_LOGO_PATH); } catch { xLogoPath = null; }

// Paint the tweet card chrome: rounded card, avatar, name + handle, the
// X logo, and the likes/replies footer. Everything is editable in the
// settings sheet (name, handle, counts, card colour, avatar); the values
// below are the FontStory defaults. The user's text itself is painted
// per line by STYLE_PAINT.tweet.
function paintTweetCard(l, fs) {
  const name = (sp('tweetName') || '').trim() || 'FontStory';
  let handle = (sp('tweetHandle') || '').trim() || '@fontstory';
  if (!handle.startsWith('@')) handle = '@' + handle;
  const likes = (sp('tweetLikes') || '').trim() || '4.1k';
  const replies = (sp('tweetReplies') || '').trim() || '18';
  const card = sp('tweetCard') || '#000000';
  ctx.save();
  // All chrome strings are Latin — force LTR, or the page's RTL
  // direction mirrors the handle («storyfont@» instead of «@storyfont»).
  // Restored by the save/restore below; the main text is untouched.
  ctx.direction = 'ltr';
  // Card (a hairline border keeps it visible on any background).
  roundRect(l.x, l.y, l.w, l.h, l.r);
  ctx.fillStyle = card;
  ctx.fill();
  ctx.strokeStyle = hexAlpha(contrastText(card), 0.15);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Avatar: the FontStory logo by default (web/logo-avatar.webp), or
  // the user's own image when they picked one. Drawn cover-fit into
  // the circle; while the image is still loading, a gradient + «F»
  // stands in.
  ctx.save();
  ctx.beginPath();
  ctx.arc(l.avatarX, l.avatarY, l.av / 2, 0, Math.PI * 2);
  ctx.clip();
  if (tweetAvatarImg && tweetAvatarImg.complete && tweetAvatarImg.naturalWidth > 0) {
    const iw = tweetAvatarImg.naturalWidth, ih = tweetAvatarImg.naturalHeight;
    const s = Math.max(l.av / iw, l.av / ih);
    ctx.drawImage(tweetAvatarImg, l.avatarX - (iw * s) / 2, l.avatarY - (ih * s) / 2, iw * s, ih * s);
  } else {
    const g = ctx.createLinearGradient(l.avatarX - l.av / 2, l.avatarY - l.av / 2, l.avatarX + l.av / 2, l.avatarY + l.av / 2);
    g.addColorStop(0, '#F472B6');
    g.addColorStop(0.55, '#EC4899');
    g.addColorStop(1, '#BE185D');
    ctx.fillStyle = g;
    ctx.fillRect(l.avatarX - l.av / 2, l.avatarY - l.av / 2, l.av, l.av);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${l.av * 0.55}px 'Vazir', system-ui, sans-serif`;
    ctx.fillText('F', l.avatarX, l.avatarY);
  }
  ctx.restore();
  // Name + handle, left-aligned, centred on the avatar.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${fs * 0.42}px 'Vazir', system-ui, sans-serif`;
  ctx.fillText(name, l.nameX, l.nameY);
  ctx.fillStyle = '#71717A';
  ctx.font = `400 ${fs * 0.34}px 'Vazir', system-ui, sans-serif`;
  ctx.fillText(handle, l.nameX, l.handleY);
  // X logo, right side, centred on the avatar.
  ctx.fillStyle = '#FFFFFF';
  if (xLogoPath) {
    ctx.save();
    ctx.translate(l.logoX - l.logoSize / 2, l.logoY - l.logoSize / 2);
    ctx.scale(l.logoSize / 24, l.logoSize / 24);
    ctx.fill(xLogoPath);
    ctx.restore();
  } else {
    ctx.font = `800 ${l.logoSize}px 'Vazir', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('X', l.logoX, l.logoY);
  }
  // Footer: likes + replies.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#A1A1AA';
  ctx.font = `400 ${fs * 0.32}px 'Vazir', system-ui, sans-serif`;
  ctx.fillText(`${likes} likes  ${replies} replies`, l.statsX, l.statsY);
  ctx.restore();
}

function draw() {
  const [w, h] = ASPECTS[state.aspect];
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fontSize = state.size;
  // Tweet: the body text can be smaller/larger than the main size
  // (tweetTextSize %, default 100). The card chrome (avatar, name,
  // handle, X logo, footer) keeps scaling with the main size; only the
  // body text uses the scaled size — wrapping, line height, caret and
  // the editor overlay all follow it.
  const textFs = state.style === 'tweet' ? fontSize * (sp('tweetTextSize') / 100) : fontSize;
  ctx.font = `${state.weight} ${textFs}px ${fontFamily()}`;
  // Native letter spacing where the WebView supports it (Chrome 99+,
  // Safari 17+); word spacing is applied manually in drawWords.
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${state.letterSpacing}px`;
  const maxWidth = w - 160;
  const lineRanges = wrapLineRanges(state.text || '…', maxWidth);
  const lines = lineRanges.map((r) => r.text);
  const lineHeight = textFs * state.lineHeight;
  const blockH = lines.length * lineHeight;
  let y = h / 2 - blockH / 2 + lineHeight / 2;
  const maxLw = Math.max(0, ...lines.map((l) => lineWidth(l)));
  // Per-line justify stretch (extra px per word gap).
  const gaps = lineRanges.map((lr, li) => justifyGap(lines[li], lineWidth(lines[li]), maxLw));
  const cx = w / 2; // the block stays centred; only lines move within it
  // The tweet card wraps the whole block (header + footer included),
  // so taps on the card count as taps on the text.
  const tweetMin = state.style === 'tweet' ? tweetMinSize(fontSize) : { minW: 0, minBlockH: 0 };
  const tweetL = state.style === 'tweet' ? tweetLayout(fontSize, maxLw, blockH, lineHeight, h, cx, tweetMin.minW, tweetMin.minBlockH) : null;
  lastBlock = {
    cx, cy: tweetL ? tweetL.y + tweetL.h / 2 : h / 2,
    hw: tweetL ? tweetL.w / 2 : maxLw / 2, hh: tweetL ? tweetL.h / 2 : blockH / 2,
    cosY: Math.cos((state.rotY * Math.PI) / 180),
    cosX: Math.cos((state.rotX * Math.PI) / 180),
  };

  // The native selection highlight is hidden (see styles.css) — the
  // canvas draws it instead, so it lands exactly on the visible glyphs.
  const selStart = textInput.selectionStart ?? 0;
  const selEnd = textInput.selectionEnd ?? 0;
  const hasSel = document.activeElement === textInput && selEnd > selStart;

  // X/Y rotation as a scale around the block centre (the 2D-canvas
  // equivalent of a 3D tilt): X squashes vertically, Y horizontally.
  ctx.save();
  ctx.translate(cx, h / 2);
  ctx.scale(Math.cos((state.rotY * Math.PI) / 180), Math.cos((state.rotX * Math.PI) / 180));
  ctx.translate(-cx, -h / 2);

  if (state.style === 'glass') {
    const pad = 48;
    const bw = Math.max(...lines.map((l) => lineWidth(l))) + pad * 2;
    ctx.save();
    ctx.fillStyle = hexAlpha(state.styleColor, sp('glassOpacity') / 100);
    ctx.strokeStyle = hexAlpha(state.styleColor, 0.55);
    ctx.lineWidth = 3;
    roundRect(cx - bw / 2, y - lineHeight / 2 - pad / 2, bw, blockH + pad, state.borderRadius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Quotes style: teal border around the whole text block, with quote
  // marks in the corners (the text itself is painted per-line below).
  if (state.style === 'quotes') {
    const pad = 48;
    const bw = Math.max(...lines.map((l) => lineWidth(l))) + pad * 2;
    const top = y - lineHeight / 2 - pad / 2;
    ctx.save();
    ctx.strokeStyle = state.styleColor;
    ctx.lineWidth = 4;
    roundRect(cx - bw / 2, top, bw, blockH + pad, state.borderRadius);
    ctx.stroke();
    ctx.fillStyle = state.styleColor;
    ctx.font = `${fontSize}px ${fontFamily()}`;
    ctx.textAlign = 'center';
    ctx.fillText('“', cx + bw / 2 - 24, top + fontSize * 0.75);
    ctx.fillText('”', cx - bw / 2 + 24, top + blockH + pad - 12);
    ctx.restore();
  }

  // Tweet style: black card with the X-post header and the
  // likes/replies footer around the whole text block (the text itself
  // is painted per-line below, in grey).
  if (tweetL) paintTweetCard(tweetL, fontSize);

  for (let li = 0; li < lineRanges.length; li++) {
    const line = lines[li];
    const lr = lineRanges[li];
    ctx.save();
    const lw = lineWidth(line);
    const lcx = alignCx(lw, maxLw, line, gaps[li]); // this line's own anchor for the alignment
    // A justified line's visible width is the block's full width.
    const visLw = lw + gaps[li] * Math.max(0, line.split(' ').filter((w) => w !== '').length - 1);
    lineJustifyGap = gaps[li];
    if (hasSel) {
      const a = Math.max(selStart, lr.start);
      const b = Math.min(selEnd, lr.end);
      if (b > a) {
        const rtl = isRTLText(line);
        const xa = rtl ? lcx + visLw / 2 - prefixWidth(line, a - lr.start, gaps[li]) : lcx - visLw / 2 + prefixWidth(line, a - lr.start, gaps[li]);
        const xb = rtl ? lcx + visLw / 2 - prefixWidth(line, b - lr.start, gaps[li]) : lcx - visLw / 2 + prefixWidth(line, b - lr.start, gaps[li]);
        ctx.fillStyle = 'rgba(80, 140, 255, 0.45)';
        const x0 = Math.min(xa, xb) - 6;
        ctx.fillRect(x0, y - lineHeight / 2 + 3, Math.abs(xb - xa) + 12, lineHeight - 6);
      }
    }
    const paint = STYLE_PAINT[state.style] || STYLE_PAINT.bold;
    paint(line, lcx, y, visLw, textFs);
    ctx.restore();
    y += lineHeight;
  }

  // Blinking caret at the text cursor while the input is focused — it
  // follows selectionStart, so tapping the middle of the text moves it
  // there. Hidden while a selection is active — the highlight shows
  // the selection instead. (The native textarea caret is transparent
  // by design; the canvas draws the only visible caret.)
  if (state.caret && document.activeElement === textInput && !hasSel) {
    const g = caretGeometry(selStart, lineRanges, lines, maxLw, lineHeight, blockH, h, gaps);
    ctx.save();
    ctx.fillStyle = state.color;
    ctx.fillRect(g.x - 3.5, g.y - textFs * 0.55, 7, textFs * 1.1);
    ctx.restore();
  }

  ctx.restore(); // rotation transform

  // Pixel style: downscale the text block, then scale it back up with
  // smoothing off — the classic pixelated look. Runs in unrotated
  // device space, after the rotation transform is restored.
  if (state.style === 'pixel') {
    const cell = sp('pixelSize');
    const px = Math.max(0, cx - maxLw / 2 - 40);
    const py = Math.max(0, h / 2 - blockH / 2 - 40);
    const pw = Math.min(w - px, maxLw + 80);
    const ph = Math.min(h - py, blockH + 80);
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.round(pw / cell));
    off.height = Math.max(1, Math.round(ph / cell));
    const octx = off.getContext('2d');
    octx.drawImage(canvas, px, py, pw, ph, 0, 0, off.width, off.height);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(px, py, pw, ph);
    ctx.drawImage(off, 0, 0, off.width, off.height, px, py, pw, ph);
    ctx.imageSmoothingEnabled = true;
  }

  syncEditorLayout(textFs, lineHeight, blockH, maxLw);
}

// Keep the (invisible) editor's text laid out exactly where the canvas
// draws it, so the native selection highlight — and the iOS selection
// handles — land on the visible text instead of at the top of the field.
// The textarea keeps transparent text and background; only its highlight
// and caret geometry matter. The canvas text area is 920 of the 1080
// canvas pixels wide (80px margins), centred; the same transform as the
// canvas rotation is applied around the block centre.
function syncEditorLayout(fontSize, lineHeight, blockH, maxLw) {
  if (!canvas.clientWidth) return;
  const scale = canvas.clientWidth / 1080;
  const fs = fontSize * scale;
  const lh = lineHeight * scale;
  const blockTop = (canvas.clientHeight - blockH * scale) / 2;
  const s = textInput.style;
  s.boxSizing = 'border-box';
  s.top = `${canvas.offsetTop}px`;
  s.left = `${canvas.offsetLeft + 80 * scale}px`;
  s.right = 'auto';
  s.bottom = 'auto';
  s.width = `${920 * scale}px`;
  s.height = `${canvas.clientHeight}px`;
  s.paddingTop = `${Math.max(0, blockTop)}px`;
  s.paddingLeft = '0px';
  s.paddingRight = '0px';
  s.paddingBottom = '0px';
  s.fontSize = `${fs}px`;
  s.lineHeight = `${lh}px`;
  s.fontFamily = fontFamily();
  s.fontWeight = String(state.weight);
  s.letterSpacing = `${state.letterSpacing * scale}px`;
  s.wordSpacing = `${state.wordSpacing * scale}px`;
  s.textAlign = state.align;
  // The editor's lines must sit where the canvas draws them: the block
  // is centred, so for راست‌چین/چپ‌چین the content box is padded in
  // from the 80px margin to the block's edge (460 - maxLw/2, in canvas
  // px) — otherwise taps and selection handles would land on the wrong
  // characters for multi-line aligned text. The padding never makes the
  // content box narrower than the widest line, so wrapping can't diverge
  // from the canvas either.
  const alignPad = Math.max(0, 460 - maxLw / 2) * scale;
  s.paddingLeft = state.align === 'left' ? `${alignPad}px` : '0px';
  s.paddingRight = state.align === 'right' ? `${alignPad}px` : '0px';
  const cosY = Math.cos((state.rotY * Math.PI) / 180);
  const cosX = Math.cos((state.rotX * Math.PI) / 180);
  s.transform = `scale(${cosY}, ${cosX})`;
  s.transformOrigin = `${canvas.clientWidth / 2 - 80 * scale}px ${canvas.clientHeight / 2}px`;
}

function redraw() {
  // Wait for webfonts so the canvas uses the real font, not a fallback.
  if (document.fonts?.load) {
    document.fonts.load(`${state.weight} ${state.size}px ${fontFamily()}`).catch(() => {}).finally(() => { draw(); paintStickerSamples(); });
  }
  draw();
  paintStickerSamples();
}

// Caret blink.
setInterval(() => {
  if (document.activeElement === textInput) {
    state.caret = !state.caret;
    draw();
  }
}, 530);

// --- Card pickers (horizontal rows, like Poufi) ---
function buildCardPicker(el, items, current, onPick, sampleHtml) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick-card' + (item.id === current ? ' active' : '');
    b.innerHTML = `<span class="sample">${sampleHtml(item)}</span><span class="name"></span>`;
    b.querySelector('.name').textContent = item.label;
    b.addEventListener('click', () => {
      onPick(item.id);
      el.querySelectorAll('.pick-card').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
    });
    el.appendChild(b);
  }
}

// One row, like the style panel: the three filter buttons in the head
// switch which fonts the row shows — Persian, English, or favourites.
let fontFilter = null; // 'fa' | 'en' | 'fav' | 'custom' — defaults to the current font's language
function fontLang(id) {
  const f = fontEntry(id);
  if (!f) return 'fa';
  // Imported fonts carry their own lang (detected from glyph coverage
  // at import/load time), so they show in the matching language list.
  return f.lang === 'en' ? 'en' : 'fa';
}
// Any font, built-in or imported, by id.
function fontEntry(id) {
  return FONTS.find((f) => f.id === id) || importedFonts.get(id) || null;
}
function fontLabel(id) {
  const f = fontEntry(id);
  if (f) return f.label;
  return CUSTOM_FONT_RE.test(id || '') ? 'فونت واردشده' : id;
}
function buildFontPicker() {
  const favs = getFavs();
  if (!fontFilter) fontFilter = fontLang(state.font);
  const imported = [...importedFonts.values()];
  const items = fontFilter === 'fav'
    ? favs.map((id) => fontEntry(id)).filter(Boolean)
    : fontFilter === 'custom'
      ? imported
      : [...FONTS.filter((f) => f.lang === fontFilter), ...imported.filter((f) => f.lang === fontFilter)];
  const row = $('fontRow');
  row.innerHTML = '';
  for (const item of items) row.appendChild(fontCard(item, favs));
  // The import card sits at the end of every list except favourites —
  // it is the way in, not a font, so it never hides behind a filter.
  if (fontFilter !== 'fav') row.appendChild(importCard());
  row.style.display = (items.length || fontFilter !== 'fav') ? '' : 'none';
  $('favEmpty').hidden = !(fontFilter === 'fav' && !items.length);
  syncCustomFilter();
  document.querySelectorAll('.font-filter').forEach((b) =>
    b.classList.toggle('active', b.dataset.filter === fontFilter));
  // A saved design (or the default) may carry a Google font — make sure
  // it is loaded so the canvas draws it, not the fallback face.
  // Imported fonts are already loaded via FontFace, so they skip this.
  const current = fontEntry(state.font);
  if (current && !current.custom) ensureLazyFont(current).then(redraw);
}
function syncCustomFilter() {
  const pill = $('customFilter');
  if (pill) pill.hidden = importedFonts.size === 0;
}

// --- User-imported fonts (client-side only) ---
// A user picks a font file (ttf/otf/woff/woff2) from their device; it is
// loaded with the FontFace API and kept in IndexedDB so it survives
// reloads. Nothing is uploaded: the file never leaves the phone, so
// licensed fonts stay the user's own and the server never redistributes
// them. The id is `custom-<8 hex>` (SHA-256 of the bytes, FNV-1a
// fallback) — the back-end allow-list accepts that shape, so designs
// saved with an imported font restore it when the font is on the device
// and fall back to Vazir (with a toast) when it isn't.
const CUSTOM_FONT_RE = /^custom-[0-9a-f]{8}$/;
const importedFonts = new Map(); // id -> {id, label, family, face, custom, sample}
const MAX_IMPORTED_FONTS = 10;
const MAX_FONT_BYTES = 10 * 1024 * 1024;
function customFamily(id) { return 'FontStory-' + id; }

async function hashFontId(buf) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const d = await crypto.subtle.digest('SHA-256', buf);
      return [...new Uint8Array(d)].slice(0, 4).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) { /* fall through to the FNV-1a hash */ }
  let h = 0x811c9dc5;
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// Tiny IndexedDB wrapper (one store, keyed by font id). Version 2 adds
// the tweetAvatar store; the upgrade guard matters — onupgradeneeded
// also runs for existing v1 users, where 'fonts' already exists.
let fontDbPromise = null;
function openFontDb() {
  if (!fontDbPromise) {
    fontDbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('fontstory', 2);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('fonts')) db.createObjectStore('fonts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('tweetAvatar')) db.createObjectStore('tweetAvatar', { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return fontDbPromise;
}
function idbStore(storeName, mode, run) {
  return openFontDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let out;
    try { out = run(store); } catch (e) { reject(e); return; }
    tx.oncomplete = () => resolve(out && out.result !== undefined ? out.result : undefined);
    tx.onerror = () => reject(tx.error);
  }));
}
function idbFonts(mode, run) {
  return idbStore('fonts', mode, run);
}
// The tweet avatar is a single row ({ id: 'avatar', dataUrl }).
function idbAvatar(mode, run) {
  return idbStore('tweetAvatar', mode, run);
}
async function loadImportedFonts() {
  let rows = [];
  try { rows = await idbFonts('readonly', (s) => s.getAll()); } catch (e) { return; }
  for (const r of rows || []) {
    // A row with no bytes (left by the pre-fix import, which stored a
    // buffer FontFace had neutered) can never load — drop it.
    if (!r.data || r.data.byteLength === 0) { try { await idbFonts('readwrite', (s) => s.delete(r.id)); } catch (e) {} continue; }
    try {
      const face = new FontFace(customFamily(r.id), r.data);
      await face.load();
      document.fonts.add(face);
      // Language comes from glyph coverage, not the file name: a font
      // that renders Persian text belongs in the فارسی list (and in
      // «فونت‌های من»), a Latin-only one in انگلیسی.
      const canFa = document.fonts.check(`18px "${customFamily(r.id)}"`, 'متن شما');
      importedFonts.set(r.id, { id: r.id, label: r.name, family: `'${customFamily(r.id)}', sans-serif`, face, custom: true, lang: canFa ? 'fa' : 'en', sample: canFa ? 'متن شما' : 'Your text' });
    } catch (e) { /* a corrupt stored font is skipped, the rest still load */ }
  }
  if (importedFonts.size) { syncCustomFilter(); buildFontPicker(); }
}
const importedReady = loadImportedFonts();

async function importFontFile(file) {
  if (!file) return;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext)) { setStatus('فایل فونت معتبر نیست — ttf، otf، woff یا woff2 انتخاب کن.'); return; }
  if (file.size > MAX_FONT_BYTES) { setStatus('این فونت خیلی بزرگه (حداکثر ۱۰ مگابایت).'); return; }
  setStatus('در حال اضافه کردن فونت…');
  try {
    const buf = await file.arrayBuffer();
    const id = 'custom-' + await hashFontId(buf);
    if (importedFonts.has(id)) {
      fontFilter = 'custom';
      buildFontPicker();
      selectFont(id);
      setStatus('این فونت قبلاً اضافه شده.');
      return;
    }
    if (importedFonts.size >= MAX_IMPORTED_FONTS) { setStatus('حداکثر ۱۰ فونت می‌تونی اضافه کنی — اول یکی رو حذف کن.'); return; }
    // Hand FontFace a COPY of the bytes: some engines neuter the buffer
    // they are given, and the original is what IndexedDB must store —
    // storing the neutered buffer failed silently and the font was lost
    // on reload (reproduced 2026-11-17 with a detaching FontFace stub).
    const face = new FontFace(customFamily(id), buf.slice(0));
    await face.load();
    document.fonts.add(face);
    const label = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'فونت من';
    const canFa = document.fonts.check(`18px "${customFamily(id)}"`, 'متن شما');
    importedFonts.set(id, { id, label, family: `'${customFamily(id)}', sans-serif`, face, custom: true, lang: canFa ? 'fa' : 'en', sample: canFa ? 'متن شما' : 'Your text' });
    // Persist, then read back and verify the bytes actually landed —
    // never again report success for a font that won't survive reload.
    let persisted = false;
    try {
      await idbFonts('readwrite', (s) => s.put({ id, name: label, data: buf }));
      const rows = await idbFonts('readonly', (s) => s.getAll());
      persisted = (rows || []).some((r) => r.id === id && r.data && r.data.byteLength > 0);
    } catch (e) { /* no IndexedDB — the font works for this session only */ }
    fontFilter = 'custom';
    buildFontPicker();
    selectFont(id);
    setStatus(persisted ? 'فونت اضافه شد.' : 'فونت اضافه شد، ولی ذخیره نشد.');
  } catch (e) {
    setStatus('این فایل فونت معتبر نیست.');
  }
}

async function removeImportedFont(id) {
  const entry = importedFonts.get(id);
  if (!entry) return;
  importedFonts.delete(id);
  try { document.fonts.delete(entry.face); } catch (e) { /* already gone */ }
  try { await idbFonts('readwrite', (s) => s.delete(id)); } catch (e) { /* session-only font */ }
  saveFavs(getFavs().filter((x) => x !== id));
  if (state.font === id) { state.font = 'Vazir'; redraw(); }
  if (!importedFonts.size && fontFilter === 'custom') fontFilter = 'fa';
  syncCustomFilter();
  buildFontPicker();
  setStatus('فونت حذف شد.');
}

// --- Tweet avatar (customisable, device-local like imported fonts) ---
// Default: the FontStory logo (web/logo-avatar.webp). The user can pick
// their own image in the settings sheet; it is downscaled to 512px and
// kept in IndexedDB ('tweetAvatar'), so it survives reloads on this
// device. Saved designs keep only the text fields (name/handle/counts/
// card colour) — the avatar is per-device, not per-design.
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
let tweetAvatarImg = null;
let tweetAvatarCustom = false;

function setTweetAvatarImage(src) {
  tweetAvatarImg = new Image();
  tweetAvatarImg.onload = () => { if (state.style === 'tweet') redraw(); };
  tweetAvatarImg.onerror = () => { tweetAvatarImg = null; if (state.style === 'tweet') redraw(); };
  tweetAvatarImg.src = src;
}

async function initTweetAvatar() {
  let custom = null;
  try { custom = await idbAvatar('readonly', (s) => s.get('avatar')); } catch (e) { /* no IndexedDB — default logo */ }
  if (custom && custom.dataUrl) {
    tweetAvatarCustom = true;
    setTweetAvatarImage(custom.dataUrl);
  } else {
    setTweetAvatarImage('logo-avatar.webp');
  }
}
initTweetAvatar();

// Downscale an image file to a PNG data URL (max side 512px) so the
// stored avatar stays small; PNG keeps transparency.
function downscaleImageFile(file, maxSide) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(img.naturalWidth * s));
        cv.height = Math.max(1, Math.round(img.naturalHeight * s));
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL('image/png'));
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

async function importTweetAvatar(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { setStatus('فایل عکس معتبر نیست — یک عکس انتخاب کن.'); return; }
  if (file.size > MAX_AVATAR_BYTES) { setStatus('این عکس خیلی بزرگه (حداکثر ۵ مگابایت).'); return; }
  setStatus('در حال اضافه کردن آواتار…');
  try {
    const dataUrl = await downscaleImageFile(file, 512);
    // Persist, then read back and verify it actually landed (same
    // pattern as the font import — never report success for a row that
    // won't survive reload).
    let persisted = false;
    try {
      await idbAvatar('readwrite', (s) => s.put({ id: 'avatar', dataUrl }));
      const row = await idbAvatar('readonly', (s) => s.get('avatar'));
      persisted = !!(row && row.dataUrl);
    } catch (e) { /* no IndexedDB — the avatar works for this session only */ }
    tweetAvatarCustom = true;
    setTweetAvatarImage(dataUrl);
    renderStyleControls();
    redraw();
    setStatus(persisted ? 'آواتار عوض شد.' : 'آواتار عوض شد، ولی ذخیره نشد.');
  } catch (e) {
    setStatus('این فایل عکس معتبر نیست.');
  }
}

async function resetTweetAvatar() {
  try { await idbAvatar('readwrite', (s) => s.delete('avatar')); } catch (e) {}
  tweetAvatarCustom = false;
  setTweetAvatarImage('logo-avatar.webp');
  renderStyleControls();
  redraw();
}

// The import card: a dashed "+" card at the end of the font row. The
// real file input sits transparently on top of it (same pattern as the
// colour picker — a hidden input + .click() is ignored by iOS WebKit),
// so the tap lands on the input itself and the system picker opens.
function importCard() {
  const d = document.createElement('div');
  d.className = 'pick-card import-card';
  d.innerHTML = `<span class="sample import-plus"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="name">فونت خودم</span><input type="file" accept=".ttf,.otf,.woff,.woff2" class="font-file-input" aria-label="ایمپورت فونت">`;
  const input = d.querySelector('input');
  input.addEventListener('change', () => {
    const f = input.files && input.files[0];
    input.value = '';
    if (f) importFontFile(f);
  });
  return d;
}

// --- Font favourites + lazy Google Fonts ---
const FAV_KEY = 'fontstory:favFonts';
const LONG_PRESS_MS = 1000; // hold a card this long to (un)favourite it
const HEART_SVG = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]').filter((id) => fontEntry(id)); }
  catch { return []; }
}
function saveFavs(ids) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(ids)); } catch { /* private mode */ }
}
function toggleFav(id) {
  const favs = getFavs();
  const i = favs.indexOf(id);
  if (i >= 0) { favs.splice(i, 1); saveFavs(favs); setStatus('از محبوب‌ها حذف شد.'); }
  else { favs.push(id); saveFavs(favs); setStatus('به محبوب‌ها اضافه شد.'); }
  if (inTelegram() && Telegram.WebApp.HapticFeedback) Telegram.WebApp.HapticFeedback.impactOccurred('medium');
  buildFontPicker();
}

// Lazy-load a font: inject its stylesheet once, then load the faces so
// the card sample and the canvas switch to the real font. Google fonts
// use the css2 URL built from `css`; the rastikerdar fonts use their own
// jsDelivr font-face.css via `cssUrl`.
const lazyFontLoaded = new Set();
function ensureLazyFont(font) {
  if (!font.lazy || lazyFontLoaded.has(font.id)) return Promise.resolve();
  lazyFontLoaded.add(font.id);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.cssUrl || `https://fonts.googleapis.com/css2?${font.css}&display=swap`;
  document.head.appendChild(link);
  const loads = (font.weights || [400, 700]).map((w) =>
    document.fonts.load(`${w} 18px "${font.gname}"`, font.sample || 'Your text').catch(() => {}));
  return Promise.all(loads);
}

// Cards load their font when they scroll into view, so the English
// section costs nothing until the user actually looks at it.
const fontObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const font = FONTS.find((f) => f.id === e.target.dataset.fontId);
    fontObserver.unobserve(e.target);
    if (font) ensureLazyFont(font).then(() => { if (state.font === font.id) redraw(); });
  }
}, { rootMargin: '120px' }) : null;

function selectFont(id) {
  state.font = id;
  document.querySelectorAll('#panel-font .pick-card').forEach((x) =>
    x.classList.toggle('active', x.dataset.fontId === id));
  const font = fontEntry(id);
  if (font && !font.custom) ensureLazyFont(font).then(redraw);
  redraw();
}

function fontCard(item, favs) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'pick-card' + (item.id === state.font ? ' active' : '');
  b.dataset.fontId = item.id;
  const sample = item.sample || 'متن شما';
  b.innerHTML = `<span class="sample"><span style="font-family:${item.family}">${sample}</span></span><span class="name"></span>` +
    (favs.includes(item.id) ? `<span class="fav-badge" aria-hidden="true">${HEART_SVG}</span>` : '') +
    (item.custom ? `<span class="del-badge" role="button" aria-label="حذف فونت"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></span>` : '');
  b.querySelector('.name').textContent = item.label;
  const del = b.querySelector('.del-badge');
  if (del) del.addEventListener('click', (e) => { e.stopPropagation(); removeImportedFont(item.id); });
  // Tap picks the font; a ~1s hold (un)favourites it instead.
  let pressTimer = null, pressStart = null, longPressed = false;
  const cancelPress = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };
  b.addEventListener('pointerdown', (e) => {
    longPressed = false;
    pressStart = { x: e.clientX, y: e.clientY };
    pressTimer = setTimeout(() => { longPressed = true; pressTimer = null; toggleFav(item.id); }, LONG_PRESS_MS);
  });
  b.addEventListener('pointermove', (e) => {
    if (pressStart && Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > 10) cancelPress();
  });
  b.addEventListener('pointerup', cancelPress);
  b.addEventListener('pointercancel', cancelPress);
  b.addEventListener('pointerleave', cancelPress);
  b.addEventListener('click', () => { if (longPressed) return; selectFont(item.id); });
  if (fontObserver && item.lazy) fontObserver.observe(b);
  return b;
}

function buildStylePicker() {
  buildCardPicker($('stylePicker'), STYLES, state.style, (id) => { state.style = id; renderStyleControls(); redraw(); },
    (item) => item.id === 'sticker'
      // The sticker card is a real canvas (see paintStickerSamples):
      // a CSS text-shadow approximation can never match the output —
      // the white ring wraps the maroon extrusion, which text-shadow
      // cannot express — so the old preview looked like a blob.
      ? '<canvas class="sample-canvas" width="184" height="54"></canvas>'
      : `<span class="sample-${item.id}">متن شما</span>`);
}

// Paint every sticker card preview with the REAL sticker code
// (STYLE_PAINT.sticker) on its small canvas — same font, weight and
// sticker knobs as the main canvas, just smaller. Called from redraw(),
// so it follows every font/weight/knob change and every picker rebuild.
function paintStickerSamples() {
  for (const cv of document.querySelectorAll('#stylePicker canvas.sample-canvas')) {
    try {
      const sctx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      sctx.clearRect(0, 0, W, H);
      const prevCtx = ctx;
      ctx = sctx;
      try {
        ctx.textBaseline = 'middle';
        // Fit «متن شما» into the canvas, leaving room for the white
        // ring (30% of fs) and the maroon offset (25% of fs).
        let fs = Math.floor(H * 0.42);
        const setFont = (s) => {
          ctx.font = `${state.weight} ${s}px ${fontFamily()}`;
          if ('letterSpacing' in ctx) ctx.letterSpacing = `${state.letterSpacing}px`;
        };
        setFont(fs);
        const maxW = W * 0.82;
        while (fs > 10 && lineWidth('متن شما') > maxW) { fs -= 1; setFont(fs); }
        lineJustifyGap = 0; // the sample is one line — natural spacing, never stretched
        STYLE_PAINT.sticker('متن شما', W / 2, H / 2 + fs * 0.06, lineWidth('متن شما'), fs);
      } finally {
        ctx = prevCtx;
      }
    } catch {
      // If painting fails, fall back to the CSS approximation.
      const span = document.createElement('span');
      span.className = 'sample-sticker';
      span.textContent = 'متن شما';
      cv.replaceWith(span);
    }
  }
}

// Build the «تنظیمات این استایل» controls for the current style.
// Rebuilt on style change, on opening the sheet, and on applying a
// saved design — so the sheet always shows the current style's knobs.
function renderStyleControls() {
  const wrap = $('styleSheetControls');
  $('styleSheetTitle').textContent = STYLES.find((s) => s.id === state.style)?.label || 'تنظیمات استایل';
  wrap.innerHTML = '';
  const controls = STYLE_CONTROLS[state.style] || [];
  if (!controls.length) {
    const p = document.createElement('p');
    p.className = 'sheet-note';
    p.textContent = 'برای این استایل تنظیم جداگانه‌ای نیست.';
    wrap.appendChild(p);
    return;
  }
  for (const c of controls) {
    const row = document.createElement('div');
    row.className = 'slider-row';
    const head = document.createElement('div');
    head.className = 'slider-head';
    const label = document.createElement('span');
    label.textContent = c.label;
    const value = document.createElement('span');
    value.className = 'slider-value';
    head.append(label, value);
    row.appendChild(head);
    const val = sp(c.key);
    if (c.type === 'range') {
      value.textContent = val + (c.unit || '');
      const input = document.createElement('input');
      input.type = 'range';
      input.min = c.min; input.max = c.max; input.step = c.step; input.value = val;
      input.setAttribute('aria-label', c.label);
      input.addEventListener('input', (e) => {
        const v = Number(e.target.value);
        state.styleParams[c.key] = v;
        value.textContent = v + (c.unit || '');
        redraw();
      });
      row.appendChild(input);
    } else if (c.type === 'text') {
      // Free text (tweet header/footer): updates live as you type.
      value.textContent = '';
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'style-text-input';
      input.dir = 'auto';
      input.maxLength = c.max || 30;
      input.value = val;
      input.placeholder = c.def;
      input.setAttribute('aria-label', c.label);
      input.addEventListener('input', (e) => {
        state.styleParams[c.key] = e.target.value;
        redraw();
      });
      row.appendChild(input);
    } else {
      value.textContent = String(val).toUpperCase();
      const input = document.createElement('input');
      input.type = 'color';
      input.className = 'style-color-input';
      input.value = val;
      input.style.background = val;
      input.setAttribute('aria-label', c.label);
      input.addEventListener('input', (e) => {
        state.styleParams[c.key] = e.target.value;
        input.style.background = e.target.value;
        value.textContent = e.target.value.toUpperCase();
        redraw();
      });
      row.appendChild(input);
    }
    wrap.appendChild(row);
  }

  // Tweet avatar: a preview circle, a «تغییر آواتار» button with the
  // real file input transparently on top of it (same pattern as the
  // font import — a hidden input + .click() is ignored by iOS WebKit),
  // and a reset back to the FontStory logo when a custom one is set.
  if (state.style === 'tweet') {
    const row = document.createElement('div');
    row.className = 'slider-row';
    const head = document.createElement('div');
    head.className = 'slider-head';
    const label = document.createElement('span');
    label.textContent = 'آواتار';
    head.appendChild(label);
    row.appendChild(head);
    const box = document.createElement('div');
    box.className = 'avatar-row';
    const img = document.createElement('img');
    img.className = 'avatar-preview';
    img.alt = '';
    img.src = tweetAvatarImg ? tweetAvatarImg.src : 'logo-avatar.webp';
    const pick = document.createElement('span');
    pick.className = 'avatar-pick';
    pick.textContent = 'تغییر آواتار';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.setAttribute('aria-label', 'تغییر آواتار');
    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (f) importTweetAvatar(f);
    });
    pick.appendChild(fileInput);
    box.append(img, pick);
    if (tweetAvatarCustom) {
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'avatar-reset';
      reset.textContent = 'بازنشانی';
      reset.addEventListener('click', resetTweetAvatar);
      box.appendChild(reset);
    }
    row.appendChild(box);
    wrap.appendChild(row);
  }
}

// The default text colour follows the background — white text on dark
// backgrounds, dark text on white — until the user picks a colour
// themselves in the رنگ tab (then their pick is never overridden).
function applyDefaultTextColor() {
  if (state.colorTouched) return;
  state.color = BACKGROUNDS[state.bg] === '#FFFFFF' ? '#1F2421' : '#FFFFFF';
  $('colorPicker').value = state.color;
  buildSwatches();
  redraw();
}

function buildSwatches() {
  const wrap = $('swatches');
  wrap.innerHTML = '';
  for (const c of COLORS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (c === state.color ? ' active' : '');
    b.style.background = c;
    b.setAttribute('aria-label', c);
    b.addEventListener('click', () => {
      state.color = c;
      state.colorTouched = true;
      $('colorPicker').value = c;
      wrap.querySelectorAll('.swatch').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      redraw();
    });
    wrap.appendChild(b);
  }
}

// --- Tabs / sheets ---
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.sheet-panel').forEach((p) => { p.hidden = p.id !== `panel-${tab}`; });
  if (tab === 'template') loadRecents();
}
document.querySelectorAll('.tab').forEach((b) => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});
document.querySelectorAll('.font-filter').forEach((b) => {
  b.addEventListener('click', () => { fontFilter = b.dataset.filter; buildFontPicker(); });
});

function applyDesign(d) {
  state.text = d.text || '';
  // A saved design may reference an imported font that isn't on this
  // device (deleted, or another phone) — fall back to Vazir and say so.
  if (d.font && CUSTOM_FONT_RE.test(d.font) && !importedFonts.has(d.font)) {
    state.font = 'Vazir';
    setStatus('فونت این طرح روی این گوشی نیست، با وزیر باز شد.');
  } else {
    state.font = d.font || 'Vazir';
  }
  // Old saved designs may carry a style that was later deleted.
  state.style = STYLES.some((s) => s.id === d.style) ? d.style : 'bold';
  state.color = d.color || '#FFFFFF';
  // A saved design with a non-default text colour was saved with the
  // colour deliberately picked, so the box styles keep using it.
  state.colorTouched = typeof d.color === 'string' && d.color.toUpperCase() !== '#FFFFFF';
  state.aspect = d.aspect || '9:16';
  state.align = ['center', 'right', 'left', 'justify'].includes(d.align) ? d.align : 'center';
  state.weight = [400, 500, 600, 700, 800, 900].includes(Number(d.weight)) ? Number(d.weight) : 800;
  state.letterSpacing = clampNum(d.letterSpacing, 0, 40, 0);
  state.wordSpacing = clampNum(d.wordSpacing, 0, 60, 0);
  state.lineHeight = clampNum(d.lineHeight, 1, 2, 1.4);
  state.rotX = clampNum(d.rotX, -45, 45, 0);
  state.rotY = clampNum(d.rotY, -45, 45, 0);
  state.styleColor = typeof d.styleColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(d.styleColor) ? d.styleColor : '#F4D93E';
  state.borderRadius = clampNum(d.borderRadius, 0, 40, 18);
  state.styleParams = sanitizeStyleParams(d.styleParams);
  textInput.value = state.text;
  $('colorPicker').value = state.color;
  syncSettingsUI();
  fontFilter = fontLang(state.font); // show the applied font's group
  buildFontPicker();
  buildStylePicker();
  buildSwatches();
  setAlign(state.align);
  renderStyleControls();
  updateDoneBtn();
  redraw();
  switchTab('font');
}

// Clamp helper shared by applyDesign (server values may be missing/old).
function clampNum(v, min, max, def) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
}

// Push the current text-settings state into the settings sheet controls.
function syncSettingsUI() {
  $('weightRange').value = state.weight;
  $('weightValue').textContent = state.weight;
  $('letterRange').value = state.letterSpacing;
  $('letterValue').textContent = state.letterSpacing + 'px';
  $('wordRange').value = state.wordSpacing;
  $('wordValue').textContent = state.wordSpacing + 'px';
  $('lineRange').value = state.lineHeight;
  $('lineValue').textContent = state.lineHeight;
  $('rotXRange').value = state.rotX;
  $('rotXValue').textContent = state.rotX + '°';
  $('rotYRange').value = state.rotY;
  $('rotYValue').textContent = state.rotY + '°';
  $('styleColorInput').value = state.styleColor;
  $('styleColorInput').style.background = state.styleColor;
  $('styleColorValue').textContent = state.styleColor.toUpperCase();
  $('radiusRange').value = state.borderRadius;
  $('radiusValue').textContent = state.borderRadius + 'px';
}

// Trash icon for the per-item delete button (standard Feather trash-2).
const TRASH_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

// --- Recents (in the قالب panel) ---
async function loadRecents() {
  const list = $('recents');
  // Imported fonts load from IndexedDB asynchronously — wait for them
  // before rendering, so a design saved with one shows its real name
  // and applies it instead of falling back to Vazir.
  await importedReady.catch(() => {});
  try {
    const res = await callEndpoint('myDesigns', {});
    const rows = res?.designs || [];
    list.innerHTML = '';
    if (!rows.length) {
      list.innerHTML = '<li class="empty">هنوز طرحی ذخیره نکردی.</li>';
      return;
    }
    for (const d of rows) {
      const li = document.createElement('li');
      const date = d.created_at ? new Date(d.created_at * 1000).toLocaleDateString('fa-IR') : '';
      li.innerHTML = `<div class="recent-text"></div><div class="meta">${fontLabel(d.font)} · ${d.style} · ${d.aspect} · ${date}</div>`;
      li.querySelector('.recent-text').textContent = d.text;
      li.addEventListener('click', () => applyDesign(d));
      // Delete button: first tap arms it («حذف؟»), second tap within
      // 4s deletes for real — so a stray tap can't wipe a design.
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'recent-del';
      del.setAttribute('aria-label', 'حذف این حالت');
      del.innerHTML = TRASH_ICON;
      let armed = null;
      const disarm = () => {
        if (armed) { clearTimeout(armed); armed = null; }
        del.classList.remove('armed');
        del.innerHTML = TRASH_ICON;
      };
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!armed) {
          armed = setTimeout(disarm, 4000);
          del.classList.add('armed');
          del.textContent = 'حذف؟';
          return;
        }
        clearTimeout(armed); armed = null;
        del.disabled = true;
        try {
          await callEndpoint('deleteDesign', { id: d.id });
          li.remove();
          if (!list.querySelector('li:not(.empty)')) {
            list.innerHTML = '<li class="empty">هنوز طرحی ذخیره نکردی.</li>';
          }
          setStatus('حذف شد.');
        } catch (err) {
          del.disabled = false;
          disarm();
          setStatus('حذف نشد: ' + (err.message || err));
        }
      });
      li.appendChild(del);
      list.appendChild(li);
    }
  } catch (e) {
    list.innerHTML = '<li class="empty">کارهای اخیر فقط داخل تلگرام نمایش داده می‌شه.</li>';
  }
}

// --- Export ---
function canvasBlob() {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

async function copyPng() {
  try {
    const blob = await canvasBlob();
    if (!blob) throw new Error('ساخت PNG ناموفق بود');
    if (!imageClipboardSupported()) {
      // Android: no image clipboard and no Web Share in the WebView —
      // the share sheet only exists when the app is opened in a real
      // browser (Chrome for Android). Otherwise the PNG goes to the bot
      // chat, where it can be saved or shared to any app from Telegram.
      try {
        if (await sharePng(blob)) { setStatus('استیکر به اشتراک گذاشته شد.'); return; }
      } catch (e) {
        if (e && e.name === 'AbortError') return; // user closed the sheet
        // Any other share error: fall through to the chat fallback.
      }
      // No share sheet (or it failed): send the PNG to the bot chat,
      // where it can be saved with Telegram's own menu.
      await sendToChat();
      return;
    }
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    setStatus('استیکر کپی شد — حالا توی برنامه Paste کن.');
  } catch (e) {
    setStatus('کپی نشد: ' + (e.message || e));
  }
}

// Can this browser actually put a PNG on the system clipboard?
// Android first: Telegram's Android WebView may report image clipboard
// as supported (ClipboardItem.supports says yes) while the write
// silently drops the image — and Android WebView has no Web Share
// implementation at all (crbug 40540400), so the clipboard path must
// never be trusted there. Only desktop browsers take it.
function imageClipboardSupported() {
  if (/Android/i.test(navigator.userAgent)) return false;
  if (typeof ClipboardItem !== 'undefined' && typeof ClipboardItem.supports === 'function') {
    try { return ClipboardItem.supports('image/png'); } catch (e) { /* fall through */ }
  }
  return true; // desktop browsers can copy images
}

// Android share sheet with the PNG as a file. Returns true when a share
// completed, false when the sheet is not available on this device.
async function sharePng(blob) {
  const file = new File([blob], 'fontstory.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] });
    return true;
  }
  return false;
}

async function downloadPng() {
  const blob = await canvasBlob();
  if (!blob) { setStatus('ساخت PNG ناموفق بود'); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fontstory.png';
  // The anchor must be in the DOM for Safari to honour the download.
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus('استیکر ذخیره شد.');
}

// Inside Telegram, <a download> is ignored by the in-app WebView, so the
// reliable "Save to Gallery" path is: bot sends the PNG to the user's chat
// as a file, and they save it from there with Telegram's own menu.
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(new Error('خواندن PNG ناموفق بود'));
    r.readAsDataURL(blob);
  });
}

let sendingToChat = false;
async function sendToChat() {
  // One send at a time: rapid taps used to fire several sendDocument
  // calls and Telegram's flood control dropped all but one, so the user
  // saw "tap tap tap, one arrives". The button stays disabled until
  // this send finishes, and the progress toast stays up (sticky).
  if (sendingToChat) return;
  sendingToChat = true;
  const galleryBtn = $('saveGallery');
  if (galleryBtn) galleryBtn.disabled = true;
  try {
    setStatus('در حال فرستادن استیکر به چت…', true);
    const blob = await canvasBlob();
    if (!blob) throw new Error('ساخت PNG ناموفق بود');
    if (blob.size > 5 * 1024 * 1024) throw new Error('استیکر خیلی بزرگه');
    const image = await blobToBase64(blob);
    await callEndpoint('sendSticker', { image, text: state.text });
    setStatus('استیکر توی چت بات فرستاده شد — بازش کن، از اونجا ذخیره‌اش کن یا برای اینستاگرام/واتساپ بفرست.');
  } catch (e) {
    setStatus('فرستادن نشد: ' + (e.message || e));
  } finally {
    sendingToChat = false;
    if (galleryBtn) galleryBtn.disabled = false;
  }
}

function updateDoneBtn() {
  const empty = !state.text.trim();
  $('doneBtn').disabled = empty;
  $('clearBtn').disabled = empty;
}

function openExport() {
  if (!state.text.trim()) return;
  draw();
  $('exportImg').src = canvas.toDataURL('image/png');
  $('exportSheet').hidden = false;
}
function closeExport() { $('exportSheet').hidden = true; }

async function saveDesign() {
  try {
    setStatus('در حال ذخیره…');
    const res = await callEndpoint('saveDesign', {
      text: state.text,
      font: state.font,
      style: state.style,
      color: state.color,
      aspect: state.aspect,
      align: state.align,
      weight: state.weight,
      letterSpacing: state.letterSpacing,
      wordSpacing: state.wordSpacing,
      lineHeight: state.lineHeight,
      rotX: state.rotX,
      rotY: state.rotY,
      styleColor: state.styleColor,
      borderRadius: state.borderRadius,
      styleParams: state.styleParams,
    });
    setStatus(`ذخیره شد (شماره ${res?.id ?? '؟'})`);
    await loadRecents();
  } catch (e) {
    setStatus('ذخیره نشد: ' + (e.message || e));
  }
}

// --- Wire up ---
$('canvasWrap').addEventListener('click', () => { textInput.focus(); });
textInput.addEventListener('input', (e) => { state.text = e.target.value; updateDoneBtn(); redraw(); });
textInput.addEventListener('select', () => { if (document.activeElement === textInput) draw(); });
let fullViewportH = 0; // viewport height at focus time (keyboard closed)
textInput.addEventListener('focus', () => {
  state.caret = true;
  // Viewport height before the keyboard slides in — the reference for
  // detecting the keyboard-open shrink below.
  fullViewportH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  draw();
  updateEditingLayout();
});
textInput.addEventListener('blur', () => {
  state.caret = false;
  fullViewportH = 0;
  draw();
  updateEditingLayout();
});

// Keyboard-open layout (2026-11-16): on mobile the viewport shrinks when
// the keyboard opens and the height-constrained canvas shrinks with it,
// so the text turns tiny while editing. While the editor is focused and
// the visual viewport is much shorter than at focus time (keyboard open),
// hide the bottom sheet so the canvas keeps (almost) its full size.
function updateEditingLayout() {
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const kbOpen = fullViewportH > 0 && h < fullViewportH * 0.85;
  // ?editing=1 previews the keyboard-open layout; it survives here so
  // the preview isn't wiped out by the first resize/focus event.
  const previewEditing = new URLSearchParams(location.search).has('editing');
  const editing = previewEditing || (document.activeElement === textInput && kbOpen);
  document.body.classList.toggle('editing', editing);
  // The canvas size follows the stage, so re-sync the editor layout
  // while the viewport is changing (keyboard sliding in/out).
  if (document.activeElement === textInput) draw();
}
if (window.visualViewport) window.visualViewport.addEventListener('resize', updateEditingLayout);
window.addEventListener('resize', updateEditingLayout);

// Tap-to-dismiss (2026-11-17): while the keyboard is open, a tap anywhere
// except the keyboard closes it and the panels come back (blur does that:
// it clears fullViewportH and updateEditingLayout drops body.editing).
// The transparent editor covers the whole canvas, so a tap on the canvas
// IS a tap on the editor — only taps on the text block itself keep
// editing (caret placement); taps on empty canvas dismiss. The clear
// button is excluded: it re-focuses the editor after clearing.
function tapInsideTextBlock(e) {
  if (!lastBlock) return false;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  // Undo the rotation scale around the block centre (cos >= 0.7, the
  // sliders cap rotation at 45 degrees).
  const dx = (x - lastBlock.cx) / Math.max(0.5, lastBlock.cosY);
  const dy = (y - lastBlock.cy) / Math.max(0.5, lastBlock.cosX);
  const MARGIN = 40; // slack so taps just beside the glyphs still edit
  return Math.abs(dx) <= lastBlock.hw + MARGIN && Math.abs(dy) <= lastBlock.hh + MARGIN;
}
document.addEventListener('pointerdown', (e) => {
  if (document.activeElement !== textInput) return;
  if (e.target === textInput && tapInsideTextBlock(e)) return;
  if (e.target.closest && e.target.closest('#clearBtn')) return;
  textInput.blur();
});

// PC scrolling (2026-11-17, support report): the font/style rows are
// horizontal scrollers with a hidden scrollbar — on touch you swipe them,
// but on a PC a mouse wheel does nothing and there's no scrollbar to drag,
// so only the first ~5 cards were reachable. Convert the wheel into a
// horizontal scroll.
// RTL gotcha (found by the failed first verification): the page is
// dir="rtl", so in Chrome scrollLeft starts at 0 and goes NEGATIVE toward
// the list's end — adding a positive delta clamps straight back to 0 and
// the row never moves. Wheel-down must therefore DECREASE scrollLeft in
// RTL (a horizontal deltaX keeps its native mapping and is not flipped).
// The move is attempted first and preventDefault only runs if scrollLeft
// actually changed — at the edge the wheel falls through to the sheet's
// vertical scroll instead of being swallowed. This is also immune to the
// Safari RTL model (scrollLeft starts at max and decreases to 0), where
// the same decrease-toward-the-end holds.
function onRowWheel(e) {
  const row = e.target.closest ? e.target.closest('.card-row') : null;
  if (!row || row.scrollWidth <= row.clientWidth) return;
  if (!e.deltaX && !e.deltaY) return;
  const rtl = getComputedStyle(row).direction === 'rtl';
  const before = row.scrollLeft;
  row.scrollLeft += e.deltaX + (rtl ? -e.deltaY : e.deltaY);
  if (row.scrollLeft === before) return; // at the edge: let the wheel fall through
  e.preventDefault();
}
document.addEventListener('wheel', onRowWheel, { passive: false });

// Test hook: ?editing=1 previews the keyboard-open layout (bottom sheet
// hidden) without a mobile keyboard. Real focus/blur behaviour takes
// over as soon as the editor is focused.
if (new URLSearchParams(location.search).has('editing')) document.body.classList.add('editing');

// Clear-text button (2026-11-16): two taps — the first arms it (red +
// toast), the second clears the whole text at once. Guards against
// wiping a long text by accident; matches the two-tap delete in recents.
let clearArmed = false;
let clearArmTimer = null;
function disarmClear() {
  clearArmed = false;
  $('clearBtn').classList.remove('armed');
}
$('clearBtn').addEventListener('click', () => {
  if (!state.text.trim()) return;
  if (!clearArmed) {
    clearArmed = true;
    $('clearBtn').classList.add('armed');
    setStatus('برای پاک کردن متن، دوباره روی سطل بزن.');
    clearTimeout(clearArmTimer);
    clearArmTimer = setTimeout(disarmClear, 5000);
    return;
  }
  clearTimeout(clearArmTimer);
  disarmClear();
  state.text = '';
  textInput.value = '';
  updateDoneBtn();
  redraw();
  textInput.focus();
});
$('sizeRange').addEventListener('input', (e) => {
  state.size = Number(e.target.value);
  $('sizeValue').textContent = state.size;
  redraw();
});
$('colorPicker').addEventListener('input', (e) => {
  state.color = e.target.value;
  state.colorTouched = true;
  document.querySelectorAll('.swatch').forEach((x) => x.classList.remove('active'));
  document.querySelector('.swatch.rainbow')?.classList.add('active');
  redraw();
});
$('bgBtn').addEventListener('click', () => {
  state.bg = (state.bg + 1) % BACKGROUNDS.length;
  const bg = BACKGROUNDS[state.bg];
  document.body.style.background = bg;
  document.body.classList.toggle('light-bg', bg === '#FFFFFF');
  document.body.classList.toggle('mono-bg', bg === '#000000' || bg === '#FFFFFF');
  document.body.classList.toggle('dark-bg', bg === '#000000');
  applyDefaultTextColor();
});
// Text alignment button (right edge of the stage): one tap cycles
// وسط‌چین → راست‌چین → چپ‌چین → هم‌تراز. The icon always shows the current state.
const ALIGN_ORDER = ['center', 'right', 'left', 'justify'];
const ALIGN_LABELS = { center: 'وسط‌چین', right: 'راست‌چین', left: 'چپ‌چین', justify: 'هم‌تراز' };
const ALIGN_ICONS = {
  center: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>',
  right: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>',
  left: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
  justify: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>',
};
function setAlign(a) {
  state.align = a;
  const btn = $('alignBtn');
  btn.innerHTML = ALIGN_ICONS[a];
  btn.setAttribute('aria-label', 'تراز متن: ' + ALIGN_LABELS[a]);
  btn.title = 'تراز متن: ' + ALIGN_LABELS[a];
  redraw();
}
$('alignBtn').addEventListener('click', () => {
  const next = ALIGN_ORDER[(ALIGN_ORDER.indexOf(state.align) + 1) % ALIGN_ORDER.length];
  setAlign(next);
  setStatus('تراز متن: ' + ALIGN_LABELS[next]);
});
$('doneBtn').addEventListener('click', openExport);
$('exportClose').addEventListener('click', closeExport);
$('exportSheet').addEventListener('click', (e) => { if (e.target === $('exportSheet')) closeExport(); });
$('copyIg').addEventListener('click', copyPng);
$('copyTg').addEventListener('click', copyPng);
$('copyWa').addEventListener('click', copyPng);
$('copyAll').addEventListener('click', copyPng);
$('saveGallery').addEventListener('click', () => {
  // In Telegram the WebView blocks <a download>; send the file to the chat.
  if (inTelegram()) sendToChat();
  else downloadPng();
});
$('saveBtn').addEventListener('click', saveDesign);

// --- Text settings sheet ---
function openSettings() { $('settingsSheet').hidden = false; }
function closeSettings() { $('settingsSheet').hidden = true; }
$('settingsBtn').addEventListener('click', openSettings);
$('settingsClose').addEventListener('click', closeSettings);
$('settingsSheet').addEventListener('click', (e) => { if (e.target === $('settingsSheet')) closeSettings(); });

// Per-style settings sheet: the sliders button under the align button
// opens it from below (same bottom-sheet pattern as the text settings);
// nothing about the style settings is visible until the user taps it.
function openStyleSheet() { renderStyleControls(); $('styleSheet').hidden = false; }
function closeStyleSheet() { $('styleSheet').hidden = true; }
$('styleSettingsBtn').addEventListener('click', openStyleSheet);
$('styleSheetClose').addEventListener('click', closeStyleSheet);
$('styleSheet').addEventListener('click', (e) => { if (e.target === $('styleSheet')) closeStyleSheet(); });
function bindSetting(rangeId, valueId, format, apply) {
  $(rangeId).addEventListener('input', (e) => {
    const v = Number(e.target.value);
    apply(v);
    $(valueId).textContent = format(v);
    redraw();
  });
}
bindSetting('weightRange', 'weightValue', (v) => String(v), (v) => { state.weight = v; });
bindSetting('letterRange', 'letterValue', (v) => v + 'px', (v) => { state.letterSpacing = v; });
bindSetting('wordRange', 'wordValue', (v) => v + 'px', (v) => { state.wordSpacing = v; });
bindSetting('lineRange', 'lineValue', (v) => v.toFixed(1), (v) => { state.lineHeight = v; });
bindSetting('rotXRange', 'rotXValue', (v) => v + '°', (v) => { state.rotX = v; });
bindSetting('rotYRange', 'rotYValue', (v) => v + '°', (v) => { state.rotY = v; });
bindSetting('radiusRange', 'radiusValue', (v) => v + 'px', (v) => { state.borderRadius = v; });
// Style colour: a real, visible <input type="color"> the user taps
// directly (never a hidden input + .click() — WebKit ignores that).
$('styleColorInput').addEventListener('input', (e) => {
  state.styleColor = e.target.value;
  $('styleColorInput').style.background = state.styleColor;
  $('styleColorValue').textContent = state.styleColor.toUpperCase();
  redraw();
});

buildFontPicker();
buildStylePicker();
buildSwatches();
renderStyleControls(); // sets the floating panel's title for the default style too
updateDoneBtn();
redraw();

(async () => {
  if (!inTelegram()) {
    setStatus('خارج از تلگرام باز شده — پیش‌نمایش و خروجی PNG کار می‌کنه، ولی ذخیره و کارهای اخیر نیاز به باز کردن از داخل بات داره.');
    return;
  }
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  try {
    await callEndpoint('register', {});
    setStatus('خوش اومدی!');
  } catch (e) {
    setStatus('ثبت‌نام ناموفق: ' + (e.message || e));
  }
})();
