import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiKey, corsResponse, corsOptions } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { channels, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return corsOptions(origin);
}
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const { error, userId } = await validatePublicApiKey(request);
  if (error) return corsResponse(error, error.status, origin);
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, userId!) });
  if (!userChannel) return corsResponse({ error: 'Channel not found' }, 404, origin);
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, userChannel.id), orderBy: [desc(videos.publishedAt)], limit: 50 });
  return corsResponse({ videos: userVideos }, 200, origin);
}
