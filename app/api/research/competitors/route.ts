// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { competitors, users, channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json([]);
  return NextResponse.json(await db.query.competitors.findMany({ where: eq(competitors.userId, dbUser.id) }));
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelIdentifier } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  try {
    const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
    if (!userChannel) throw new Error('Connect your channel first');
    const youtube = await getValidYouTubeClient(userChannel.id);
    const isHandle = channelIdentifier.startsWith('@');
    const response = await youtube.channels.list({ part: ['snippet', 'statistics'], ...(isHandle ? { forHandle: channelIdentifier } : { id: channelIdentifier }) });
    const ytChannel = response.data.items?.[0];
    if (!ytChannel) throw new Error('Channel not found');
    let aiInsights = '';
    try {
      const model = process.env.OPENROUTER_CHANNELYTICS_MODEL || 'z-ai/glm-5.2';
      aiInsights = await generateOpenRouterCompletion(model, `Competitor: ${ytChannel.snippet.title}. Subscribers: ${ytChannel.statistics.subscriberCount}. Views: ${ytChannel.statistics.viewCount}. Suggest competitive advantages.`, 'You are a YouTube competitor analyst.');
    } catch (error) {
      console.error('AI competitors error:', error);
    }
    await db.insert(competitors).values({ userId: dbUser.id, platformId: ytChannel.id, title: ytChannel.snippet.title, handle: ytChannel.snippet.customUrl, thumbnailUrl: ytChannel.snippet.thumbnails?.default?.url, subscriberCount: parseInt(ytChannel.statistics.subscriberCount || '0'), viewCount: parseInt(ytChannel.statistics.viewCount || '0') }).returning();
    return NextResponse.json({ success: true, aiInsights });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
