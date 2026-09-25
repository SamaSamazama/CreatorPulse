import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { nicheLeaderboard, users, channels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
function computeNicheScore(channel: { subscriberCount?: number | null; viewCount?: number | null; videoCount?: number | null }) {
  const subscriberCount = Number(channel.subscriberCount || 0);
  const viewCount = Number(channel.viewCount || 0);
  const videoCount = Number(channel.videoCount || 0);
  const engagementScore = videoCount > 0 ? Math.min((viewCount / Math.max(subscriberCount, 1)) * 10, 100) : 0;
  const growthScore = Math.min(Math.log10(subscriberCount + 1) * 15, 100);
  const activityScore = Math.min(videoCount * 2, 100);
  const rawScore = engagementScore * 0.5 + growthScore * 0.3 + activityScore * 0.2;
  return Math.round(Math.min(rawScore, 100));
}
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const entries = await db.query.nicheLeaderboard.findMany({ where: eq(nicheLeaderboard.userId, dbUser!.id), orderBy: [desc(nicheLeaderboard.score)] });
  return NextResponse.json({ entries });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId, niche } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  const score = computeNicheScore(channel);
  const existingCount = await db.query.nicheLeaderboard.findMany({ where: eq(nicheLeaderboard.niche, niche) });
  const sortedEntries = [...existingCount, { score }].sort((a, b) => b.score - a.score);
  const rank = sortedEntries.findIndex(entry => entry.score === score) + 1;
  const entry = await db.insert(nicheLeaderboard).values({ userId: dbUser!.id, channelId, niche, rank, score }).returning();
  let aiInsights = '';
  try {
    const model = process.env.OPENROUTER_LEADERBOARD_MODEL || 'z-ai/glm-5-2';
    aiInsights = await generateOpenRouterCompletion(model, `Niche: ${niche}. Rank: ${rank}. Score: ${score}. Suggest how to climb the leaderboard.`, 'You are a YouTube niche strategist.');
  } catch (error) {
    console.error('AI leaderboard error:', error);
  }
  return NextResponse.json({ entry: entry[0], aiInsights });
}
