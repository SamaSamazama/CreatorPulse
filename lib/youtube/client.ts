import { google } from 'googleapis';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
  );
}
export async function getValidAccessToken(channelId: string): Promise<string> {
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  if (!channel || !channel.refreshToken) throw new Error('Channel not found');
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: channel.accessToken ?? undefined, refresh_token: channel.refreshToken });
  const isExpired = channel.tokenExpiry ? new Date(channel.tokenExpiry).getTime() < Date.now() + 300000 : true;
  if (isExpired) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db.update(channels).set({ accessToken: credentials.access_token ?? null, tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null }).where(eq(channels.id, channelId));
    return credentials.access_token as string;
  }
  return channel.accessToken as string;
}
export async function getValidYouTubeClient(channelId: string) {
  const token = await getValidAccessToken(channelId);
  const auth = createOAuth2Client();
  auth.setCredentials({ access_token: token });
  return google.youtube({ version: 'v3', auth });
}
