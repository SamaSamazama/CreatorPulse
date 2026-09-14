import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const channel = await db.query.channels.findFirst({ where: and(eq(channels.id, channelId), eq(channels.userId, dbUser.id)) });
  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  await db.delete(channels).where(eq(channels.id, channel.id));
  return NextResponse.json({ success: true });
}
export async function PUT(_request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const channel = await db.query.channels.findFirst({ where: and(eq(channels.id, channelId), eq(channels.userId, dbUser.id)) });
  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  const state = encodeURIComponent(JSON.stringify({ userId: dbUser.id, clerkId: userId, reconnect: channel.id }));
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
}
