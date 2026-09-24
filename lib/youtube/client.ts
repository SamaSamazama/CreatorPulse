// @ts-nocheck

import { google } from 'googleapis';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withTimeoutAndRetry } from '@/lib/utils/retry';

/**
 * Create Google OAuth2 client.
 *
 * The redirect URI MUST remain stable.
 *
 * Production:
 * https://my-project-sooty-tau-51.vercel.app/api/auth/youtube/callback
 *
 * This value comes from:
 * YOUTUBE_REDIRECT_URI
 */
export function createOAuth2Client(
  redirectUri?: string
) {
  const finalRedirectUri =
    redirectUri ||
    process.env.YOUTUBE_REDIRECT_URI;

  if (!process.env.YOUTUBE_CLIENT_ID) {
    throw new Error(
      'YOUTUBE_CLIENT_ID is not configured'
    );
  }

  if (!process.env.YOUTUBE_CLIENT_SECRET) {
    throw new Error(
      'YOUTUBE_CLIENT_SECRET is not configured'
    );
  }

  if (!finalRedirectUri) {
    throw new Error(
      'YOUTUBE_REDIRECT_URI is not configured'
    );
  }

  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    finalRedirectUri
  );
}


/**
 * Get a valid YouTube access token.
 *
 * Automatically refreshes the token when:
 * - it has expired
 * - it will expire within 5 minutes
 */
export async function getValidAccessToken(
  channelId: string
): Promise<string> {
  const channel =
    await db.query.channels.findFirst({
      where: eq(
        channels.id,
        channelId
      ),
    });

  if (
    !channel ||
    !channel.refreshToken
  ) {
    throw new Error(
      'Channel not found'
    );
  }

  const oauth2Client =
    createOAuth2Client();

  oauth2Client.setCredentials({
    access_token:
      channel.accessToken ??
      undefined,

    refresh_token:
      channel.refreshToken,
  });

  const isExpired =
    channel.tokenExpiry
      ? new Date(
          channel.tokenExpiry
        ).getTime() <
        Date.now() + 300000
      : true;

  if (isExpired) {
    try {
      const { credentials } =
        await withTimeoutAndRetry(
          async () =>
            oauth2Client.refreshAccessToken()
        );

      await db
        .update(channels)
        .set({
          accessToken:
            credentials.access_token ??
            null,

          tokenExpiry:
            credentials.expiry_date
              ? new Date(
                  credentials.expiry_date
                )
              : null,
        })
        .where(
          eq(
            channels.id,
            channelId
          )
        );

      if (
        !credentials.access_token
      ) {
        throw new Error(
          'Google did not return a new access token'
        );
      }

      return credentials
        .access_token;

    } catch (error: any) {
      const message =
        error?.message || '';

      if (
        message.includes(
          'invalid_grant'
        )
      ) {
        throw new Error(
          'YOUTUBE_TOKEN_INVALID: Your YouTube connection has expired. Please reconnect your channel.'
        );
      }

      throw error;
    }
  }

  if (!channel.accessToken) {
    throw new Error(
      'YouTube access token is missing'
    );
  }

  return channel.accessToken;
}


/**
 * Get authenticated YouTube API client.
 */
export async function getValidYouTubeClient(
  channelId: string
) {
  const token =
    await getValidAccessToken(
      channelId
    );

  const auth =
    createOAuth2Client();

  auth.setCredentials({
    access_token: token,
  });

  return google.youtube({
    version: 'v3',
    auth,
  });
}