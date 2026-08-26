import { google } from 'googleapis';
import { createOAuth2Client } from './client';
export async function fetchRevenueData(accessToken: string, channelId: string, startDate: string, endDate: string) {
  const auth = createOAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth });
  const response = await youtubeAnalytics.reports.query({
    ids: `channel==${channelId}`, startDate, endDate,
    metrics: 'estimatedRevenue,views,estimatedMinutesWatched', dimensions: 'day', sort: 'day',
  });
  return response.data;
}
