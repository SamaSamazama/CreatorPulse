import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelytics, users, competitors, channels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { competitorId, competitorName } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, dbUser!.id) });
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
  const entry = await db.insert(channelytics).values({ userId: dbUser!.id, competitorId: competitorId || '', competitorName: competitorName || competitor?.name || 'Unknown', metrics, comparison }).returning();
  return NextResponse.json({ entry: entry[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const entries = await db.query.channelytics.findMany({ where: eq(channelytics.userId, dbUser!.id), orderBy: [desc(channelytics.createdAt)] });
  return NextResponse.json({ entries });
}
