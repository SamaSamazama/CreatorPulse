import {
  NextRequest,
  NextResponse,
} from 'next/server';

import { createOAuth2Client } from '@/lib/youtube/client';

import { db } from '@/lib/db';

import {
  channels,
  users,
} from '@/lib/db/schema';

import { eq } from 'drizzle-orm';

import { google } from 'googleapis';


export async function GET(
  request: NextRequest
) {
  const searchParams =
    request.nextUrl.searchParams;

  const code =
    searchParams.get('code');

  const state =
    searchParams.get('state');

  const oauthError =
    searchParams.get('error');


  /*
   * User denied Google authorization.
   */
  if (oauthError) {
    console.error(
      '[YouTube OAuth Callback] Google returned error:',
      oauthError
    );

    return NextResponse.redirect(
      new URL(
        `/onboarding?error=youtube_auth_denied&message=${encodeURIComponent(
          oauthError
        )}`,
        request.url
      )
    );
  }


  /*
   * Google should return both:
   *
   * code
   * state
   */
  if (!code || !state) {
    return NextResponse.json(
      {
        error:
          'Missing OAuth code or state',
      },
      {
        status: 400,
      }
    );
  }


  try {
    /*
     * IMPORTANT:
     *
     * This MUST be exactly the same
     * redirect URI used when OAuth started.
     */
    const redirectUri =
      process.env.YOUTUBE_REDIRECT_URI;


    if (!redirectUri) {
      throw new Error(
        'YOUTUBE_REDIRECT_URI is not configured'
      );
    }


    const clientId =
      process.env.YOUTUBE_CLIENT_ID;


    if (!clientId) {
      throw new Error(
        'YOUTUBE_CLIENT_ID is not configured'
      );
    }


    /*
     * Log safe OAuth information.
     *
     * NEVER log the client secret.
     */
    console.log(
      '[YouTube OAuth Callback] Client ID:',
      clientId
    );

    console.log(
      '[YouTube OAuth Callback] Redirect URI:',
      redirectUri
    );


    /*
     * Create OAuth client with
     * the EXACT SAME redirect URI.
     */
    const oauth2Client =
      createOAuth2Client(
        redirectUri
      );


    /*
     * Exchange authorization code
     * for access and refresh tokens.
     */
    const { tokens } =
      await oauth2Client.getToken(
        code
      );


    if (!tokens.access_token) {
      throw new Error(
        'Failed to retrieve access token'
      );
    }


    /*
     * Attach credentials.
     */
    oauth2Client.setCredentials(
      tokens
    );


    /*
     * Create YouTube API client.
     */
    const youtube =
      google.youtube({
        version: 'v3',
        auth: oauth2Client,
      });


    /*
     * Get the YouTube channel
     * belonging to the authorized Google account.
     */
    const channelResponse =
      await youtube.channels.list({
        part: [
          'snippet',
          'statistics',
        ],

        mine: true,
      });


    const ytChannel =
      channelResponse.data.items?.[0];


    if (
      !ytChannel ||
      !ytChannel.id
    ) {
      throw new Error(
        'Could not fetch YouTube channel'
      );
    }


    /*
     * Parse OAuth state.
     *
     * Current implementation stores
     * the Clerk user ID directly.
     */
    let stateObj: {
      userId?: string;
      clerkId?: string;
      reconnect?: string;
    } = {};


    try {
      stateObj =
        JSON.parse(
          decodeURIComponent(
            state
          )
        );

    } catch {
      /*
       * State is currently
       * the Clerk user ID.
       */
    }


    const clerkId =
      stateObj.clerkId ||
      state;


    /*
     * Find existing application user.
     */
    let dbUser =
      await db.query.users.findFirst({
        where: eq(
          users.clerkId,
          clerkId
        ),
      });


    /*
     * Create user if necessary.
     */
    if (!dbUser) {
      const email =
        clerkId.includes('@')
          ? clerkId
          : `${clerkId}@clerk.local`;


      const inserted =
        await db
          .insert(users)
          .values({
            clerkId,

            email,

            name: clerkId,
          })
          .returning();


      dbUser =
        inserted[0];
    }


    /*
     * Prepare YouTube channel
     * database values.
     */
    const values = {
      userId:
        dbUser.id,

      platformId:
        ytChannel.id,

      platform:
        'youtube' as const,

      title:
        ytChannel.snippet?.title ||
        'Unknown',

      handle:
        ytChannel.snippet?.customUrl,

      thumbnailUrl:
        ytChannel.snippet
          ?.thumbnails
          ?.default
          ?.url,

      subscriberCount:
        parseInt(
          ytChannel.statistics
            ?.subscriberCount ||
            '0'
        ),

      viewCount:
        parseInt(
          ytChannel.statistics
            ?.viewCount ||
            '0'
        ),

      videoCount:
        parseInt(
          ytChannel.statistics
            ?.videoCount ||
            '0'
        ),

      accessToken:
        tokens.access_token,

      refreshToken:
        tokens.refresh_token ||
        null,

      tokenExpiry:
        tokens.expiry_date
          ? new Date(
              tokens.expiry_date
            )
          : null,

      lastSyncedAt:
        new Date(),
    };


    /*
     * Reconnect an existing channel.
     */
    if (
      stateObj.reconnect
    ) {
      await db
        .update(channels)
        .set(values)
        .where(
          eq(
            channels.id,
            stateObj.reconnect
          )
        );

    } else {

      /*
       * Check whether this YouTube
       * channel already exists.
       */
      const existing =
        await db.query.channels.findFirst({
          where: eq(
            channels.platformId,
            ytChannel.id
          ),
        });


      if (existing) {

        /*
         * Update existing channel.
         */
        await db
          .update(channels)
          .set(values)
          .where(
            eq(
              channels.id,
              existing.id
            )
          );

      } else {

        /*
         * Insert new channel.
         */
        await db
          .insert(channels)
          .values(values);
      }
    }


    /*
     * OAuth completed successfully.
     */
    console.log(
      '[YouTube OAuth Callback] Successfully connected channel:',
      ytChannel.id
    );


    return NextResponse.redirect(
      new URL(
        '/dashboard',
        request.url
      )
    );


  } catch (error: any) {

    console.error(
      '[YouTube OAuth Callback] Error:',
      error
    );


    const errorMessage =
      error?.message ||
      'YouTube authentication failed';


    return NextResponse.redirect(
      new URL(
        `/onboarding?error=youtube_auth_failed&message=${encodeURIComponent(
          errorMessage
        )}`,
        request.url
      )
    );
  }
}