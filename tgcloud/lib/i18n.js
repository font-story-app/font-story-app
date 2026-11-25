// Multilingual bot strings (added 2026-11-25, Reza's ask): the bot
// and the Mini App both speak the user's chosen language — English,
// Persian, Chinese, Arabic or Russian. The language picker itself is
// always in English (his ask): the user picks before anything else.
// Admin messages stay Persian — the owner is Reza.
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export function normalizeLang(code) {
  return LANGUAGES.some((l) => l.code === code) ? code : 'fa';
}

// Inline keyboard for the language picker: one button per language,
// each labelled in its own language (plus flag), so the choice is
// readable no matter which language the user speaks.
export function languageKeyboard() {
  return {
    inline_keyboard: LANGUAGES.map((l) => [{ text: `${l.flag} ${l.name}`, callback_data: `lang:${l.code}` }]),
  };
}

export const STRINGS = {
  en: {
    // The picker prompt is English for everyone (Reza's ask).
    pickLanguage: '🌐 Please choose your language:',
    languageSet: '✅ Language set to English.',
    welcome:
      '✨ Welcome to FontStory!\n\n' +
      'Write your text, pick a font and a style, and save or copy it as a transparent image for your story — no watermark, no sign-up.',
    openApp: '🎨 Open FontStory',
    supportHint: 'If you have a question or a problem, message support with the button below 👇',
    supportButton: '💬 Message to support',
    languageButton: '🌐 Language',
    cancelButton: '❌ Cancel',
    supportPrompt: 'Write your message — it will be sent straight to support.',
    supportCancelled: 'OK, your message was not sent.',
    supportTextOnly: 'Please send your message as text.',
    supportSent: '✅ Your message reached support — we will reply soon.',
    supportReplyPrefix: '💬 Support reply:\n\n',
    openAppPointer: 'To create a story text, open the Mini App 👇',
  },
  fa: {
    pickLanguage: '🌐 Please choose your language:',
    languageSet: '✅ زبان روی فارسی تنظیم شد.',
    welcome:
      '✨ به FontStory خوش اومدی!\n\n' +
      'متنت رو بنویس، فونت و استایلش رو انتخاب کن و به‌صورت عکس شفاف برای استوری ذخیره یا کپی کن — بدون واترمارک، بدون ثبت‌نام.',
    openApp: '🎨 باز کردن FontStory',
    supportHint: 'اگه سوال یا مشکلی داشتی، از دکمه‌ی زیر به پشتیبانی پیام بده 👇',
    supportButton: '💬 پیام به پشتیبانی',
    languageButton: '🌐 زبان',
    cancelButton: '❌ انصراف',
    supportPrompt: 'پیامت رو بنویس — مستقیم برای پشتیبانی ارسال می‌شه.',
    supportCancelled: 'باشه، پیامت ارسال نشد.',
    supportTextOnly: 'لطفاً پیامت رو به صورت متن بفرست.',
    supportSent: '✅ پیامت به پشتیبانی رسید — به‌زودی جواب می‌دیم.',
    supportReplyPrefix: '💬 پاسخ پشتیبانی:\n\n',
    openAppPointer: 'برای ساخت متن استوری، مینی‌اپ رو باز کن 👇',
  },
  zh: {
    pickLanguage: '🌐 Please choose your language:',
    languageSet: '✅ 语言已设置为中文。',
    welcome:
      '✨ 欢迎使用 FontStory！\n\n' +
      '输入文字，选择字体和样式，即可保存或复制为透明图片用于动态——无水印，无需注册。',
    openApp: '🎨 打开 FontStory',
    supportHint: '如有问题，请点击下方按钮联系客服 👇',
    supportButton: '💬 联系客服',
    languageButton: '🌐 语言',
    cancelButton: '❌ 取消',
    supportPrompt: '请写下您的消息——将直接发送给客服。',
    supportCancelled: '好的，您的消息未发送。',
    supportTextOnly: '请以文字形式发送您的消息。',
    supportSent: '✅ 您的消息已送达客服——我们会尽快回复。',
    supportReplyPrefix: '💬 客服回复：\n\n',
    openAppPointer: '要制作动态文字，请打开小程序 👇',
  },
  ar: {
    pickLanguage: '🌐 Please choose your language:',
    languageSet: '✅ تم تعيين اللغة إلى العربية.',
    welcome:
      '✨ أهلاً بك في FontStory!\n\n' +
      'اكتب نصك، واختر الخط والنمط، واحفظه أو انسخه كصورة شفافة لقصتك — بدون علامة مائية وبدون تسجيل.',
    openApp: '🎨 فتح FontStory',
    supportHint: 'إذا كان لديك سؤال أو مشكلة، راسل الدعم بالزر أدناه 👇',
    supportButton: '💬 مراسلة الدعم',
    languageButton: '🌐 اللغة',
    cancelButton: '❌ إلغاء',
    supportPrompt: 'اكتب رسالتك — ستُرسل مباشرة إلى الدعم.',
    supportCancelled: 'حسناً، لم تُرسل رسالتك.',
    supportTextOnly: 'يرجى إرسال رسالتك كنص.',
    supportSent: '✅ وصلت رسالتك إلى الدعم — سنرد عليك قريباً.',
    supportReplyPrefix: '💬 رد الدعم:\n\n',
    openAppPointer: 'لإنشاء نص قصة، افتح التطبيق المصغر 👇',
  },
  ru: {
    pickLanguage: '🌐 Please choose your language:',
    languageSet: '✅ Язык установлен: русский.',
    welcome:
      '✨ Добро пожаловать в FontStory!\n\n' +
      'Напишите текст, выберите шрифт и стиль и сохраните или скопируйте его как прозрачное изображение для сторис — без водяного знака и регистрации.',
    openApp: '🎨 Открыть FontStory',
    supportHint: 'Если есть вопрос или проблема, напишите в поддержку кнопкой ниже 👇',
    supportButton: '💬 Сообщение в поддержку',
    languageButton: '🌐 Язык',
    cancelButton: '❌ Отмена',
    supportPrompt: 'Напишите сообщение — оно сразу уйдёт в поддержку.',
    supportCancelled: 'Хорошо, сообщение не отправлено.',
    supportTextOnly: 'Пожалуйста, отправьте сообщение текстом.',
    supportSent: '✅ Ваше сообщение дошло до поддержки — скоро ответим.',
    supportReplyPrefix: '💬 Ответ поддержки:\n\n',
    openAppPointer: 'Чтобы создать текст для сторис, откройте мини-приложение 👇',
  },
};

// Look a bot string up in the user's language; unknown codes and
// missing keys fall back to Persian, then English, then the key.
export function t(lang, key) {
  const l = normalizeLang(lang);
  return STRINGS[l][key] ?? STRINGS.fa[key] ?? STRINGS.en[key] ?? key;
}
