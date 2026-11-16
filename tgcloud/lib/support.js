import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { supportPending, supportMap } from '../schema.js';
import { OWNER_ID } from './owner.js';

// Support inbox — users message the owner (support) through a
// non-inline reply-keyboard button, and the owner answers by replying
// to the forwarded message in the bot chat.
//
// Flow:
//   1. User taps «💬 پیام به پشتیبانی» (persistent reply keyboard, set
//      on /start) -> they are marked "awaiting" and get a prompt with
//      an «❌ انصراف» button.
//   2. Their next text message is sent to the owner as one composed
//      message (name, handle, numeric id, text) and the owner's copy
//      is mapped back to them in support_map.
//   3. The owner replies to that message in the bot chat; the reply
//      text is delivered to the user. The numeric id is also in the
//      message text, so the reply still works if the map row is gone.

export const SUPPORT_BUTTON = '💬 پیام به پشتیبانی';
export const CANCEL_BUTTON = '❌ انصراف';

// Persistent reply keyboard shown to users (not the owner).
export function mainKeyboard() {
  return {
    keyboard: [[{ text: SUPPORT_BUTTON }]],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export function cancelKeyboard() {
  return {
    keyboard: [[{ text: CANCEL_BUTTON }]],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export async function setAwaiting(tgId) {
  if (await isAwaiting(tgId)) return;
  await db.insert(supportPending).values({ tgId }).run();
}

export async function isAwaiting(tgId) {
  const row = await db.select().from(supportPending).where(eq(supportPending.tgId, tgId)).get();
  return !!row;
}

export async function clearAwaiting(tgId) {
  await db.delete(supportPending).where(eq(supportPending.tgId, tgId)).run();
}

export async function mapOwnerMessage(ownerMsgId, userId) {
  await db.insert(supportMap).values({ ownerMsgId, userId }).run();
}

export async function lookupUser(ownerMsgId) {
  const row = await db.select().from(supportMap).where(eq(supportMap.ownerMsgId, ownerMsgId)).get();
  return row?.userId ?? null;
}

// Fallback when the map row is missing: the owner's copy carries the
// sender's numeric id in its «👤 … — <id>» line.
export function parseUserId(text) {
  const m = /— (\d+)\n/.exec(text || '');
  return m ? Number(m[1]) : null;
}

export function formatSupportMessage(from, text) {
  const name = from.first_name || 'کاربر';
  const handle = from.username ? ` (@${from.username})` : '';
  const body = (text || '').slice(0, 3800);
  return (
    '📩 پیام پشتیبانی\n\n' +
    `👤 ${name}${handle} — ${from.id}\n\n` +
    body +
    '\n\n— برای پاسخ، روی همین پیام Reply بزن.'
  );
}

// Send the user's message to the owner and remember which owner-side
// message belongs to them, so the owner's reply finds its way back.
export async function forwardToOwner(from, text) {
  const sent = await api.sendMessage({
    chat_id: OWNER_ID,
    text: formatSupportMessage(from, text),
  });
  const ownerMsgId = sent?.message_id ?? sent?.result?.message_id;
  if (ownerMsgId) await mapOwnerMessage(ownerMsgId, from.id);
  return sent;
}
