import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelAudits, channels, users } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
import { computeAuditMetrics } from '@/lib/scoring';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------
    // 1. Authenticate user
    // ------------------------------------------------------------
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------
    // 2. Read request body safely
    //
    // The frontend currently sends an empty POST body in some cases.
    // Do NOT let request.json() crash the entire route.
    // ------------------------------------------------------------
    let body: { channelId?: unknown } = {};

    try {
      const rawBody = await request.text();

      if (rawBody.trim()) {
        const parsed = JSON.parse(rawBody);

        if (parsed && typeof parsed === 'object') {
          body = parsed;
        }
      }
    } catch (error) {
      console.warn('Audit request body could not be parsed:', error);
    }

    const requestedChannelId =
      typeof body.channelId === 'string' ? body.channelId : undefined;

    // ------------------------------------------------------------
    // 3. Find database user
    // ------------------------------------------------------------
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ------------------------------------------------------------
    // 4. Validate channel ID if supplied
    // ------------------------------------------------------------
    if (requestedChannelId && !isValidUuid(requestedChannelId)) {
      return NextResponse.json(
        {
          error:
            'Invalid channel ID format. Please select a connected channel.',
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 5. Find channel belonging to THIS user
    //
    // Important:
    // The previous code allowed a channel to be selected by ID
    // without checking channel.userId.
    // ------------------------------------------------------------
    const channel = requestedChannelId
      ? await db.query.channels.findFirst({
          where: and(
            eq(channels.id, requestedChannelId),
            eq(channels.userId, dbUser.id)
          ),
        })
      : await db.query.channels.findFirst({
          where: eq(channels.userId, dbUser.id),
        });

    if (!channel) {
      return NextResponse.json(
        {
          error:
            'No connected YouTube channel found. Please connect your YouTube channel first.',
        },
        { status: 404 }
      );
    }

    // ------------------------------------------------------------
    // 6. Get valid YouTube client
    // ------------------------------------------------------------
    let youtube;

    try {
      youtube = await getValidYouTubeClient(channel.id);
    } catch (error: any) {
      console.error('YouTube client error:', error);

      return NextResponse.json(
        {
          error:
            error?.message ||
            'YouTube connection is invalid. Please reconnect your channel.',
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 7. Fetch YouTube channel + videos
    // ------------------------------------------------------------
    let channelData: any = {};
    let videosData: any[] = [];

    try {
      const channelRes = await youtube.channels.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [channel.platformId],
      });

      channelData = channelRes.data.items?.[0] || {};

      const videosRes = await youtube.search.list({
        part: ['id'],
        channelId: channel.platformId,
        type: ['video'],
        maxResults: 50,
        order: 'date',
      });

      const videoIds =
        videosRes.data.items
          ?.map((item) => item.id?.videoId)
          .filter(Boolean)
          .join(',') || '';

      if (videoIds) {
        const videosResponse = await youtube.videos.list({
          part: ['snippet', 'statistics'],
          id: videoIds.split(','),
        });

        videosData = videosResponse.data.items || [];
      }
    } catch (error) {
      console.error('YouTube API error:', error);

      // We intentionally continue.
      // The scoring system can still calculate what it has.
    }

    // ------------------------------------------------------------
    // 8. Build metrics payload
    // ------------------------------------------------------------
    const statistics = channelData.statistics || {};

    const metricsPayload = {
      channel: {
        subscriberCount: statistics.subscriberCount
          ? Number(statistics.subscriberCount)
          : null,

        videoCount: statistics.videoCount
          ? Number(statistics.videoCount)
          : null,

        viewCount: statistics.viewCount
          ? Number(statistics.viewCount)
          : null,
      },

      videosList: videosData.map((video) => ({
        snippet: video.snippet,
        statistics: video.statistics,
      })),
    };

    // ------------------------------------------------------------
    // 9. Calculate deterministic audit metrics
    // ------------------------------------------------------------
    const {
      overallScore,
      metrics,
      recommendations,
    } = computeAuditMetrics(metricsPayload);

    // ------------------------------------------------------------
    // 10. Generate AI recommendations
    // ------------------------------------------------------------
    let aiInsights = '';

    try {
      const configuredModel =
        process.env.OPENROUTER_AUDIT_MODEL?.trim();

      const model =
        configuredModel || 'openrouter/free';

      const prompt = `
You are analyzing a YouTube channel.

Channel audit score: ${overallScore}

Metrics:
${JSON.stringify(metrics, null, 2)}

Existing recommendations:
${JSON.stringify(recommendations, null, 2)}

Provide exactly 3 prioritized improvement actions.

For each action include:
1. Priority
2. Problem
3. Recommended action
4. Expected impact

Keep the response practical and specific to YouTube creators.
`;

      aiInsights = await generateOpenRouterCompletion(
        model,
        prompt,
        'You are an expert YouTube channel auditor. Give concise, practical recommendations.'
      );
    } catch (error) {
      console.error('AI audit error:', error);

      // AI failure must NOT prevent the normal audit from being saved.
      aiInsights = '';
    }

    // ------------------------------------------------------------
    // 11. Combine recommendations
    // ------------------------------------------------------------
    const finalRecommendations = [
      ...recommendations,
      ...(aiInsights ? [aiInsights] : []),
    ];

    // ------------------------------------------------------------
    // 12. Save audit
    // ------------------------------------------------------------
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

      return NextResponse.json(
        {
          error: 'Failed to save audit results',
        },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------
    // 13. Update channel score
    // ------------------------------------------------------------
    try {
      await db
        .update(channels)
        .set({
          auditScore: overallScore,
        })
        .where(
          and(
            eq(channels.id, channel.id),
            eq(channels.userId, dbUser.id)
          )
        );
    } catch (error) {
      console.error('Database channel update error:', error);
    }

    // ------------------------------------------------------------
    // 14. Return successful result
    // ------------------------------------------------------------
    return NextResponse.json({
      success: true,
      audit: audit[0],
    });
  } catch (error: any) {
    console.error('Audit route error:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Audit failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json({
        audits: [],
      });
    }

    const audits = await db.query.channelAudits.findMany({
      where: eq(channelAudits.userId, dbUser.id),
      orderBy: [desc(channelAudits.createdAt)],
      limit: 10,
    });

    return NextResponse.json({
      success: true,
      audits,
    });
  } catch (error: any) {
    console.error('Audit GET error:', error);

    return NextResponse.json(
      {
        error:
          error?.message || 'Failed to load audits',
      },
      { status: 500 }
    );
  }
}