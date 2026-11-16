<p align="center">
  <img src="assets/fontstory-logo.webp" width="120" alt="FontStory logo">
</p>

<h1 align="center">FontStory</h1>

<p align="center">
  <b>متنت رو بنویس، فونت و استایلش رو انتخاب کن و به‌ صورت عکس شفاف برای استوری ذخیره کن</b>
</p>

<p align="center">
  <a href="https://t.me/FontStory_bot"><img src="https://img.shields.io/badge/Telegram-@FontStory__bot-26A5E4?logo=telegram" alt="Telegram Bot"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

## Try it

Open [@FontStory_bot](https://t.me/FontStory_bot) and send `/start`.

## Features

- 1️⃣ کاملا رایگان 🆓
- 2️⃣ بدون تبلیغات 📢
- 3️⃣ بدون ثبت نام 🤝
- 4️⃣ بدون عضویت اجباری 👤
- 5️⃣ بدون اشتراک 💵
- 6️⃣ بدون واترمارک‌ ❌
- 7️⃣ متن باز ✅
- 8️⃣ بر پایه فضای ابری تلگرام ☁️
- 9️⃣ فونت های پرمیوم ⭐️
- 🔟 پشتیبانی 🫂

## Admin panel (bot owner only)

The bot chat has an owner-only admin panel:

- `/admin` — panel with stats, broadcast and exit buttons
- `/stats` — users, designs and top fonts/styles
- `/broadcast <text>` — send a message to all users

The panel's **🚪 خروج از پنل** button closes it (the message is
deleted; if Telegram refuses, it is replaced with a short closed note).
It is also on the stats and broadcast screens, next to «بازگشت».

## Support inbox (users message the owner)

Users get a persistent, non-inline reply-keyboard button
**💬 پیام به پشتیبانی** (set on `/start`, under the chat input).
Tapping it asks them to write one message; that message is sent to
the owner, who answers by replying to it in the bot chat — the reply
goes back to the user. An **❌ انصراف** button cancels before sending.
Only text messages are relayed; anything else gets a «send text»
hint. The owner's copy carries the sender's name, handle and numeric
ID, and the link between the two messages is kept in the database
(`support_map`), with the ID in the message text as a fallback.

Only the Telegram user ID in `tgcloud/lib/owner.js` can use these
commands. That file is gitignored — create it locally with one line:

```
export const OWNER_ID = 123456789;
```

Put your numeric Telegram ID there (get it from @userinfobot).
Everyone else just gets the usual Mini App reply.

## Fonts

Three fonts in the live app are commercial, licensed fonts (IRANYekanXNoEn, IRAN, Yekan Bakh). Their files are **not in this repo** and never committed (see `.gitignore`) — the app loads them from its deployed static hosting. Cloning this repo gives you the code without them.

Out of the box, with no files needed:

- Vazir — UI + sticker font, via jsDelivr
- Vazirmatn, Lalezar, Estedad, Parastoo, Amiri — via Google Fonts

To use your own licensed fonts, drop the WOFF2 files into `web/fonts/`, add matching `@font-face` rules at the top of `web/styles.css`, and add an entry to `FONTS` in `web/app.js` (plus the allow-list in `tgcloud/endpoints/saveDesign.js`). Serve WOFF2 only — never commit or serve the original TTF/OTF files.

## Project structure

- `web/` — Mini App source (plain HTML/CSS/JS, no framework), RTL Persian UI
- `scripts/build.mjs` — copies `web/` → `dist/` and the logo to `dist/logo.webp`. `dist/` is what `tgcloud.jsonc` serves as the Mini App (`static.source = dist`, `spa: true`)
- `tgcloud/schema.js` — `users` and `designs` tables (no foreign keys — the platform forbids them)
- `tgcloud/lib/users.js` — `ensureUser(from)`: upsert on `tg_id`
- `tgcloud/handlers/message.js` — `/start` registers the user and replies in Persian with an inline button opening the Mini App
- `tgcloud/endpoints/` — `register`, `saveDesign`, `myDesigns`, `sendSticker` (receives the finished PNG as base64, max 5 MB, PNG magic checked, and sends it to the caller's private chat as `fontstory.png`)
- `assets/` — the v1 logo used by the build (white bold F on a violet-to-pink gradient)

## Deploy your own copy

1. In @BotFather: create a bot, open it → Serverless → turn it ON.
2. Copy the CLI access token (`app<id>:<secret>`) — different from the bot API token.
3. Locally:

   ```
   npm install
   npx tgcloud login
   npm run deploy        # build + push (push prints the Mini App URL)
   npx tgcloud migrate   # apply tgcloud/schema.js to the database
   ```

4. Paste the printed Mini App URL (`https://app<app_id>.tgcloud.ai/`) into `MINI_APP_URL` in `tgcloud/handlers/message.js` and push again. Also set the Mini App URL in BotFather (Bot Settings → Menu Button).
5. Open the bot in Telegram and send `/start`.

Deploying never touches the database — schema sync is the separate `npx tgcloud migrate` step.

## License

MIT — see [LICENSE](LICENSE). The font files are not part of this licence: use only fonts you are licensed to serve.
