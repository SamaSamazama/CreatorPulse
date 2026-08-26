import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, videos, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getValidYouTubeClient, fetchChannelAnalytics, fetchRecentVideos } from '@/lib/youtube/api';
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const forceSync = request.nextUrl.searchParams.get('sync') === 'true';
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId), with: { channels: true } });
  if (!dbUser || !dbUser.channels.length) return NextResponse.json({ channels: [], requiresOnboarding: true });
  const primaryChannel = dbUser.channels[0];
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
  return NextResponse.json({ channel: primaryChannel, videos: channelVideos, requiresOnboarding: false });
}
