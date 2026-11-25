import { api } from 'sdk';
import { isAdmin, adminPanelMessage, backKeyboard, getStats, formatStats } from '../lib/admin.js';
import { normalizeLang, t } from '../lib/i18n.js';
import { setLanguage } from '../lib/users.js';
import { sendWelcome } from './message.js';

// Language picker + admin panel inline buttons.
export default async function (callbackQuery) {
  const from = callbackQuery.from;
  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data || '';

  // --- Language picker (every user): «lang:en» etc. Save the choice,
  // confirm in the NEW language, then send the welcome + Mini App
  // button + persistent keyboard in that language.
  if (data.startsWith('lang:')) {
    const lang = normalizeLang(data.slice('lang:'.length));
    await setLanguage(from.id, lang);
    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
      text: t(lang, 'languageSet'),
    });
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: t(lang, 'languageSet'),
    });
    await sendWelcome(chatId, lang, isAdmin(from));
    return;
  }

  if (!data.startsWith('admin:')) return;

  if (!isAdmin(from)) {
    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
      text: 'این دکمه فقط برای مدیره.',
    });
    return;
  }

  if (data === 'admin:stats') {
    await api.answerCallbackQuery({ callback_query_id: callbackQuery.id });
    const stats = await getStats();
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: formatStats(stats),
      reply_markup: backKeyboard(),
    });
    return;
  }

  if (data === 'admin:broadcast') {
    await api.answerCallbackQuery({ callback_query_id: callbackQuery.id });
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text:
        '📣 پیام همگانی\n\n' +
        'متن پیام رو بعد از دستور بنویس و بفرست:\n' +
        '/broadcast سلام به همه 👋\n\n' +
        'پیام به همه‌ی کاربرا فرستاده می‌شه.',
      reply_markup: backKeyboard(),
    });
    return;
  }

  if (data === 'admin:panel') {
    await api.answerCallbackQuery({ callback_query_id: callbackQuery.id });
    const panel = adminPanelMessage();
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: panel.text,
      reply_markup: panel.reply_markup,
    });
    return;
  }

  if (data === 'admin:exit') {
    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
      text: 'پنل بسته شد.',
    });
    // Delete the panel message; if Telegram refuses (e.g. too old),
    // replace it with a short closed note instead.
    try {
      await api.deleteMessage({ chat_id: chatId, message_id: messageId });
    } catch {
      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: '🛠 پنل مدیریت بسته شد.',
      });
    }
    return;
  }
}
