import { getValidYouTubeClient } from './client';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export interface KeywordResult {
  videoId: string; title: string; channelTitle: string; channelId: string;
  viewCount: number; subscriberCount: number; publishedAt: string; opportunityScore: number;
}
export async function analyzeKeyword(userId: string, query: string): Promise<KeywordResult[]> {
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, userId) });
  if (!userChannel) throw new Error('No connected channel found');
  const youtube = await getValidYouTubeClient(userChannel.id);
  const searchResponse = await youtube.search.list({ part: ['snippet'], q: query, type: ['video'], order: 'relevance', maxResults: 15 });
  const videoIds = searchResponse.data.items?.map((item: any) => item.id.videoId).join(',');
  if (!videoIds) return [];
  const videosResponse = await youtube.videos.list({ part: ['snippet', 'statistics'], id: videoIds });
  const channelIds = [...new Set(searchResponse.data.items?.map((item: any) => item.snippet.channelId))].join(',');
  const channelsResponse = await youtube.channels.list({ part: ['statistics'], id: channelIds });
  const channelStatsMap = new Map(channelsResponse.data.items?.map((ch: any) => [ch.id, parseInt(ch.statistics.subscriberCount || '0')]) || []);
  const results: KeywordResult[] = videosResponse.data.items?.map((video: any) => {
    const views = parseInt(video.statistics.viewCount || '0');
    const subs = channelStatsMap.get(video.snippet.channelId) || 0;
    const ratio = subs > 0 ? Math.min(views / subs, 10) : 10; 
    const score = Math.round((ratio / 10) * 100);
    return { videoId: video.id, title: video.snippet.title, channelTitle: video.snippet.channelTitle, channelId: video.snippet.channelId, viewCount: views, subscriberCount: subs, publishedAt: video.snippet.publishedAt, opportunityScore: score };
  }) || [];
  return results.sort((a, b) => b.opportunityScore - a.opportunityScore);
}
