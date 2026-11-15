// FontStory Mini App front-end — Poufi-style UI, plain JS, no framework.
// Talks to the bot only through tgcloud endpoints:
//   register, saveDesign, myDesigns
// (Telegram.WebApp.Serverless.call sends verified init data for us.)

const FONTS = [
  { id: 'Vazir', label: 'وزیر', family: "'Vazir', sans-serif" },
  { id: 'IRANYekanXNoEn', label: 'ایران یکان ایکس', family: "'IRANYekanXNoEn', sans-serif" },
  { id: 'IRAN', label: 'ایران', family: "'IRAN', sans-serif" },
  { id: 'YekanBakh', label: 'یکان‌بخش', family: "'Yekan Bakh NoEn', sans-serif" },
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
  { id: 'violet', label: 'ویولت' },
  { id: 'goldText', label: 'متن طلایی' },
  { id: 'stroke', label: 'استروک' },
  { id: 'chibold', label: 'چی‌بولد' },
  { id: 'brush', label: 'قلم‌مو' },
  { id: 'bubble', label: 'حباب' },
  { id: 'pastille', label: 'پاستیل' },
  { id: 'round', label: 'راوند' },
  { id: 'arcadia', label: 'آرکادیا' },
  { id: 'imessage', label: 'آی‌مسیج' },
  { id: 'goldBg', label: 'پس‌زمینه طلایی' },
  { id: 'colorBg', label: 'پس‌زمینه رنگی' },
  { id: 'gradientBox', label: 'باکس گرادیان' },
  { id: 'alphaBox', label: 'باکس شفاف' },
  { id: 'borderBox', label: 'باکس حاشیه‌دار' },
  { id: 'lightBox', label: 'باکس روشن' },
  { id: 'redShadow', label: 'سایه قرمز' },
  { id: 'underline', label: 'خط زیر' },
  { id: 'pixel', label: 'پیکسلی' },
  { id: 'quotes', label: 'نقل‌قول' },
  { id: 'winter', label: 'زمستانی' },
  { id: 'rosseta', label: 'رُزتا' },
];

const COLORS = ['#FFFFFF', '#1F2421', '#E6483F', '#F4D93E', '#3FA98A', '#2E7DD1'];
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

function wrapLines(text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
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

function strokeWords(line, cx, y, color, width) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  drawWords(line, cx, y, 0, 0, 'stroke');
  ctx.restore();
}

function boxGradient(cx, lw, stops) {
  const g = ctx.createLinearGradient(cx - lw / 2 - 28, 0, cx + lw / 2 + 28, 0);
  stops.forEach(([at, color]) => g.addColorStop(at, color));
  return g;
}

