import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOAuth2Client } from '@/lib/youtube/client';

export async function GET() {
  try {
    /*
     * Get currently logged-in Clerk user.
     */
    const { userId } =
      await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            'Unauthorized',
        },
        {
          status: 401,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * Never generate the redirect URI
     * from request.nextUrl.origin.
     *
     * Vercel deployment URLs can change.
     *
     * We use one fixed environment variable.
     */
    const redirectUri =
      process.env.YOUTUBE_REDIRECT_URI;

    if (!redirectUri) {
      console.error(
        '[YouTube OAuth] YOUTUBE_REDIRECT_URI is missing'
      );

      return NextResponse.json(
        {
          error:
            'YOUTUBE_REDIRECT_URI is not configured',
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Make sure the client ID exists.
     */
    const clientId =
      process.env.YOUTUBE_CLIENT_ID;

    if (!clientId) {
      console.error(
        '[YouTube OAuth] YOUTUBE_CLIENT_ID is missing'
      );

      return NextResponse.json(
        {
          error:
            'YOUTUBE_CLIENT_ID is not configured',
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Log these values in Vercel logs.
     *
     * IMPORTANT:
     * Client ID is not a secret.
     * Client secret is NEVER logged.
     */
    console.log(
      '[YouTube OAuth] Client ID:',
      clientId
    );

    console.log(
      '[YouTube OAuth] Redirect URI:',
      redirectUri
    );

    /*
     * State contains the Clerk user ID.
     */
    const state =
      encodeURIComponent(
        userId
      );

    /*
     * Create OAuth client using
     * the FIXED redirect URI.
     */
    const oauth2Client =
      createOAuth2Client(
        redirectUri
      );

    /*
     * Generate Google's authorization URL.
     */
    const authorizationUrl =
      oauth2Client.generateAuthUrl({
        access_type:
          'offline',

        scope: [
          'https://www.googleapis.com/auth/youtube.readonly',

          'https://www.googleapis.com/auth/yt-analytics.readonly',

          'https://www.googleapis.com/auth/youtube.force-ssl',
        ],

        state,

        /*
         * Forces Google to return a refresh token
         * when appropriate.
         */
        prompt: 'consent',

        /*
         * Allows previously granted scopes
         * to be reused.
         */
        include_granted_scopes:
          true,
      });

    console.log(
      '[YouTube OAuth] Authorization URL generated'
    );

    return NextResponse.redirect(
      authorizationUrl
    );

  } catch (error: any) {
    console.error(
      '[YouTube OAuth] Start error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to start YouTube authentication',
      },
      {
        status: 500,
      }
    );
  }
}