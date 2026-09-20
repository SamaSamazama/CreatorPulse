import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelAudits, channels, users, videos } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { computeAuditMetrics } from '@/lib/scoring';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { channelId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const channel = channelId ? await db.query.channels.findFirst({ where: eq(channels.id, channelId) }) : await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
  if (!channel) return NextResponse.json({ error: 'No channel found' }, { status: 404 });
  const youtube = await getValidYouTubeClient(channel.id);
  let channelData: any = {};
  let videosData: any[] = [];
  try {
    const channelRes = await youtube.channels.list({ part: ['snippet', 'statistics', 'contentDetails'], id: [channel.platformId] });
    channelData = channelRes.data.items?.[0] || {};
    const videosRes = await youtube.search.list({ part: ['id'], channelId: channel.platformId, type: ['video'], maxResults: 50, order: 'date' });
    const videoIds = videosRes.data.items?.map(i => i.id?.videoId).filter(Boolean).join(',') || '';
    if (videoIds) {
      const vRes = await youtube.videos.list({ part: ['snippet', 'statistics'], id: videoIds.split(',') });
      videosData = vRes.data.items || [];
    }
  } catch (error) {
    console.error('YouTube API error:', error);
  }
  const statistics = channelData.statistics || {};
  const metricsPayload = {
    channel: {
      subscriberCount: statistics.subscriberCount ? Number(statistics.subscriberCount) : null,
      videoCount: statistics.videoCount ? Number(statistics.videoCount) : null,
      viewCount: statistics.viewCount ? Number(statistics.viewCount) : null,
    },
    videosList: videosData.map(video => ({
      snippet: video.snippet,
      statistics: video.statistics,
    })),
  };
  const { overallScore, metrics, recommendations } = computeAuditMetrics(metricsPayload);
  const audit = await db.insert(channelAudits).values({ userId: dbUser.id, channelId: channel.id, overallScore, metrics, recommendations }).returning();
  await db.update(channels).set({ auditScore: overallScore }).where(eq(channels.id, channel.id));
  return NextResponse.json({ audit: audit[0] });
}
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ audits: [] });
  const audits = await db.query.channelAudits.findMany({ where: eq(channelAudits.userId, dbUser.id), orderBy: [desc(channelAudits.createdAt)], limit: 10 });
  return NextResponse.json({ audits });
}
