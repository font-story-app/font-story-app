# FontStory — فونت استوری فارسی

A Telegram Mini App for Persian story-font / text styling, running on
[Telegram Serverless](https://telegram.org/blog/telegram-serverless) (tgcloud).
Type → pick a font, style and colour → export a transparent PNG sticker.
No watermark, no login, no forced channel-join.

- **Live Mini App:** https://app9160164486.tgcloud.ai/
- **Bot:** [@FontStory_bot](https://t.me/FontStory_bot) — send `/start`

Inspired by [Poufi](https://app.poufi.ir) (fast single-text editor) and
[FontWoW](https://fontwow.github.io) (layer settings: weight, letter/word
spacing, line height, X/Y rotation).

## Features

- Live canvas preview — the text IS the preview, tap it to type
- 9 fonts, 30 text styles, 6 colour presets + custom picker
- Text settings: font weight, letter spacing, word spacing, line height,
  horizontal / vertical rotation
- 9:16 story and 1:1 square export, 4 gradient backgrounds
- Transparent PNG export: copy to clipboard (Instagram / Telegram /
  WhatsApp) or save to gallery (sent through the bot chat inside Telegram,
  because the in-app WebView ignores `<a download>`)
- Save designs as templates, reopen them later from recents

## Fonts

Three of the fonts in the live app are **commercial, licensed fonts**
(IRANYekanXNoEn, IRAN, Yekan Bakh) — their files are **not in this repo**
and are never committed (see `.gitignore`). The app loads them from the
deployed static hosting; cloning this repo gives you the code without them.

These work out of the box with no files:

- Vazir (UI + sticker font, via jsDelivr)
- Vazirmatn, Lalezar, Estedad, Parastoo, Amiri (via Google Fonts)

To use your own licensed fonts, drop the WOFF2 files into `web/fonts/`,
add matching `@font-face` rules at the top of `web/styles.css`, and add an
entry to `FONTS` in `web/app.js` (and to the allow-list in
`tgcloud/endpoints/saveDesign.js`). Serve WOFF2 only — never commit or
serve the original TTF/OTF files.

Liana (Poufi's default) is a commercial FontIran font with no public CDN,
so it is deliberately not included.

## Layout

- `web/` — Mini App source (plain HTML/CSS/JS, no framework), RTL Persian UI
- `scripts/build.mjs` — copies `web/` → `dist/` and the logo to
  `dist/logo.webp`. `dist/` is what `tgcloud.jsonc` serves as the Mini App
  (`static.source = dist`, `spa: true`)
- `tgcloud/schema.js` — `users` and `designs` tables (no foreign keys —
  the platform forbids them)
- `tgcloud/lib/users.js` — `ensureUser(from)`: upsert on `tg_id`
- `tgcloud/handlers/message.js` — `/start` registers the user and replies
  in Persian with an inline button opening the Mini App
- `tgcloud/endpoints/` — `register`, `saveDesign`, `myDesigns`,
  `sendSticker` (receives the finished PNG as base64, max 5 MB, PNG magic
  checked, and sends it to the caller's private chat as `fontstory.png`)
- `assets/` — the v1 logo used by the build (white bold F on a
  violet-to-pink gradient)

## Deploy your own copy

1. In @BotFather: create a bot, open it → Serverless → turn it ON.
2. Copy the CLI access token (`app<id>:<secret>`) — different from the
   bot API token.
3. Locally:

   ```
   npm install
   npx tgcloud login
   npm run deploy        # build + push (push prints the Mini App URL)
   npx tgcloud migrate   # apply tgcloud/schema.js to the database
   ```

4. Paste the printed Mini App URL (`https://app<app_id>.tgcloud.ai/`)
   into `MINI_APP_URL` in `tgcloud/handlers/message.js` and push again.
   Also set the Mini App URL in BotFather (Bot Settings → Menu Button).
5. Open the bot in Telegram and send `/start`.

Deploying never touches the database — schema sync is the separate
`npx tgcloud migrate` step.

## License

MIT — see [LICENSE](LICENSE). The font files are not part of this licence:
use only fonts you are licensed to serve.
