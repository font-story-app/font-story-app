import { api } from 'sdk';
import { ensureUser, getLanguage } from '../lib/users.js';
import { isAdmin, adminPanelMessage, getStats, formatStats, createBroadcast, getRunningBroadcast, getBroadcast, runBroadcast, finishBroadcast, broadcastProgressText, broadcastSummaryText, broadcastResumeKeyboard } from '../lib/admin.js';
import { t, languageKeyboard } from '../lib/i18n.js';
import {
  SUPPORT_BUTTONS,
  LANGUAGE_BUTTONS,
  CANCEL_BUTTONS,
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

// The welcome + Mini App button + persistent keyboard, in the user's
// language. Sent right after a language is picked (or re-picked).
async function sendWelcome(chatId, lang, isOwner) {
  await api.sendMessage({
    chat_id: chatId,
    text: t(lang, 'welcome'),
    reply_markup: {
      inline_keyboard: [[{ text: t(lang, 'openApp'), web_app: { url: MINI_APP_URL } }]],
    },
  });
  // Users (not the owner) also get the persistent support + language
  // buttons — a reply keyboard, so they stay under the chat input.
  if (!isOwner) {
    await api.sendMessage({
      chat_id: chatId,
      text: t(lang, 'supportHint'),
      reply_markup: mainKeyboard(lang),
    });
  }
}

export default async function (message) {
  if (message.chat?.type && message.chat.type !== 'private') return;
  const chatId = message.chat.id;
  const from = message.from;
  if (!from?.id) return;

  const user = await ensureUser(from);
  const lang = user?.language || 'fa';

  const text = message.text || '';

  // /start (with or without args) — first asks the language, in
  // English (Reza's ask, 2026-11-25): the picker lists all five
  // languages, each in its own wording. The welcome follows once the
  // user picks (handled in callback_query.js).
  if (text.startsWith('/start')) {
    await api.sendMessage({
      chat_id: chatId,
      text: t('en', 'pickLanguage'),
      reply_markup: languageKeyboard(),
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
      // A job may already be running (an earlier /broadcast that ran
      // out of its time budget) — show its progress instead of
      // starting a second one; the same text would otherwise go out
      // twice to the early users.
      let job = await getRunningBroadcast();
      if (job) {
        await api.sendMessage({
          chat_id: chatId,
          text: broadcastProgressText(job) + '\n\nیک پیام همگانی دیگه در حال ارساله — اول اون تموم بشه.',
          reply_markup: broadcastResumeKeyboard(job),
        });
        return;
      }
      job = await createBroadcast(body);
      // The progress message goes out first, then batches run inside
      // a 20 s budget; the message is edited at the end with either
      // the summary or the progress + «ادامه ارسال» button.
      const progress = await api.sendMessage({
        chat_id: chatId,
        text: broadcastProgressText(job),
      });
      const result = await runBroadcast(job);
      const fresh = (await getBroadcast(job.id)) || result.job;
      if (result.done) {
        await finishBroadcast(fresh);
        const done = (await getBroadcast(job.id)) || fresh;
        await api.editMessageText({
          chat_id: chatId,
          message_id: progress.message_id,
          text: broadcastSummaryText(done),
        });
      } else {
        await api.editMessageText({
          chat_id: chatId,
          message_id: progress.message_id,
          text: broadcastProgressText(fresh),
          reply_markup: broadcastResumeKeyboard(fresh),
        });
      }
      return;
    }
    // Owner answering a support message: reply to the owner's copy of
    // it in this chat and the text goes back to that user, with the
    // prefix in the USER's language.
    const replied = message.reply_to_message;
    if (replied) {
      const targetId = (await lookupUser(replied.message_id)) || parseUserId(replied.text);
      if (targetId) {
        if (!text) {
          await api.sendMessage({ chat_id: chatId, text: 'پاسخ به کاربر باید متن باشه.' });
          return;
        }
        const targetLang = await getLanguage(targetId);
        await api.sendMessage({ chat_id: targetId, text: t(targetLang, 'supportReplyPrefix') + text });
        await api.sendMessage({ chat_id: chatId, text: '✅ پاسخ به کاربر ارسال شد.' });
        return;
      }
    }
  }

  // --- Support inbox + language button (users only) ---
  if (!isAdmin(from)) {
    // The language button re-opens the picker (in English, like
    // /start). Any half-written support message is dropped.
    if (LANGUAGE_BUTTONS.includes(text)) {
      await clearAwaiting(from.id);
      await api.sendMessage({
        chat_id: chatId,
        text: t('en', 'pickLanguage'),
        reply_markup: languageKeyboard(),
      });
      return;
    }
    if (SUPPORT_BUTTONS.includes(text)) {
      await setAwaiting(from.id);
      await api.sendMessage({
        chat_id: chatId,
        text: t(lang, 'supportPrompt'),
        reply_markup: cancelKeyboard(lang),
      });
      return;
    }
    if (CANCEL_BUTTONS.includes(text)) {
      await clearAwaiting(from.id);
      await api.sendMessage({
        chat_id: chatId,
        text: t(lang, 'supportCancelled'),
        reply_markup: mainKeyboard(lang),
      });
      return;
    }
    if (await isAwaiting(from.id)) {
      if (!text) {
        await api.sendMessage({ chat_id: chatId, text: t(lang, 'supportTextOnly') });
        return;
      }
      await forwardToOwner(from, text);
      await clearAwaiting(from.id);
      await api.sendMessage({
        chat_id: chatId,
        text: t(lang, 'supportSent'),
        reply_markup: mainKeyboard(lang),
      });
      return;
    }
  }

  // Any other text: point back to the Mini App, in the user's language.
  await api.sendMessage({
    chat_id: chatId,
    text: t(lang, 'openAppPointer'),
    reply_markup: {
      inline_keyboard: [[{ text: t(lang, 'openApp'), web_app: { url: MINI_APP_URL } }]],
    },
  });
}

// Shared by the language callback: exported for callback_query.js.
export { sendWelcome };
