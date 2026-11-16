// FontStory Mini App front-end — Poufi-style UI, plain JS, no framework.
// Talks to the bot only through tgcloud endpoints:
//   register, saveDesign, myDesigns, deleteDesign
// (Telegram.WebApp.Serverless.call sends verified init data for us.)

const FONTS = [
  { id: 'Vazir', label: 'وزیر', family: "'Vazir', sans-serif" },
  { id: 'IRANYekanXNoEn', label: 'ایران یکان ایکس', family: "'IRANYekanXNoEn', sans-serif" },
  { id: 'IRAN', label: 'ایران', family: "'IRAN', sans-serif" },
  { id: 'YekanBakh', label: 'یکان‌بخ', family: "'Yekan Bakh NoEn', sans-serif" },
  { id: 'Vazirmatn', label: 'وزیرمتن', family: "'Vazirmatn', sans-serif" },
  { id: 'Lalezar', label: 'لاله‌زار', family: "'Lalezar', sans-serif" },
  { id: 'Estedad', label: 'استعداد', family: "'Estedad', sans-serif" },
  { id: 'Parastoo', label: 'پرستو', family: "'Parastoo', sans-serif" },
  { id: 'Amiri', label: 'امیری', family: "'Amiri', serif" },
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
    { key: 'stickerOutline', label: 'ضخامت خط دور', type: 'range', min: 5, max: 20, step: 1, def: 10, unit: '٪' },
    { key: 'stickerShadow', label: 'فاصله سایه', type: 'range', min: 0, max: 40, step: 1, def: 20, unit: '٪' },
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
    } else {
      const n = Number(v);
      if (Number.isFinite(n)) out[key] = Math.min(c.max, Math.max(c.min, n));
    }
  }
  return out;
}
const ASPECTS = { '9:16': [1080, 1920], '1:1': [1080, 1080] };

// Poufi-style background gradients (pink-orange default, cycles on tap).
const BACKGROUNDS = [
  'linear-gradient(180deg, #ff3b5c 0%, #ff7a3d 100%)',
  'linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)',
  'linear-gradient(180deg, #8b5cf6 0%, #ec4899 100%)',
  'linear-gradient(180deg, #0ea47a 0%, #84cc16 100%)',
];

const state = {
  text: 'سلام دنیا',
  font: 'Vazir',
  style: 'bold',
  color: '#FFFFFF',
  aspect: '9:16',
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
const ctx = canvas.getContext('2d');
const statusEl = $('status');
const textInput = $('textInput');
let toastTimer = null;

function setStatus(msg) {
  if (!msg) { statusEl.hidden = true; return; }
  statusEl.textContent = msg;
  statusEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { statusEl.hidden = true; }, 2600);
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
  const f = FONTS.find((x) => x.id === state.font);
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
  // \n is a hard break: wrap each paragraph on its own and keep empty
  // lines, so Enter in the editor really moves to the next line.
  // (The old version split on /\s+/, which treats \n like a space and
  // re-flowed everything onto one line — that was the bug.)
  const lines = [];
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter((w) => w !== '');
    if (!words.length) { lines.push(''); continue; }
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (lineWidth(test) > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [''];
}

// Draw one line word by word (word spacing has no canvas API, so the
// words are positioned manually). RTL text runs right-to-left.
function drawWords(line, cx, y, dx = 0, dy = 0, mode = 'fill') {
  const words = line.split(' ').filter((w) => w !== '');
  if (!words.length) return;
  const lw = lineWidth(line);
  const rtl = isRTLText(line);
  const gap = spaceWidth() + state.wordSpacing;
  let x = rtl ? cx + lw / 2 : cx - lw / 2;
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
    ctx.fillStyle = contrastText(state.styleColor); drawWords(line, cx, y);
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
    ctx.fillStyle = contrastText(state.styleColor); drawWords(line, cx, y);
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
    // Sticker look, matched to the reference: golden fill, red outline
    // (border 1), a solid maroon shadow offset down-left (border 2, the
    // darker one), and a thick white outer outline (border 3) wrapping
    // the whole silhouette. The white stroke is 4x the red one, so the
    // white ring reads ~3x as thick as the red ring.
    // Paint order is the trick: the white rings go down FIRST (one around
    // the shadow shape, one around the text), then the maroon fill covers
    // their inner halves — so the maroon sits between the red and the
    // white on the shadow side, with no white between red and maroon.
    // Red + fill go last and win wherever they overlap the maroon.
    const w = fs * (sp('stickerOutline') / 100);
    const dy = fs * (sp('stickerShadow') / 100);
    const dx = -0.6 * dy;
    strokeWords(line, cx, y, '#ffffff', w * 4, dx, dy);
    strokeWords(line, cx, y, '#ffffff', w * 4);
    ctx.fillStyle = '#5C1220';
    drawWords(line, cx, y, dx, dy);
    strokeWords(line, cx, y, '#ED1C24', w);
    ctx.fillStyle = '#FFC531';
    drawWords(line, cx, y);
  },
};

