// @ts-nocheck

import { google } from 'googleapis';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withTimeoutAndRetry } from '@/lib/utils/retry';

export function createOAuth2Client(redirectUri?: string) {
  const finalRedirectUri =
    redirectUri || process.env.YOUTUBE_REDIRECT_URI;

  if (!process.env.YOUTUBE_CLIENT_ID) {
    throw new Error('YOUTUBE_CLIENT_ID is not configured');
  }

  if (!process.env.YOUTUBE_CLIENT_SECRET) {
    throw new Error('YOUTUBE_CLIENT_SECRET is not configured');
  }

  if (!finalRedirectUri) {
    throw new Error('YOUTUBE_REDIRECT_URI is not configured');
  }

  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    finalRedirectUri
  );
}

export async function getValidAccessToken(
  channelId: string
): Promise<string> {
  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, channelId),
  });

  if (!channel || !channel.refreshToken) {
    throw new Error('Channel not found');
  }

  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({
    access_token: channel.accessToken ?? undefined,
    refresh_token: channel.refreshToken,
  });

  const isExpired = channel.tokenExpiry
    ? new Date(channel.tokenExpiry).getTime() < Date.now() + 300000
    : true;

  if (isExpired) {
    try {
      const { credentials } = await withTimeoutAndRetry(
        async () => oauth2Client.refreshAccessToken()
      );

      await db
        .update(channels)
        .set({
          accessToken: credentials.access_token ?? null,
          tokenExpiry: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : null,
        })
        .where(eq(channels.id, channelId));

      return credentials.access_token as string;
    } catch (error: any) {
      const message = error?.message || '';

      if (message.includes('invalid_grant')) {
        throw new Error(
          'YOUTUBE_TOKEN_INVALID: Your YouTube connection has expired. Please reconnect your channel.'
        );
      }

      throw error;
    }
  }

  return channel.accessToken as string;
}

export async function getValidYouTubeClient(channelId: string) {
  const token = await getValidAccessToken(channelId);

  const auth = createOAuth2Client();

  auth.setCredentials({
    access_token: token,
  });

  return google.youtube({
    version: 'v3',
    auth,
  });
}