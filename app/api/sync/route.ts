import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { channels, videos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getValidYouTubeClient, fetchChannelAnalytics, fetchRecentVideos } from '@/lib/youtube/api';
import { getUserIdFromRequest, corsResponse, corsOptions } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return corsOptions(origin);
}
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  try {
    const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, userId) });
    const results = [];
    for (const channel of userChannels) {
      try {
        const youtube = await getValidYouTubeClient(channel.id);
        const [ytChannelData, ytVideos] = await Promise.all([fetchChannelAnalytics(youtube), fetchRecentVideos(youtube, 20)]);
        if (ytChannelData) {
          await db.update(channels).set({ subscriberCount: parseInt(ytChannelData.statistics?.subscriberCount || '0'), viewCount: parseInt(ytChannelData.statistics?.viewCount || '0'), lastSyncedAt: new Date() }).where(eq(channels.id, channel.id));
        }
        for (const vid of ytVideos) {
          await db.insert(videos).values({ channelId: channel.id, platformVideoId: vid.id, title: vid.snippet.title, publishedAt: new Date(vid.snippet.publishedAt), viewCount: parseInt(vid.statistics?.viewCount || '0'), likeCount: parseInt(vid.statistics?.likeCount || '0'), commentCount: parseInt(vid.statistics?.commentCount || '0'), thumbnailUrl: vid.snippet.thumbnails?.high?.url, lastSyncedAt: new Date() }).onConflictDoUpdate({ target: videos.platformVideoId, set: { viewCount: parseInt(vid.statistics?.viewCount || '0'), lastSyncedAt: new Date() } });
        }
        results.push({ channelId: channel.id, status: 'success' });
      } catch (error) { results.push({ channelId: channel.id, status: 'error', error: String(error) }); }
    }
    return corsResponse({ synced: results }, 200, request.headers.get('origin') || '');
  } catch (error) {
    return corsResponse({ error: 'Sync failed' }, 500, request.headers.get('origin') || '');
  }
}
export async function GET() {
  return corsResponse({ endpoint: '/api/sync', method: 'POST', description: 'Trigger sync for all channels' }, 200, '');
}