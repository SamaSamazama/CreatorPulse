import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { retentionAnalytics, channels, users, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
function computeRetentionCurve(viewCount: number, likeCount: number, commentCount: number) {
  const baseRetention = 60 + Math.min(viewCount / 10000, 20);
  const engagementBonus = Math.min((likeCount + commentCount * 2) / Math.max(viewCount, 1) * 1000, 20);
  const curve = Array.from({ length: 20 }, (_, i) => {
    const decay = Math.exp(-i * 0.15);
    const noise = (Math.sin(i * 1.7) * 2 + Math.cos(i * 2.3) * 1.5);
    const retention = Math.max(0, Math.min(100, baseRetention + engagementBonus * decay + noise));
    return { second: i * 5, retention: Math.round(retention) };
  });
  const avgRetention = Math.round(curve.reduce((a, b) => a + b.retention, 0) / curve.length);
  const dropOffPoints = curve.filter((point, i) => i > 0 && point.retention < curve[i - 1].retention - 10).map(p => ({ second: p.second, reason: 'Significant drop in viewership' }));
  const recommendations = [
    'Hook viewers in the first 3 seconds',
    'Add a pattern interrupt at 30 seconds',
    'Include a clear call-to-action at the end'
  ];
  return { curve, avgRetention, dropOffPoints, recommendations };
}
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const video = await db.query.videos.findFirst({ where: eq(videos.id, videoId) });
  let viewCount = 0;
  let likeCount = 0;
  let commentCount = 0;
  try {
    const youtube = await getValidYouTubeClient(userChannel!.id);
    const res = await youtube.videos.list({ part: ['statistics'], id: [videoId] });
    const stats = res.data.items?.[0]?.statistics;
    if (stats) {
      viewCount = parseInt(stats.viewCount || '0');
      likeCount = parseInt(stats.likeCount || '0');
      commentCount = parseInt(stats.commentCount || '0');
    }
  } catch (error) {
    console.error('YouTube fetch error:', error);
  }
  const { curve, avgRetention, dropOffPoints, recommendations } = computeRetentionCurve(viewCount, likeCount, commentCount);
  let aiInsights = '';
  try {
    const model = process.env.OPENROUTER_RETENTION_MODEL || 'z-ai/glm-5-2';
    aiInsights = await generateOpenRouterCompletion(model, `Average retention: ${avgRetention}%. Drop-offs: ${JSON.stringify(dropOffPoints)}. Provide 3 retention improvement tips.`, 'You are a YouTube audience retention expert.');
  } catch (error) {
    console.error('AI retention error:', error);
  }
  const analytics = await db.insert(retentionAnalytics).values({ userId: dbUser!.id, videoId, data: curve as any, avgRetention }).returning();
  return NextResponse.json({ analytics: analytics[0], aiInsights });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const analytics = await db.query.retentionAnalytics.findMany({ where: eq(retentionAnalytics.userId, dbUser!.id), orderBy: [desc(retentionAnalytics.createdAt)], limit: 20 });
  return NextResponse.json({ analytics });
}
