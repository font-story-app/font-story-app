import { db, EndpointError } from 'sdk';
import { eq } from 'sdk/db';
import { designs } from '../schema.js';

// Delete one of the caller's saved designs. Only the design's owner can
// delete it; anything else is NOT_FOUND (no info leak about other
// users' designs).
export default async function (input, ctx) {
  const user = ctx.initData?.user;
  if (!user?.id) {
    throw new EndpointError('No Telegram user in init data', { code: 'NO_USER' });
  }
  const id = Number(input?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new EndpointError('A valid design id is required', { code: 'BAD_ID' });
  }
  const row = await db.select().from(designs).where(eq(designs.id, id)).get();
  if (!row || row.userId !== user.id) {
    throw new EndpointError('Design not found', { code: 'NOT_FOUND' });
  }
  await db.delete(designs).where(eq(designs.id, id)).run();
  return { ok: true, id };
}
