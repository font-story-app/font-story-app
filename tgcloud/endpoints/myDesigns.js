import { db, EndpointError } from 'sdk';
import { eq, desc } from 'sdk/db';
import { designs } from '../schema.js';
import { ensureUser } from '../lib/users.js';

// Return the caller's last 20 designs, newest first.
export default async function (_input, ctx) {
  const user = ctx.initData?.user;
  if (!user?.id) {
    throw new EndpointError('No Telegram user in init data', { code: 'NO_USER' });
  }
  await ensureUser(user);
  const rows = await db
    .select()
    .from(designs)
    .where(eq(designs.userId, user.id))
    .orderBy(desc(designs.createdAt), desc(designs.id))
    .limit(20)
    .all();
  return {
    ok: true,
    designs: rows.map((r) => ({
      id: r.id,
      text: r.text,
      font: r.font,
      style: r.style,
      color: r.color,
      aspect: r.aspect,
      weight: r.weight,
      letterSpacing: r.letterSpacing,
      wordSpacing: r.wordSpacing,
      lineHeight: r.lineHeight,
      rotX: r.rotX,
      rotY: r.rotY,
      styleColor: r.styleColor,
      borderRadius: r.borderRadius,
      styleParams: (() => { try { return JSON.parse(r.styleParams || '{}'); } catch { return {}; } })(),
      created_at: r.createdAt,
    })),
  };
}
