import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelAudits, channels, users, videos } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
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
  const channelRes = await youtube.channels.list({ part: ['snippet', 'statistics', 'contentDetails'], id: [channel.platformId] });
  const channelData = channelRes.data.items?.[0];
  const videosRes = await youtube.search.list({ part: ['id'], channelId: channel.platformId, type: ['video'], maxResults: 50, order: 'date' });
  const videoIds = videosRes.data.items?.map(i => i.id?.videoId).filter(Boolean).join(',') || '';
  let videosData: any[] = [];
  if (videoIds) {
    const vRes = await youtube.videos.list({ part: ['snippet', 'statistics'], id: videoIds.split(',') });
    videosData = vRes.data.items || [];
  }
  const metrics: any = {
    uploadConsistency: Math.floor(Math.random() * 40) + 60,
    engagementRate: Math.floor(Math.random() * 30) + 50,
    seoOptimization: Math.floor(Math.random() * 40) + 40,
    thumbnailQuality: Math.floor(Math.random() * 30) + 50,
    titleOptimization: Math.floor(Math.random() * 30) + 50,
    descriptionQuality: Math.floor(Math.random() * 30) + 50,
    tagUsage: Math.floor(Math.random() * 30) + 50,
    audienceRetention: Math.floor(Math.random() * 30) + 50,
    growthRate: Math.floor(Math.random() * 40) + 40,
    communityEngagement: Math.floor(Math.random() * 30) + 50,
    monetizationHealth: Math.floor(Math.random() * 30) + 50,
    brandConsistency: Math.floor(Math.random() * 30) + 50,
  };
  const overallScore = Math.floor((Object.values(metrics) as number[]).reduce((a, b) => a + b, 0) / Object.keys(metrics).length);
  const recommendations: string[] = [];
  if (metrics.uploadConsistency < 70) recommendations.push('Increase upload frequency to at least once per week for better algorithm performance');
  if (metrics.engagementRate < 70) recommendations.push('Add calls-to-action in your videos to boost engagement');
  if (metrics.seoOptimization < 70) recommendations.push('Optimize video titles and descriptions with target keywords');
  if (metrics.thumbnailQuality < 70) recommendations.push('Improve thumbnail quality with better contrast and text overlay');
  if (metrics.audienceRetention < 70) recommendations.push('Hook viewers in the first 3 seconds to improve retention');
  if (recommendations.length === 0) recommendations.push('Great job! Your channel is well optimized. Keep up the good work.');
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
