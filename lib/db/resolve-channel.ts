import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns the requested channel if it belongs to the user, otherwise the user's first channel
 * when no channelId was sent (pages without a channel picker POST `channelId: ''`).
 * Returns undefined for an invalid/foreign channelId or when the user has no channels.
 */
export async function resolveUserChannel(dbUserId: string, channelId: unknown) {
  if (channelId) {
    if (typeof channelId !== 'string' || !UUID_REGEX.test(channelId)) return undefined;
    return db.query.channels.findFirst({ where: and(eq(channels.id, channelId), eq(channels.userId, dbUserId)) });
  }
  return db.query.channels.findFirst({ where: eq(channels.userId, dbUserId) });
}
