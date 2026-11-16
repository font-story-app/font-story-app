import { api, db } from 'sdk';
import { sql } from 'sdk/db';
import { OWNER_ID } from './owner.js';

// Admin panel — owner-only. OWNER_ID lives in tgcloud/lib/owner.js,
// which is gitignored (never in the public repo); deployers create
// owner.js with `export const OWNER_ID = <their numeric Telegram ID>`
// (get it from @userinfobot).

export function isAdmin(from) {
  return from?.id === OWNER_ID;
}

export const fa = (n) => Number(n || 0).toLocaleString('fa-IR');

const ADMIN_KEYBOARD = {
  inline_keyboard: [
    [{ text: '📊 آمار', callback_data: 'admin:stats' }],
    [{ text: '📣 پیام همگانی', callback_data: 'admin:broadcast' }],
    [{ text: '🚪 خروج از پنل', callback_data: 'admin:exit' }],
  ],
};

const BACK_KEYBOARD = {
  inline_keyboard: [
    [{ text: '↩ بازگشت به پنل', callback_data: 'admin:panel' }],
    [{ text: '🚪 خروج از پنل', callback_data: 'admin:exit' }],
  ],
};

export const PANEL_TEXT =
  '🛠 پنل مدیریت FontStory\n\n' +
  'از اینجا آمار رو ببین و به همه‌ی کاربرا پیام بده.';

export function adminPanelMessage() {
  return { text: PANEL_TEXT, reply_markup: ADMIN_KEYBOARD };
}

export function backKeyboard() {
  return BACK_KEYBOARD;
}

// --- Stats ---

// Start of the current day in Tehran (UTC+3:30), as a unix timestamp.
function tehranDayStartUnix(nowMs = Date.now()) {
  const offsetMs = 3.5 * 3600 * 1000;
  const d = new Date(nowMs + offsetMs);
  d.setUTCHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - offsetMs) / 1000);
}

export async function getStats() {
  const now = Math.floor(Date.now() / 1000);
  const todayStart = tehranDayStartUnix();
  const weekStart = now - 7 * 86400;
  const [usersTotal, usersToday, users7d, activeToday, designsTotal, designsToday, topFonts, topStyles] =
    await Promise.all([
      db.get(sql`SELECT count(*) AS c FROM users`),
      db.get(sql`SELECT count(*) AS c FROM users WHERE created_at >= ${todayStart}`),
      db.get(sql`SELECT count(*) AS c FROM users WHERE created_at >= ${weekStart}`),
      db.get(sql`SELECT count(*) AS c FROM users WHERE last_seen_at >= ${todayStart}`),
      db.get(sql`SELECT count(*) AS c FROM designs`),
      db.get(sql`SELECT count(*) AS c FROM designs WHERE created_at >= ${todayStart}`),
      db.all(sql`SELECT font, count(*) AS n FROM designs GROUP BY font ORDER BY n DESC LIMIT 3`),
      db.all(sql`SELECT style, count(*) AS n FROM designs GROUP BY style ORDER BY n DESC LIMIT 3`),
    ]);
  return {
    usersTotal: usersTotal?.c ?? 0,
    usersToday: usersToday?.c ?? 0,
    users7d: users7d?.c ?? 0,
    activeToday: activeToday?.c ?? 0,
    designsTotal: designsTotal?.c ?? 0,
    designsToday: designsToday?.c ?? 0,
    topFonts: (topFonts || []).map((r) => ({ name: r.font, n: r.n })),
    topStyles: (topStyles || []).map((r) => ({ name: r.style, n: r.n })),
  };
}

function topLines(title, items) {
  if (!items.length) return `${title}\n— هنوز چیزی نیست`;
  return `${title}\n` + items.map((x, i) => `${fa(i + 1)}. ${x.name} — ${fa(x.n)}`).join('\n');
}

export function formatStats(s) {
  return (
    '📊 آمار FontStory\n\n' +
    `👥 کاربرا: ${fa(s.usersTotal)} کل | ${fa(s.usersToday)} امروز | ${fa(s.users7d)} این هفته\n` +
    `🟢 فعال امروز: ${fa(s.activeToday)}\n` +
    `🎨 طرح‌های ذخیره‌شده: ${fa(s.designsTotal)} کل | ${fa(s.designsToday)} امروز\n\n` +
    topLines('🏆 محبوب‌ترین فونت‌ها:', s.topFonts) +
    '\n\n' +
    topLines('✨ محبوب‌ترین استایل‌ها:', s.topStyles)
  );
}

// --- Broadcast ---

// Send `text` to every registered user, one by one. Returns the counts.
// Users who blocked the bot (or deleted their account) count as failed.
export async function broadcast(text) {
  const clean = (text || '').trim();
  if (!clean) throw new Error('EMPTY');
  if (clean.length > 4096) throw new Error('TOO_LONG');
  const rows = await db.all(sql`SELECT tg_id FROM users`);
  let sent = 0;
  let failed = 0;
  for (const row of rows || []) {
    try {
      await api.sendMessage({ chat_id: row.tg_id, text: clean });
      sent++;
    } catch {
      failed++;
    }
    // Stay well under Telegram's ~30 msg/sec broadcast limit.
    await new Promise((r) => setTimeout(r, 40));
  }
  return { total: (rows || []).length, sent, failed };
}
