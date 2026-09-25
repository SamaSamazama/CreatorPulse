import { NextResponse } from 'next/server';
import { createOAuth2Client } from '@/lib/youtube/client';

export async function GET() {
  try {
    const redirectUri =
      'https://my-project-sooty-tau-51.vercel.app/api/auth/youtube/callback';

    const oauth2Client = createOAuth2Client(redirectUri);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl',
      ],
      prompt: 'consent',
    });

    const parsed = new URL(authUrl);

    const clientId =
      parsed.searchParams.get('client_id');

    const redirect =
      parsed.searchParams.get('redirect_uri');

    return NextResponse.json({
      success: true,

      generatedUrlHasClientId:
        Boolean(clientId),

      generatedClientIdLength:
        clientId?.length ?? 0,

      generatedClientIdMatchesEnv:
        clientId === process.env.YOUTUBE_CLIENT_ID,

      generatedRedirectUri:
        redirect ?? null,

      generatedRedirectUriMatchesEnv:
        redirect === process.env.YOUTUBE_REDIRECT_URI,

      googleAuthHost:
        parsed.hostname,

      path:
        parsed.pathname,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}