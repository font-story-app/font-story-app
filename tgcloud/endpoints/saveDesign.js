import { db, EndpointError } from 'sdk';
import { designs } from '../schema.js';
import { ensureUser } from '../lib/users.js';

const ALLOWED_FONTS = ['Vazir', 'IRANYekanXNoEn', 'IRAN', 'YekanBakh', 'Vazirmatn', 'Lalezar', 'Estedad', 'Parastoo', 'Amiri'];
const ALLOWED_STYLES = [
  'bold', 'highlight', 'neon', 'glass', 'retro', 'shadow',
  'glow', 'gradient', 'stroke', 'brush', 'pastille', 'round',
  'arcadia', 'underline', 'pixel', 'quotes', 'winter', 'rosseta',
  'sticker',
];
const ALLOWED_ASPECTS = ['9:16', '1:1'];
const ALLOWED_WEIGHTS = [400, 500, 600, 700, 800, 900];

// Per-style extra parameters (mirror of STYLE_CONTROLS in web/app.js):
// range keys are clamped to [min, max], color keys must be #RRGGBB.
// Unknown keys are dropped.
const STYLE_PARAMS = {
  neonGlow: { min: 0, max: 80 },
  glowGlow: { min: 0, max: 80 },
  winterGlow: { min: 0, max: 60 },
  glassOpacity: { min: 5, max: 50 },
  retroOffset: { min: 0, max: 30 },
  shadowBlur: { min: 0, max: 40 },
  shadowOffset: { min: 0, max: 30 },
  gradientC1: { color: true },
  gradientC2: { color: true },
  arcadiaC1: { color: true },
  arcadiaC2: { color: true },
  strokeWidth: { min: 5, max: 25 },
  pastilleStroke: { min: 5, max: 20 },
  roundStroke: { min: 4, max: 16 },
  rossetaStroke: { min: 1, max: 8 },
  brushTilt: { min: -10, max: 10 },
  underlineWidth: { min: 2, max: 40 },
  underlineC1: { color: true },
  underlineC2: { color: true },
  pixelSize: { min: 2, max: 12 },
  stickerOutline: { min: 5, max: 20 },
  stickerMaroon: { min: 0, max: 60 },
};

function sanitizeStyleParams(input) {
  let raw = input;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = {}; }
  }
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const [key, rule] of Object.entries(STYLE_PARAMS)) {
    const v = raw[key];
    if (rule.color) {
      if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) out[key] = v;
    } else {
      const n = Number(v);
      if (Number.isFinite(n)) out[key] = Math.min(rule.max, Math.max(rule.min, n));
    }
  }
  return out;
}

function clampNum(v, min, max, def) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
}

// Save one design for the caller. Input:
// { text, font, style, color, aspect,
//   weight, letterSpacing, wordSpacing, lineHeight, rotX, rotY,
//   styleColor, borderRadius, styleParams }
export default async function (input, ctx) {
  const user = ctx.initData?.user;
  if (!user?.id) {
    throw new EndpointError('No Telegram user in init data', { code: 'NO_USER' });
  }
  const text = typeof input?.text === 'string' ? input.text.trim() : '';
  if (!text) {
    throw new EndpointError('Text is required', { code: 'EMPTY_TEXT' });
  }
  if (text.length > 500) {
    throw new EndpointError('Text must be under 500 characters', { code: 'TEXT_TOO_LONG' });
  }
  const font = ALLOWED_FONTS.includes(input?.font) ? input.font : 'Vazir';
  const style = ALLOWED_STYLES.includes(input?.style) ? input.style : 'bold';
  const color = typeof input?.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(input.color)
    ? input.color
    : '#FFFFFF';
  const aspect = ALLOWED_ASPECTS.includes(input?.aspect) ? input.aspect : '9:16';
  const weight = ALLOWED_WEIGHTS.includes(Number(input?.weight)) ? Number(input.weight) : 800;
  const styleColor = typeof input?.styleColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(input.styleColor)
    ? input.styleColor
    : '#F4D93E';

  await ensureUser(user);
  const [row] = await db
    .insert(designs)
    .values({
      userId: user.id, text, font, style, color, aspect, weight, styleColor,
      letterSpacing: clampNum(input?.letterSpacing, 0, 40, 0),
      wordSpacing: clampNum(input?.wordSpacing, 0, 60, 0),
      lineHeight: clampNum(input?.lineHeight, 1, 2, 1.4),
      rotX: clampNum(input?.rotX, -45, 45, 0),
      rotY: clampNum(input?.rotY, -45, 45, 0),
      borderRadius: clampNum(input?.borderRadius, 0, 40, 18),
      styleParams: JSON.stringify(sanitizeStyleParams(input?.styleParams)),
    })
    .returning({ id: designs.id })
    .run();
  return { ok: true, id: row?.id ?? null };
}
