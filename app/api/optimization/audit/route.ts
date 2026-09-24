import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelAudits, channels, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
import { computeAuditMetrics } from '@/lib/scoring';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { channelId } = await request.json();
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (channelId && !isValidUuid(channelId)) {
      return NextResponse.json({ error: 'Invalid channel ID format. Please select a connected channel.' }, { status: 400 });
    }
    const channel = channelId ? await db.query.channels.findFirst({ where: eq(channels.id, channelId) }) : await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
    if (!channel) return NextResponse.json({ error: 'No channel found' }, { status: 404 });
    let youtube;
    try {
      youtube = await getValidYouTubeClient(channel.id);
    } catch (error: any) {
      console.error('YouTube client error:', error);
      return NextResponse.json({ error: error.message || 'YouTube connection invalid. Please reconnect your channel.' }, { status: 400 });
    }
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
    let aiInsights = '';
    try {
      const model = process.env.OPENROUTER_AUDIT_MODEL || 'z-ai/glm-5-2';
      aiInsights = await generateOpenRouterCompletion(model, `Channel audit score: ${overallScore}. Metrics: ${JSON.stringify(metrics)}. Provide 3 prioritized improvement actions.`, 'You are a YouTube channel auditor.');
    } catch (error) {
      console.error('AI audit error:', error);
    }
    const finalRecommendations = [
      ...recommendations,
      ...(aiInsights ? [aiInsights] : []),
    ];
    let audit;
    try {
      audit = await db
        .insert(channelAudits)
        .values({
          userId: dbUser.id,
          channelId: channel.id,
          overallScore,
          metrics,
          recommendations: finalRecommendations,
        })
        .returning();
    } catch (error) {
      console.error('Database audit insert error:', error);
      return NextResponse.json({ error: 'Failed to save audit results' }, { status: 500 });
    }
    try {
      await db.update(channels).set({ auditScore: overallScore }).where(eq(channels.id, channel.id));
    } catch (error) {
      console.error('Database channel update error:', error);
    }
    return NextResponse.json({ audit: audit[0] });
  } catch (error: any) {
    console.error('Audit route error:', error);
    return NextResponse.json({ error: error.message || 'Audit failed' }, { status: 500 });
  }
}
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (!dbUser) return NextResponse.json({ audits: [] });
    const audits = await db.query.channelAudits.findMany({ where: eq(channelAudits.userId, dbUser.id), orderBy: [desc(channelAudits.createdAt)], limit: 10 });
    return NextResponse.json({ audits });
  } catch (error: any) {
    console.error('Audit GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load audits' }, { status: 500 });
  }
}
