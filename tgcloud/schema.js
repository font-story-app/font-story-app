import { table, integer, real, text, index, sql } from 'sdk/db';

// FontStory — Persian story-font / text-styling Mini App.
// Users are registered on /start and on first Mini App open (register
// endpoint). Designs are the user's saved text styles.
// No foreign keys (platform forbids them): designs.user_id is a logical
// link to users.tg_id, enforced in application code.

export const users = table('users', {
  tgId: integer('tg_id').primaryKey(),
  username: text('username'),
  firstName: text('first_name'),
  languageCode: text('language_code'),
  // The user's chosen app/bot language (added 2026-11-25): 'en' |
  // 'fa' | 'zh' | 'ar' | 'ru'. Picked in the bot (language picker on
  // /start, or the «زبان» button); the Mini App reads it from the
  // register endpoint. NOT the same as language_code (Telegram's own
  // UI language) and never overwritten by it.
  language: text('language').notNull().default('fa'),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  lastSeenAt: integer('last_seen_at').default(sql`(unixepoch())`),
});

export const designs = table('designs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  text: text('text').notNull(),
  font: text('font').notNull().default('Vazirmatn'),
  style: text('style').notNull().default('bold'),
  color: text('color').notNull().default('#FFFFFF'),
  aspect: text('aspect').notNull().default('9:16'),
  // Text alignment (added 2026-11-17): center | right | left.
  align: text('align').notNull().default('center'),
  // Text settings (added 2026-11-15): weight, letter/word spacing (px),
  // line height (multiplier), X/Y rotation (degrees).
  weight: integer('weight').notNull().default(800),
  letterSpacing: real('letter_spacing').notNull().default(0),
  wordSpacing: real('word_spacing').notNull().default(0),
  lineHeight: real('line_height').notNull().default(1.4),
  rotX: real('rot_x').notNull().default(0),
  rotY: real('rot_y').notNull().default(0),
  // Style settings (added 2026-11-15): background/border colour of the
  // box styles, and the box's corner radius (px).
  styleColor: text('style_color').notNull().default('#F4D93E'),
  borderRadius: real('border_radius').notNull().default(18),
  // Per-style extras (added 2026-11-15): JSON object, e.g.
  // {"neonGlow": 60, "gradientC1": "#ff2e88"} — only keys the user
  // touched are stored; the front-end falls back to each default.
  styleParams: text('style_params').notNull().default('{}'),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
}, (t) => ({
  userIdx: index('idx_designs_user').on(t.userId),
}));

// Support inbox (added 2026-11-16): a user taps the reply-keyboard
// «پیام به پشتیبانی» button, writes one message, it is sent to the
// owner; the owner answers by replying to that message in the bot chat.
// support_pending tracks who is mid-message; support_map links the
// owner's copy of a support message back to the user who sent it.
export const supportPending = table('support_pending', {
  tgId: integer('tg_id').primaryKey(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

export const supportMap = table('support_map', {
  ownerMsgId: integer('owner_msg_id').primaryKey(),
  userId: integer('user_id').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
});

// Broadcasts (added 2026-11-26 — the batched rework): a /broadcast no
// longer sends synchronously in the webhook handler (with 948 users
// that takes minutes and the platform kills the handler mid-loop,
// leaving the «sending…» message stuck forever and only the first
// users reached — exactly what happened 2026-11-26). Instead the
// command creates a JOB and the work runs in short batches
// (25 users, 8 parallel lanes, 20 s budget per invocation), with
// the cursor checkpointed after every batch; the owner resumes
// with the «ادامه» button if an invocation runs out of budget.
// text = the message; total = users at creation; sent/failed =
// confirmed counts; cursor = last processed tg_id (NULL = not
// started); status = 'running' | 'done'.
export const broadcasts = table('broadcasts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  total: integer('total').notNull(),
  sent: integer('sent').notNull().default(0),
  failed: integer('failed').notNull().default(0),
  cursor: integer('cursor'),
  status: text('status').notNull().default('running'),
  createdAt: integer('created_at').default(sql`(unixepoch())`),
  finishedAt: integer('finished_at'),
});