const STYLE_PAINT = {
  bold: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  highlight: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: '#F4D93E', radius: 18, padX: 24 });
    ctx.fillStyle = '#1F2421'; drawWords(line, cx, y);
  },
  neon: (line, cx, y) => {
    ctx.shadowColor = state.color; ctx.shadowBlur = 45; ctx.fillStyle = state.color;
    drawWords(line, cx, y); ctx.shadowBlur = 0; drawWords(line, cx, y);
  },
  glow: (line, cx, y) => {
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 35; ctx.fillStyle = '#fff';
    drawWords(line, cx, y); ctx.shadowBlur = 0; drawWords(line, cx, y);
  },
  glass: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  retro: (line, cx, y) => {
    ctx.fillStyle = '#FF2E88'; drawWords(line, cx, y, 10, 10);
    ctx.fillStyle = '#22D3EE'; drawWords(line, cx, y, -6, -6);
    ctx.fillStyle = state.color; drawWords(line, cx, y);
  },
  shadow: (line, cx, y) => {
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 12;
    ctx.fillStyle = state.color; drawWords(line, cx, y);
  },
  gradient: (line, cx, y, lw) => {
    ctx.fillStyle = textGradient(cx, lw, [[0, '#ff2e88'], [0.5, '#ff7a3d'], [1, '#f4d93e']]);
    drawWords(line, cx, y);
  },
  violet: (line, cx, y, lw) => {
    ctx.fillStyle = textGradient(cx, lw, [[0, '#8b5cf6'], [1, '#d946ef']]);
    drawWords(line, cx, y);
  },
  goldText: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#3a2a00', fs * 0.06);
    ctx.fillStyle = textGradient(cx, lw, [[0, '#f9d976'], [0.5, '#f39c12'], [1, '#b8860b']]);
    drawWords(line, cx, y);
  },
  stroke: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#111111', fs * 0.14);
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  chibold: (line, cx, y, lw, fs) => {
    ctx.font = `900 ${fs}px ${fontFamily()}`;
    strokeWords(line, cx, y, '#111111', fs * 0.2);
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  brush: (line, cx, y, lw, fs) => {
    ctx.save(); ctx.translate(cx, y); ctx.rotate(-0.03);
    ctx.fillStyle = '#232347';
    roundRect(-lw / 2 - 30, -fs * 0.62, lw + 60, fs * 1.24, fs * 0.5); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  bubble: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#ff5c8a', fs * 0.12);
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  pastille: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#7c3aed', fs * 0.1);
    ctx.fillStyle = '#ffe45e'; drawWords(line, cx, y);
  },
  round: (line, cx, y, lw, fs) => {
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    strokeWords(line, cx, y, '#ffffff', fs * 0.08);
    ctx.fillStyle = '#a855f7'; drawWords(line, cx, y);
  },
  arcadia: (line, cx, y, lw, fs) => {
    strokeWords(line, cx, y, '#ffffff', fs * 0.06);
    ctx.fillStyle = textGradient(cx, lw, [[0, '#ff7a18'], [1, '#ff2e63']]);
    drawWords(line, cx, y);
  },
  imessage: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: '#0a84ff', radius: fs * 0.45, padX: 28 });
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  goldBg: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: boxGradient(cx, lw, [[0, '#f6d365'], [1, '#d4a017']]), radius: 999, padX: 28 });
    ctx.fillStyle = '#1a1a1a'; drawWords(line, cx, y);
  },
  colorBg: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: '#e5484d', radius: 16, padX: 28 });
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  gradientBox: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: boxGradient(cx, lw, [[0, '#ff9a3d'], [1, '#ff5e62']]), radius: 18, padX: 28 });
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  alphaBox: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: 'rgba(139,124,246,0.55)', radius: 18, padX: 28 });
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  borderBox: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: '#1e1b4b', stroke: '#ef4444', strokeWidth: 6, radius: 8, padX: 30 });
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  lightBox: (line, cx, y, lw, fs) => {
    bgBox(cx, y, lw, fs, { fill: '#f1f1f1', radius: 14, padX: 28 });
    ctx.fillStyle = '#111111'; drawWords(line, cx, y);
  },
  redShadow: (line, cx, y) => {
    ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#fff'; drawWords(line, cx, y);
  },
  underline: (line, cx, y, lw, fs) => {
    ctx.fillStyle = state.color; drawWords(line, cx, y);
    ctx.save(); ctx.fillStyle = textGradient(cx, lw, [[0, '#7c3aed'], [1, '#2563eb']]);
    roundRect(cx - lw / 2, y + fs * 0.58, lw, 8, 4); ctx.fill(); ctx.restore();
  },
  pixel: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  quotes: (line, cx, y) => { ctx.fillStyle = state.color; drawWords(line, cx, y); },
  winter: (line, cx, y) => {
    ctx.shadowColor = '#22ff88'; ctx.shadowBlur = 30; ctx.fillStyle = '#4ade80';
    drawWords(line, cx, y); ctx.shadowBlur = 0; drawWords(line, cx, y);
  },
  rosseta: (line, cx, y, lw, fs) => {
    ctx.font = `300 ${fs}px ${fontFamily()}`;
    strokeWords(line, cx, y, '#a7f3d0', 2.5);
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
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    roundRect(cx - bw / 2, y - lineHeight / 2 - pad / 2, bw, blockH + pad, 40);
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
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 4;
    roundRect(cx - bw / 2, top, bw, blockH + pad, 16);
    ctx.stroke();
    ctx.fillStyle = '#2dd4bf';
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
    const cell = 6;
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
  buildCardPicker($('stylePicker'), STYLES, state.style, (id) => { state.style = id; redraw(); },
    (item) => `<span class="sample-${item.id}">متن شما</span>`);
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
  state.style = d.style || 'bold';
  state.color = d.color || '#FFFFFF';
  state.aspect = d.aspect || '9:16';
  state.weight = [400, 500, 600, 700, 800, 900].includes(Number(d.weight)) ? Number(d.weight) : 800;
  state.letterSpacing = clampNum(d.letterSpacing, 0, 40, 0);
  state.wordSpacing = clampNum(d.wordSpacing, 0, 60, 0);
  state.lineHeight = clampNum(d.lineHeight, 1, 2, 1.4);
  state.rotX = clampNum(d.rotX, -45, 45, 0);
  state.rotY = clampNum(d.rotY, -45, 45, 0);
  textInput.value = state.text;
  $('colorPicker').value = state.color;
  $('aspectBtn').textContent = state.aspect === '9:16' ? '۹:۱۶' : '۱:۱';
  $('canvasWrap').classList.toggle('square', state.aspect === '1:1');
  syncSettingsUI();
  buildFontPicker();
  buildStylePicker();
  buildSwatches();
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
}

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
      li.innerHTML = `<div></div><div class="meta">${d.font} · ${d.style} · ${d.aspect} · ${date}</div>`;
      li.firstChild.textContent = d.text;
      li.addEventListener('click', () => applyDesign(d));
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
  redraw();
});
$('customColorBtn').addEventListener('click', () => $('colorPicker').click());
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
function openSettings() { $('settingsSheet').hidden = false; }
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
