import { api, InputFile, EndpointError } from 'sdk';

// Send the finished sticker PNG to the caller's private chat with the bot
// as a file, so they can open it and use Telegram's own "Save to Gallery".
// Why this exists: a Mini App running inside Telegram's WebView cannot
// trigger a browser file download (<a download> is ignored there, most
// visibly on iOS), so the reliable gallery path is bot -> chat -> save.
//
// Input: { image } — base64 PNG (no "data:image/png;base64," prefix),
//        { text }  — optional design text, used in the caption.
const MAX_BYTES = 5 * 1024 * 1024;

// Pure-JS base64 decode (no Buffer/atob dependency in the tgcloud runtime).
function b64decode(b64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Map([...chars].map((c, i) => [c, i]));
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes = [];
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup.get(clean[i]) ?? 0;
    const b = lookup.get(clean[i + 1]) ?? 0;
    const c = clean[i + 2] === '=' ? 0 : (lookup.get(clean[i + 2]) ?? 0);
    const d = clean[i + 3] === '=' ? 0 : (lookup.get(clean[i + 3]) ?? 0);
    bytes.push((a << 2) | (b >> 4));
    if (clean[i + 2] !== '=') bytes.push(((b & 15) << 4) | (c >> 2));
    if (clean[i + 3] !== '=') bytes.push(((c & 3) << 6) | d);
  }
  return new Uint8Array(bytes);
}

export default async function (input, ctx) {
  const user = ctx.initData?.user;
  if (!user?.id) {
    throw new EndpointError('No Telegram user in init data', { code: 'NO_USER' });
  }
  const b64 = typeof input?.image === 'string' ? input.image.trim() : '';
  if (!b64) {
    throw new EndpointError('Image is required', { code: 'EMPTY_IMAGE' });
  }
  if (b64.length > Math.ceil(MAX_BYTES * 4 / 3) + 16) {
    throw new EndpointError('Image is too large', { code: 'IMAGE_TOO_LARGE' });
  }
  const bytes = b64decode(b64);
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    throw new EndpointError('Image is too large or empty', { code: 'IMAGE_TOO_LARGE' });
  }
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (!(bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)) {
    throw new EndpointError('Image must be a PNG', { code: 'NOT_PNG' });
  }

  const text = typeof input?.text === 'string' ? input.text.trim().slice(0, 200) : '';
  const caption = text ? `استیکر FontStory\n${text}` : 'استیکر FontStory';
  await api.sendDocument({
    chat_id: user.id,
    document: new InputFile(bytes, 'fontstory.png', { type: 'image/png' }),
    caption,
  });
  return { ok: true };
}
