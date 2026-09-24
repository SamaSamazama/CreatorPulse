import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOAuth2Client } from '@/lib/youtube/client';
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const state = encodeURIComponent(userId);
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/youtube/callback`;
  const oauth2Client = createOAuth2Client(redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
    ],
    state,
    prompt: 'consent',
  });
  return NextResponse.redirect(url);
}