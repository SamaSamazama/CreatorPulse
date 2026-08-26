// @ts-nocheck
import { google } from 'googleapis';
import { getValidYouTubeClient } from './client';
export { getValidYouTubeClient };
export async function fetchChannelAnalytics(youtube: any) {
  const response = await youtube.channels.list({ part: ['snippet', 'statistics', 'status'], mine: true });
  return response.data.items?.[0];
}
export async function fetchRecentVideos(youtube: any, maxResults = 10) {
  const response = await youtube.search.list({ part: ['snippet'], forMine: true, type: ['video'], order: 'date', maxResults });
  const videoIds = response.data.items?.map((item: any) => item.id.videoId).join(',');
  if (!videoIds) return [];
  const statsResponse = await youtube.videos.list({ part: ['snippet', 'statistics', 'contentDetails'], id: videoIds });
  return statsResponse.data.items || [];
}
