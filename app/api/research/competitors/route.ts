// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { competitors, users, channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  if (!dbUser) return NextResponse.json([]);
  return NextResponse.json(await db.query.competitors.findMany({ where: eq(competitors.userId, dbUser.id) }));
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelIdentifier } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  try {
    const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
    if (!userChannel) throw new Error('Connect your channel first');
    const youtube = await getValidYouTubeClient(userChannel.id);
    const isHandle = channelIdentifier.startsWith('@');
    const response = await youtube.channels.list({ part: ['snippet', 'statistics'], ...(isHandle ? { forHandle: channelIdentifier } : { id: channelIdentifier }) });
    const ytChannel = response.data.items?.[0];
    if (!ytChannel) throw new Error('Channel not found');
    await db.insert(competitors).values({ userId: dbUser.id, platformId: ytChannel.id, title: ytChannel.snippet.title, handle: ytChannel.snippet.customUrl, thumbnailUrl: ytChannel.snippet.thumbnails?.default?.url, subscriberCount: parseInt(ytChannel.statistics.subscriberCount || '0'), viewCount: parseInt(ytChannel.statistics.viewCount || '0') });
    return NextResponse.json({ success: true });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
