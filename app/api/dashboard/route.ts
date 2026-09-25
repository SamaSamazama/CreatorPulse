// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, videos, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { fetchChannelAnalytics, fetchRecentVideos } from '@/lib/youtube/api';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const forceSync = request.nextUrl.searchParams.get('sync') === 'true';
  const channelId = request.nextUrl.searchParams.get('channelId');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string), with: { channels: true } });
  if (!dbUser || !dbUser.channels.length) return NextResponse.json({ channels: [], requiresOnboarding: true });
  const primaryChannel = channelId ? dbUser.channels.find((c: any) => c.id === channelId) : dbUser.channels[0];
  if (!primaryChannel) return NextResponse.json({ channels: dbUser.channels, requiresOnboarding: true, selectedChannelId: null });
  if (forceSync) {
    try {
      const youtube = await getValidYouTubeClient(primaryChannel.id);
      const [ytChannelData, ytVideos] = await Promise.all([fetchChannelAnalytics(youtube), fetchRecentVideos(youtube, 20)]);
      if (ytChannelData) {
        await db.update(channels).set({ subscriberCount: parseInt(ytChannelData.statistics?.subscriberCount || '0'), viewCount: parseInt(ytChannelData.statistics?.viewCount || '0'), lastSyncedAt: new Date() }).where(eq(channels.id, primaryChannel.id));
      }
      for (const vid of ytVideos) {
        await db.insert(videos).values({ channelId: primaryChannel.id, platformVideoId: vid.id, title: vid.snippet.title, publishedAt: new Date(vid.snippet.publishedAt), viewCount: parseInt(vid.statistics?.viewCount || '0'), likeCount: parseInt(vid.statistics?.likeCount || '0'), commentCount: parseInt(vid.statistics?.commentCount || '0'), thumbnailUrl: vid.snippet.thumbnails?.high?.url, lastSyncedAt: new Date() }).onConflictDoUpdate({ target: videos.platformVideoId, set: { viewCount: parseInt(vid.statistics?.viewCount || '0'), lastSyncedAt: new Date() } });
      }
    } catch (error) { console.error('Sync error:', error); }
  }
  const channelVideos = await db.query.videos.findMany({ where: eq(videos.channelId, primaryChannel.id), orderBy: [desc(videos.publishedAt)], limit: 20 });
  return NextResponse.json({ channel: primaryChannel, channels: dbUser.channels, videos: channelVideos, requiresOnboarding: false });
}
