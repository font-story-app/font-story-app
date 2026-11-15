import { api } from 'sdk';
import { ensureUser } from '../lib/users.js';

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

  // Any other text: point back to the Mini App.
  await api.sendMessage({
    chat_id: chatId,
    text: 'برای ساخت متن استوری، مینی‌اپ رو باز کن 👇',
    reply_markup: {
      inline_keyboard: [[{ text: '🎨 باز کردن FontStory', web_app: { url: MINI_APP_URL } }]],
    },
  });
}
