import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createOAuth2Client } from '@/lib/youtube/client';
export const dynamic = 'force-dynamic';
export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || null,
      YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID ? 'set' : 'missing',
      YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET ? 'set' : 'missing',
    },
    auth: null,
    db: null,
    oauth: null,
  };
  try {
    const { userId } = await auth();
    debug.auth = { userId: userId || null };
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 401 });
    }
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    debug.db = { userFound: !!dbUser, userId: dbUser?.id || null };
    const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, dbUser?.id || '') });
    debug.db.channels = userChannels.length;
    try {
      const oauth2Client = createOAuth2Client();
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`;
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.readonly'],
        state: encodeURIComponent(JSON.stringify({ userId: dbUser?.id, clerkId: userId })),
        prompt: 'consent',
      });
      debug.oauth = { redirectUri, urlGenerated: true };
    } catch (e: any) {
      debug.oauth = { error: e.message };
    }
    return NextResponse.json({ debug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, debug }, { status: 500 });
  }
}
