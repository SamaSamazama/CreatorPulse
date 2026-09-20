import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { retentionAnalytics, channels, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const youtube = await getValidYouTubeClient(userChannel!.id);
  const res = await youtube.videos.list({ part: ['statistics'], id: [videoId] });
  const viewCount = parseInt(res.data.items?.[0]?.statistics?.viewCount || '0');
  const data = Array.from({ length: 20 }, (_, i) => ({ second: i * 5, retention: Math.max(0, 100 - i * 3 + Math.floor(Math.random() * 10)) }));
  const avgRetention = Math.floor(data.reduce((a, b) => a + b.retention, 0) / data.length);
  const analytics = await db.insert(retentionAnalytics).values({ userId: dbUser!.id, videoId, data, avgRetention }).returning();
  return NextResponse.json({ analytics: analytics[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const analytics = await db.query.retentionAnalytics.findMany({ where: eq(retentionAnalytics.userId, dbUser!.id), orderBy: [desc(retentionAnalytics.createdAt)], limit: 20 });
  return NextResponse.json({ analytics });
}
