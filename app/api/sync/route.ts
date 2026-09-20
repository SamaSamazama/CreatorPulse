import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { channels, videos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getValidYouTubeClient, fetchChannelAnalytics, fetchRecentVideos } from '@/lib/youtube/api';
export const dynamic = 'force-dynamic';
export async function POST() {
  try {
    const allChannels = await db.query.channels.findMany();
    const results = [];
    for (const channel of allChannels) {
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
    return NextResponse.json({ synced: results });
  } catch (error) { return NextResponse.json({ error: 'Sync failed' }, { status: 500 }); }
}
export async function GET() {
  return NextResponse.json({ endpoint: '/api/sync', method: 'POST', description: 'Trigger sync for all channels' });
}