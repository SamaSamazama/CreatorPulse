import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createOAuth2Client } from '@/lib/youtube/client';
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const oauth2Client = createOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', scope: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/yt-analytics.readonly', 'https://www.googleapis.com/auth/youtube.force-ssl'],
    state: userId, prompt: 'consent',
  });
  return NextResponse.redirect(url);
}
