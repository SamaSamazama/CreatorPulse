import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOAuth2Client } from '@/lib/youtube/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

    if (!redirectUri) {
      return NextResponse.json(
        {
          error: 'YOUTUBE_REDIRECT_URI is not configured',
        },
        { status: 500 }
      );
    }

    const state = encodeURIComponent(userId);

    const oauth2Client = createOAuth2Client(
      redirectUri
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',

      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl',
      ],

      state,

      prompt: 'consent',

      include_granted_scopes: true,
    });

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error(
      'YouTube OAuth start error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to start YouTube authentication',
      },
      { status: 500 }
    );
  }
}