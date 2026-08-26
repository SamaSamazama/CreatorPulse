import { google } from 'googleapis';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createOAuth2Client } from './client';
export async function getValidYouTubeClient(channelId: string) {
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  if (!channel || !channel.refreshToken) throw new Error('Channel not found');
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: channel.accessToken, refresh_token: channel.refreshToken });
  const isExpired = channel.tokenExpiry ? new Date(channel.tokenExpiry).getTime() < Date.now() + 300000 : true;
  if (isExpired) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db.update(channels).set({ accessToken: credentials.access_token, tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null }).where(eq(channels.id, channelId));
    oauth2Client.setCredentials(credentials);
  }
  return google.youtube({ version: 'v3', auth: oauth2Client });
}
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
