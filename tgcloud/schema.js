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
  createdAt: integer('created_at').default(sql`(unixepoch())`),
}, (t) => ({
  userIdx: index('idx_designs_user').on(t.userId),
}));
