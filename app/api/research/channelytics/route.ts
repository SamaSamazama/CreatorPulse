import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelytics, users, competitors, channels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { competitorId, competitorName } = await request.json();
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, dbUser.id) });
    const userVideoCount = userChannels.reduce((sum, channel) => sum + (channel.videoCount || 0), 0);
    const userViewCount = userChannels.reduce((sum, channel) => sum + (channel.viewCount || 0), 0);
    const userSubscriberCount = userChannels.reduce((sum, channel) => sum + (channel.subscriberCount || 0), 0);
    const competitor = competitorId ? await db.query.competitors.findFirst({ where: eq(competitors.id, competitorId) }) : null;
    const competitorVideoCount = competitor?.videoCount || Math.max(userVideoCount * 0.7, 10);
    const competitorViewCount = competitor?.viewCount || Math.max(userViewCount * 0.8, 1000);
    const competitorSubscriberCount = competitor?.subscriberCount || Math.max(userSubscriberCount * 0.75, 100);
    const metrics = {
      videos: competitorVideoCount,
      views: competitorViewCount,
      subscribers: competitorSubscriberCount,
    };
    const comparison = {
      videos: Number(((userVideoCount - competitorVideoCount) / Math.max(competitorVideoCount, 1) * 100).toFixed(2)),
      views: Number(((userViewCount - competitorViewCount) / Math.max(competitorViewCount, 1) * 100).toFixed(2)),
      subscribers: Number(((userSubscriberCount - competitorSubscriberCount) / Math.max(competitorSubscriberCount, 1) * 100).toFixed(2)),
    };
    let entry;
    try {
      entry = await db.insert(channelytics).values({ userId: dbUser.id, competitorId: competitorId || '', competitorName: competitorName || competitor?.title || 'Unknown', data: { metrics, comparison } }).returning();
    } catch (error) {
      console.error('Database channelytics insert error:', error);
      return NextResponse.json({ error: 'Failed to save channelytics data' }, { status: 500 });
    }
    let aiInsights = '';
    try {
      const model = process.env.OPENROUTER_CHANNELYTICS_MODEL || 'z-ai/glm-5-2';
      aiInsights = await generateOpenRouterCompletion(model, `Comparison: ${JSON.stringify(comparison)}. Provide competitive strategy advice.`, 'You are a YouTube competitive analyst.');
    } catch (error) {
      console.error('AI channelytics error:', error);
    }
    return NextResponse.json({ entry: entry[0], aiInsights });
  } catch (error: any) {
    console.error('Channelytics route error:', error);
    return NextResponse.json({ error: error.message || 'Channelytics analysis failed' }, { status: 500 });
  }
}
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (!dbUser) return NextResponse.json({ entries: [] });
    const entries = await db.query.channelytics.findMany({ where: eq(channelytics.userId, dbUser.id), orderBy: [desc(channelytics.createdAt)] });
    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error('Channelytics GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load channelytics' }, { status: 500 });
  }
}
