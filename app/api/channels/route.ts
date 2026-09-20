import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (!dbUser) return NextResponse.json({ channels: [] });
    const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, dbUser.id) });
    return NextResponse.json({ channels: userChannels });
  } catch (error: any) {
    console.error('GET /api/channels error:', error);
    return NextResponse.json({ error: 'Failed to load channels', details: error.message }, { status: 500 });
  }
}
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (!dbUser) {
      const email = userId.includes('@') ? userId : `${userId}@clerk.local`;
      const inserted = await db.insert(users).values({ clerkId: userId, email, name: userId }).returning();
      dbUser = inserted[0];
    }
    const state = encodeURIComponent(JSON.stringify({ userId: dbUser.id, clerkId: userId }));
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`;
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', process.env.YOUTUBE_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.readonly');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);
    return NextResponse.json({ url: authUrl.toString() });
  } catch (error: any) {
    console.error('POST /api/channels error:', error);
    return NextResponse.json({ error: 'Failed to start channel connect', details: error.message }, { status: 500 });
  }
}
