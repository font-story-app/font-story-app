import { api } from 'sdk';
import { ensureUser } from '../lib/users.js';
import { isAdmin, adminPanelMessage, getStats, formatStats, broadcast, fa } from '../lib/admin.js';

// Mini App URL — live since the first deploy (2026-11-15).
const MINI_APP_URL = 'https://app9160164486.tgcloud.ai/';

export default async function (message) {
  if (message.chat?.type && message.chat.type !== 'private') return;
  const chatId = message.chat.id;
  const from = message.from;
  if (!from?.id) return;

  await ensureUser(from);

  const text = message.text || '';

  // /start (with or without args) — the only command this bot needs.
  if (text.startsWith('/start')) {
    await api.sendMessage({
      chat_id: chatId,
      text:
        '✨ به FontStory خوش اومدی!\n\n' +
        'متنت رو بنویس، فونت و استایلش رو انتخاب کن و به‌صورت عکس شفاف برای استوری ذخیره یا کپی کن — بدون واترمارک، بدون ثبت‌نام.',
      reply_markup: {
        inline_keyboard: [[{ text: '🎨 باز کردن FontStory', web_app: { url: MINI_APP_URL } }]],
      },
    });
    return;
  }

  // --- Admin commands (owner only; everyone else falls through to the
  // Mini App pointer below, so the commands stay invisible) ---
  if (isAdmin(from)) {
    if (text === '/admin') {
      const panel = adminPanelMessage();
      await api.sendMessage({ chat_id: chatId, text: panel.text, reply_markup: panel.reply_markup });
      return;
    }
    if (text === '/stats') {
      const stats = await getStats();
      await api.sendMessage({ chat_id: chatId, text: formatStats(stats) });
      return;
    }
    if (text.startsWith('/broadcast')) {
      const body = text.slice('/broadcast'.length).trim();
      if (!body) {
        await api.sendMessage({
          chat_id: chatId,
          text: 'برای پیام همگانی، متن رو بعد از دستور بنویس:\n/broadcast سلام به همه 👋',
        });
        return;
      }
      if (body.length > 4096) {
        await api.sendMessage({ chat_id: chatId, text: 'متن پیام همگانی نمی‌تونه بیشتر از ۴۰۹۶ کاراکتر باشه.' });
        return;
      }
      await api.sendMessage({ chat_id: chatId, text: '📣 دارم پیام رو می‌فرستم…' });
      const result = await broadcast(body);
      await api.sendMessage({
        chat_id: chatId,
        text:
          '📣 پیام همگانی تموم شد.\n\n' +
          `کل کاربرا: ${fa(result.total)}\n` +
          `رسید: ${fa(result.sent)}\n` +
          `نرسید (بلاک/حذف): ${fa(result.failed)}`,
      });
      return;
    }
  }

  // Any other text: point back to the Mini App.
  await api.sendMessage({
    chat_id: chatId,
    text: 'برای ساخت متن استوری، مینی‌اپ رو باز کن 👇',
    reply_markup: {
      inline_keyboard: [[{ text: '🎨 باز کردن FontStory', web_app: { url: MINI_APP_URL } }]],
    },
  });
}
