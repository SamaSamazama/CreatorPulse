import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiKey, corsResponse, corsOptions } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { channels, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export async function OPTIONS() {
  return corsOptions();
}
export async function GET(req: NextRequest) {
  const { error, userId } = await validatePublicApiKey(req);
  if (error) return corsResponse(error, error.status);
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, userId!) });
  if (!userChannel) return corsResponse({ error: 'Channel not found' }, 404);
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, userChannel.id), orderBy: [desc(videos.publishedAt)], limit: 50 });
  return corsResponse({ videos: userVideos });
}
