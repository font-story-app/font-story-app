<div align="center">

<img src="assets/fontstory-logo.webp" alt="FontStory logo" width="120" />

# FontStory

**Type your text, pick a font and style, and save it as a transparent image for your Stories.**

**متنت رو بنویس، فونت و استایلش رو انتخاب کن و به‌صورت عکس شفاف برای استوری ذخیره کن**

[![Telegram Bot](https://img.shields.io/badge/Telegram-@FontStory__bot-26A5E4?logo=telegram)](https://t.me/FontStory_bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**Try it on Telegram →**](https://t.me/FontStory_bot)

</div>

---

## What is FontStory?

FontStory is a Telegram bot with a Mini App that turns any text into a styled, **transparent PNG** you can drop straight onto an Instagram Story (or any other editor). Pick a Persian-friendly font, tweak the style, and the finished image is sent to your private chat with the bot.

It is free, open source, and runs entirely on Telegram's cloud: no accounts, no ads, no watermarks.

## Try it

1. Open [@FontStory_bot](https://t.me/FontStory_bot)
2. Send `/start`
3. Tap the button to open the Mini App, write your text, choose a font and style, and save

## Features

| | |
|---|---|
| 🆓 Completely free | 📢 No ads |
| 🤝 No sign-up | 👤 No forced channel membership |
| 💵 No subscription | ❌ No watermark |
| ✅ Open source | ☁️ Built on Telegram's cloud |
| ⭐️ Premium fonts | 🫂 Built-in support |

## Project structure

```
.
├── web/                  # Mini App source: plain HTML/CSS/JS, no framework, RTL Persian UI
├── scripts/
│   └── build.mjs         # Copies web/ → dist/ and the logo → dist/logo.webp
├── tgcloud/
│   ├── schema.js         # `users` and `designs` tables (no foreign keys, the platform forbids them)
│   ├── lib/users.js      # ensureUser(from): upsert on tg_id
│   ├── handlers/
│   │   └── message.js    # /start registers the user and replies in Persian with a Mini App button
│   └── endpoints/        # register, saveDesign, myDesigns, sendSticker
├── assets/               # v1 logo (white bold "F" on a violet-to-pink gradient)
└── tgcloud.jsonc         # Deployment config; serves dist/ as the Mini App (spa: true)
```

**`sendSticker`** receives the finished PNG as base64 (max 5 MB, PNG magic bytes verified) and sends it to the caller's private chat as `fontstory.png`.

## Fonts

Three fonts in the live app are commercial, licensed fonts: **IRANYekanXNoEn**, **IRAN**, and **Yekan Bakh**. Their files are **not included in this repo** (they are listed in `.gitignore` and must never be committed). The live app loads them from its own static hosting, so cloning the repo gives you the code without them.

These work out of the box, with no extra files:

| Font | Source |
|---|---|
| Vazir (UI + sticker font) | jsDelivr |
| Vazirmatn, Lalezar, Estedad, Parastoo, Amiri | Google Fonts |

### Adding your own licensed fonts

1. Put the **WOFF2** files in `web/fonts/`
2. Add matching `@font-face` rules at the top of `web/styles.css`
3. Add an entry to `FONTS` in `web/app.js`
4. Add the font to the allow-list in `tgcloud/endpoints/saveDesign.js`

> Serve WOFF2 only. Never commit or serve the original TTF/OTF files.

## Deploy your own copy

1. In [@BotFather](https://t.me/BotFather), create a bot, open it, go to **Serverless**, and turn it **ON**.
2. Copy the CLI access token (`app<id>:<secret>`). It is different from the regular bot API token.
3. Install, log in, and deploy:

   ```bash
   npm install
   npx tgcloud login
   npm run deploy        # build + push (prints the Mini App URL)
   npx tgcloud migrate   # apply tgcloud/schema.js to the database
   ```

4. Paste the printed Mini App URL (`https://app<app_id>.tgcloud.ai/`) into `MINI_APP_URL` in `tgcloud/handlers/message.js` and push again. Also set it in BotFather under **Bot Settings → Menu Button**.
5. Open your bot in Telegram and send `/start`.

> Deploying never touches the database. Schema sync is the separate `npx tgcloud migrate` step.

## Admin tools (bot owner only)

Only the Telegram user ID configured in `tgcloud/lib/owner.js` can use the admin features. Everyone else just gets the usual Mini App reply.

That file is gitignored. Create it locally with one line (get your numeric ID from [@userinfobot](https://t.me/userinfobot)):

```js
export const OWNER_ID = 123456789;
```

### Admin panel

| Command | What it does |
|---|---|
| `/admin` | Opens the panel with stats, broadcast, and exit buttons |
| `/stats` | Shows users, designs, and top fonts/styles |
| `/broadcast <text>` | Sends a message to all users |

The **🚪 خروج از پنل** button closes the panel by deleting its message (if Telegram refuses, it is replaced with a short "closed" note). It also appears on the stats and broadcast screens, next to «بازگشت».

### Support inbox

Users get a persistent reply-keyboard button, **💬 پیام به پشتیبانی**, set on `/start` under the chat input.

1. The user taps it and writes a single message (**❌ انصراف** cancels).
2. The message is forwarded to the owner, with the sender's name, handle, and numeric ID.
3. The owner replies to that message in the bot chat, and the reply goes back to the user.

Only text messages are relayed; anything else gets a "send text" hint. The link between the two messages is stored in the database (`support_map`), with the user ID in the message text as a fallback.

## License

[MIT](LICENSE). The font files are **not** covered by this license: use only fonts you are licensed to serve.
