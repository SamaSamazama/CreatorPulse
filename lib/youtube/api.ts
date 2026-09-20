// @ts-nocheck
import { google } from 'googleapis';
import { getValidYouTubeClient } from './client';
import { withTimeoutAndRetry } from '@/lib/utils/retry';
export { getValidYouTubeClient };
export async function fetchChannelAnalytics(youtube: any) {
  return withTimeoutAndRetry(async () => {
    const response = await youtube.channels.list({ part: ['snippet', 'statistics', 'status'], mine: true });
    return response.data.items?.[0];
  });
}
export async function fetchRecentVideos(youtube: any, maxResults = 10) {
  return withTimeoutAndRetry(async () => {
    const response = await youtube.search.list({ part: ['snippet'], forMine: true, type: ['video'], order: 'date', maxResults });
    const videoIds = response.data.items?.map((item: any) => item.id.videoId).join(',');
    if (!videoIds) return [];
    const statsResponse = await youtube.videos.list({ part: ['snippet', 'statistics', 'contentDetails'], id: videoIds });
    return statsResponse.data.items || [];
  });
}