function draw() {
  const [w, h] = ASPECTS[state.aspect];
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fontSize = state.size;
  ctx.font = `${state.weight} ${fontSize}px ${fontFamily()}`;
  // Native letter spacing where the WebView supports it (Chrome 99+,
  // Safari 17+); word spacing is applied manually in drawWords.
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${state.letterSpacing}px`;
  const maxWidth = w - 160;
  const lines = wrapLines(state.text || '…', maxWidth);
  const lineHeight = fontSize * state.lineHeight;
  const blockH = lines.length * lineHeight;
  let y = h / 2 - blockH / 2 + lineHeight / 2;
  const cx = w / 2;

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

  for (const line of lines) {
    ctx.save();
    const lw = lineWidth(line);
    const paint = STYLE_PAINT[state.style] || STYLE_PAINT.bold;
    paint(line, cx, y, lw, fontSize);
    ctx.restore();
    y += lineHeight;
  }

  // Blinking caret at the end of the text while the input is focused
  // (left end for RTL text, right end for LTR).
  if (state.caret && document.activeElement === textInput) {
    const last = lines[lines.length - 1] || '';
    const lw = lineWidth(last);
    const caretY = h / 2 - blockH / 2 + (lines.length - 1) * lineHeight;
    const caretX = isRTLText(last) ? cx - lw / 2 - 15 : cx + lw / 2 + 8;
    ctx.save();
    ctx.fillStyle = state.color;
    ctx.fillRect(caretX, caretY - fontSize * 0.55, 7, fontSize * 1.1);
    ctx.restore();
  }

  ctx.restore(); // rotation transform

  // Pixel style: downscale the text block, then scale it back up with
  // smoothing off — the classic pixelated look. Runs in unrotated
  // device space, after the rotation transform is restored.
  if (state.style === 'pixel') {
    const maxLw = Math.max(...lines.map((l) => lineWidth(l)));
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
}

function redraw() {
  // Wait for webfonts so the canvas uses the real font, not a fallback.
  if (document.fonts?.load) {
    document.fonts.load(`${state.weight} ${state.size}px ${fontFamily()}`).catch(() => {}).finally(draw);
  }
  draw();
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

function buildFontPicker() {
  buildCardPicker($('fontPicker'), FONTS, state.font, (id) => { state.font = id; redraw(); },
    (item) => `<span style="font-family:${item.family}">متن شما</span>`);
}

function buildStylePicker() {
  buildCardPicker($('stylePicker'), STYLES, state.style, (id) => { state.style = id; renderStyleControls(); redraw(); },
    (item) => `<span class="sample-${item.id}">متن شما</span>`);
}

// Build the «تنظیمات این استایل» controls for the current style.
// Rebuilt on style change, on opening the sheet, and on applying a
// saved design — so the sheet always shows the current style's knobs.
function renderStyleControls() {
  const wrap = $('styleControls');
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

function applyDesign(d) {
  state.text = d.text || '';
  state.font = d.font || 'Vazir';
  // Old saved designs may carry a style that was later deleted.
  state.style = STYLES.some((s) => s.id === d.style) ? d.style : 'bold';
  state.color = d.color || '#FFFFFF';
  state.aspect = d.aspect || '9:16';
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
  $('aspectBtn').textContent = state.aspect === '9:16' ? '۹:۱۶' : '۱:۱';
  $('canvasWrap').classList.toggle('square', state.aspect === '1:1');
  syncSettingsUI();
  buildFontPicker();
  buildStylePicker();
  buildSwatches();
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
      li.innerHTML = `<div class="recent-text"></div><div class="meta">${d.font} · ${d.style} · ${d.aspect} · ${date}</div>`;
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
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    setStatus('استیکر کپی شد — حالا توی برنامه Paste کن.');
  } catch (e) {
    setStatus('کپی نشد: ' + (e.message || e));
  }
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

async function sendToChat() {
  try {
    setStatus('در حال فرستادن استیکر به چت…');
    const blob = await canvasBlob();
    if (!blob) throw new Error('ساخت PNG ناموفق بود');
    if (blob.size > 5 * 1024 * 1024) throw new Error('استیکر خیلی بزرگه');
    const image = await blobToBase64(blob);
    await callEndpoint('sendSticker', { image, text: state.text });
    setStatus('استیکر توی چت بات فرستاده شد — بازش کن و «ذخیره در گالری» رو بزن.');
  } catch (e) {
    setStatus('فرستادن نشد: ' + (e.message || e));
  }
}

function updateDoneBtn() { $('doneBtn').disabled = !state.text.trim(); }

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
textInput.addEventListener('focus', () => { state.caret = true; draw(); });
textInput.addEventListener('blur', () => { state.caret = false; draw(); });
$('sizeRange').addEventListener('input', (e) => {
  state.size = Number(e.target.value);
  $('sizeValue').textContent = state.size;
  redraw();
});
$('colorPicker').addEventListener('input', (e) => {
  state.color = e.target.value;
  document.querySelectorAll('.swatch').forEach((x) => x.classList.remove('active'));
  document.querySelector('.swatch.rainbow')?.classList.add('active');
  redraw();
});
$('aspectBtn').addEventListener('click', () => {
  state.aspect = state.aspect === '9:16' ? '1:1' : '9:16';
  $('aspectBtn').textContent = state.aspect === '9:16' ? '۹:۱۶' : '۱:۱';
  $('canvasWrap').classList.toggle('square', state.aspect === '1:1');
  redraw();
});
$('bgBtn').addEventListener('click', () => {
  state.bg = (state.bg + 1) % BACKGROUNDS.length;
  document.body.style.background = BACKGROUNDS[state.bg];
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
function openSettings() { renderStyleControls(); $('settingsSheet').hidden = false; }
function closeSettings() { $('settingsSheet').hidden = true; }
$('settingsBtn').addEventListener('click', openSettings);
$('settingsClose').addEventListener('click', closeSettings);
$('settingsSheet').addEventListener('click', (e) => { if (e.target === $('settingsSheet')) closeSettings(); });
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
