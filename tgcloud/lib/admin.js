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

// --- Broadcast (batched — reworked 2026-11-26) ---
//
// The old code sent to every user one by one inside the webhook
// handler. With 948 users that takes minutes; the platform kills
// the handler mid-loop, so the «sending…» message stayed stuck for
// 1.5 h, only the first users were reached, and no summary ever
// came. A /broadcast now only CREATES a job (fast) and the work
// runs in short batches: 25 users per batch, 8 parallel lanes,
// 40 ms gap per lane (stays under Telegram's ~30 msg/sec broadcast
// limit), a 20 s time budget per invocation, and the cursor is
// checkpointed to the DB after every batch. If an invocation runs
// out of budget, the owner taps «ادامه ارسال» and it resumes from
// the cursor — no user is ever sent to twice (a 429 flood-wait
// retries once after retry_after instead of counting as failed).

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Time budget per invocation (ms) — keep well under any webhook /
// isolate timeout so an invocation always ends cleanly with a
// progress message instead of dying mid-loop.
export const BROADCAST_BUDGET_MS = 20000;
export const BROADCAST_BATCH_SIZE = 25;
export const BROADCAST_LANES = 8;

export async function getRunningBroadcast() {
  return await db.get(sql`SELECT * FROM broadcasts WHERE status = 'running' ORDER BY id DESC LIMIT 1`);
}

export async function getBroadcast(id) {
  if (!id) return null;
  return await db.get(sql`SELECT * FROM broadcasts WHERE id = ${id}`);
}

// Create a broadcast job. Throws EMPTY / TOO_LONG (same validation
// as before) or ALREADY_RUNNING if a job is still in flight.
export async function createBroadcast(text) {
  const clean = (text || '').trim();
  if (!clean) throw new Error('EMPTY');
  if (clean.length > 4096) throw new Error('TOO_LONG');
  const running = await getRunningBroadcast();
  if (running) throw new Error('ALREADY_RUNNING');
  const count = await db.get(sql`SELECT count(*) AS c FROM users`);
  const total = count?.c ?? 0;
  const now = Math.floor(Date.now() / 1000);
  await db.run(
    sql`INSERT INTO broadcasts (text, total, sent, failed, cursor, status, created_at) VALUES (${clean}, ${total}, 0, 0, NULL, 'running', ${now})`,
  );
  return await db.get(sql`SELECT * FROM broadcasts WHERE id = last_insert_rowid()`);
}

// Send ONE batch (the next users after the job's cursor). Updates
// sent/failed/cursor in the DB and returns the fresh job plus
// whether the queue is exhausted.
export async function sendBroadcastBatch(job, opts = {}) {
  const batchSize = opts.batchSize || BROADCAST_BATCH_SIZE;
  const lanes = opts.lanes || BROADCAST_LANES;
  const doSleep = opts.sleep || sleep;
  const rows = await db.all(
    sql`SELECT tg_id FROM users WHERE tg_id > ${job.cursor ?? 0} ORDER BY tg_id ASC LIMIT ${batchSize}`,
  );
  if (!rows || !rows.length) {
    return { done: true, job };
  }
  const text = job.text;
  let sent = job.sent || 0;
  let failed = job.failed || 0;
  let lastId = job.cursor ?? 0;
  const sendOne = async (tgId) => {
    const attempt = async () => await api.sendMessage({ chat_id: tgId, text });
    try {
      await attempt();
      sent++;
    } catch (e) {
      // Flood-wait: pause for Telegram's retry_after, then try once
      // more. Anything else (blocked bot, deleted account) is a
      // permanent failure for this user.
      if (e?.code === 429) {
        const waitSec = Math.min(Math.max(Number(e?.parameters?.retry_after) || 1, 1), 30);
        await doSleep(waitSec * 1000);
        try {
          await attempt();
          sent++;
        } catch {
          failed++;
        }
      } else {
        failed++;
      }
    }
    // The cursor is the HIGHEST id in the batch, not the last one to
    // finish — lanes complete out of order, and taking the last
    // finisher would re-send the higher ids on resume.
    lastId = Math.max(lastId, tgId);
  };
  // Split the batch across parallel lanes; each lane works its
  // share sequentially with a small gap between sends.
  const groups = Array.from({ length: lanes }, () => []);
  rows.forEach((row, i) => groups[i % lanes].push(row.tg_id));
  await Promise.all(
    groups.map(async (ids) => {
      for (const tgId of ids) {
        await sendOne(tgId);
        await doSleep(40);
      }
    }),
  );
  await db.run(
    sql`UPDATE broadcasts SET sent = ${sent}, failed = ${failed}, cursor = ${lastId} WHERE id = ${job.id}`,
  );
  const fresh = await getBroadcast(job.id);
  return { done: false, job: fresh || { ...job, sent, failed, cursor: lastId } };
}

// Run batches until the queue is done or the time budget is spent.
// Returns { done, job } with the fresh job row.
export async function runBroadcast(job, opts = {}) {
  const budgetMs = opts.budgetMs ?? BROADCAST_BUDGET_MS;
  const nowFn = opts.now || Date.now;
  const start = nowFn();
  let current = job;
  for (;;) {
    if (nowFn() - start >= budgetMs) return { done: false, job: current };
    const result = await sendBroadcastBatch(current, opts);
    current = result.job;
    if (result.done) return { done: true, job: current };
  }
}

export async function finishBroadcast(job) {
  const now = Math.floor(Date.now() / 1000);
  await db.run(sql`UPDATE broadcasts SET status = 'done', finished_at = ${now} WHERE id = ${job.id}`);
  return await getBroadcast(job.id);
}

export function broadcastProgressText(job) {
  const total = job.total || 0;
  const sent = job.sent || 0;
  const failed = job.failed || 0;
  const remaining = Math.max(0, total - sent - failed);
  return (
    '📣 دارم پیام رو می‌فرستم…\n\n' +
    `✅ رسید: ${fa(sent)}\n` +
    `❌ نرسید (بلاک/حذف): ${fa(failed)}\n` +
    `⏳ باقی‌مونده: ${fa(remaining)} از ${fa(total)}`
  );
}

export function broadcastSummaryText(job) {
  return (
    '📣 پیام همگانی تموم شد.\n\n' +
    `کل کاربرا: ${fa(job.total || 0)}\n` +
    `رسید: ${fa(job.sent || 0)}\n` +
    `نرسید (بلاک/حذف): ${fa(job.failed || 0)}`
  );
}

export function broadcastResumeKeyboard(job) {
  return {
    inline_keyboard: [
      [{ text: '➡️ ادامه ارسال', callback_data: `broadcast:resume:${job.id}` }],
    ],
  };
}
