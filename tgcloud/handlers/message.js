import { api } from 'sdk';
import { ensureUser } from '../lib/users.js';
import { isAdmin, adminPanelMessage, getStats, formatStats, broadcast, fa } from '../lib/admin.js';
import {
  SUPPORT_BUTTON,
  CANCEL_BUTTON,
  mainKeyboard,
  cancelKeyboard,
  setAwaiting,
  isAwaiting,
  clearAwaiting,
  lookupUser,
  parseUserId,
  forwardToOwner,
} from '../lib/support.js';

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
    // Users (not the owner) also get the persistent support button —
    // a reply keyboard, so it stays under the chat input.
    if (!isAdmin(from)) {
      await api.sendMessage({
        chat_id: chatId,
        text: 'اگه سوال یا مشکلی داشتی، از دکمه‌ی زیر به پشتیبانی پیام بده 👇',
        reply_markup: mainKeyboard(),
      });
    }
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
    // Owner answering a support message: reply to the owner's copy of
    // it in this chat and the text goes back to that user.
    const replied = message.reply_to_message;
    if (replied) {
      const targetId = (await lookupUser(replied.message_id)) || parseUserId(replied.text);
      if (targetId) {
        if (!text) {
          await api.sendMessage({ chat_id: chatId, text: 'پاسخ به کاربر باید متن باشه.' });
          return;
        }
        await api.sendMessage({ chat_id: targetId, text: '💬 پاسخ پشتیبانی:\n\n' + text });
        await api.sendMessage({ chat_id: chatId, text: '✅ پاسخ به کاربر ارسال شد.' });
        return;
      }
    }
  }

  // --- Support inbox (users only) ---
  if (!isAdmin(from)) {
    if (text === SUPPORT_BUTTON) {
      await setAwaiting(from.id);
      await api.sendMessage({
        chat_id: chatId,
        text: 'پیامت رو بنویس — مستقیم برای پشتیبانی ارسال می‌شه.',
        reply_markup: cancelKeyboard(),
      });
      return;
    }
    if (text === CANCEL_BUTTON) {
      await clearAwaiting(from.id);
      await api.sendMessage({
        chat_id: chatId,
        text: 'باشه، پیامت ارسال نشد.',
        reply_markup: mainKeyboard(),
      });
      return;
    }
    if (await isAwaiting(from.id)) {
      if (!text) {
        await api.sendMessage({ chat_id: chatId, text: 'لطفاً پیامت رو به صورت متن بفرست.' });
        return;
      }
      await forwardToOwner(from, text);
      await clearAwaiting(from.id);
      await api.sendMessage({
        chat_id: chatId,
        text: '✅ پیامت به پشتیبانی رسید — به‌زودی جواب می‌دیم.',
        reply_markup: mainKeyboard(),
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
