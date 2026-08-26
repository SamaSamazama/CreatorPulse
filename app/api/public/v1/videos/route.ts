import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiKey } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { channels, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export async function GET(req: NextRequest) {
  const { error, userId } = await validatePublicApiKey(req);
  if (error) return error;
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, userId!) });
  if (!userChannel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  return NextResponse.json({ videos: await db.query.videos.findMany({ where: eq(videos.channelId, userChannel.id), orderBy: [desc(videos.publishedAt)], limit: 50 }) });
}
