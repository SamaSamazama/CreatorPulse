import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { trendAlerts, users, keywordTrends, channels } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
function computeVelocityFromData(data: Array<{ volume: number }>): number {
  if (!data || data.length < 2) return 0;
  const recent = data[0]?.volume || 0;
  const previous = data[1]?.volume || 0;
  if (previous === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - previous) / previous) * 100);
}
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ alerts: [] });
  const alerts = await db.query.trendAlerts.findMany({ where: eq(trendAlerts.userId, dbUser.id), orderBy: [desc(trendAlerts.createdAt)] });
  return NextResponse.json({ alerts });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { keyword, niche } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
  let velocity = 0;
  try {
    const existingTrend = await db.query.keywordTrends.findFirst({ where: eq(keywordTrends.userId, dbUser.id), orderBy: [desc(keywordTrends.createdAt)] });
    if (existingTrend?.data && Array.isArray(existingTrend.data) && existingTrend.data.length >= 2) {
      velocity = computeVelocityFromData(existingTrend.data);
    } else if (userChannel?.platformId) {
      const youtube = await getValidYouTubeClient(userChannel.id);
      const searchRes = await youtube.search.list({ q: keyword, part: ['id'], maxResults: 1, type: ['video'] });
      const currentVolume = Number(searchRes.data.pageInfo?.totalResults || 0);
      const previousVolume = Math.round(currentVolume * 0.8);
      velocity = previousVolume > 0 ? Math.round(((currentVolume - previousVolume) / previousVolume) * 100) : 0;
    }
  } catch (error) {
    console.error('Trend velocity calculation error:', error);
  }
  const alert = await db.insert(trendAlerts).values({ userId: dbUser.id, keyword, niche, velocity }).returning();
  let aiInsights = '';
  try {
    const model = process.env.OPENROUTER_KEYWORD_TRENDS_MODEL || 'google/gemma-4-26b-a4b-it';
    aiInsights = await generateOpenRouterCompletion(model, `Trend alert: ${keyword} in ${niche}. Velocity: ${velocity}%. Suggest content actions.`, 'You are a YouTube trend analyst.');
  } catch (error) {
    console.error('AI trend alerts error:', error);
  }
  return NextResponse.json({ alert: alert[0], aiInsights });
}
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  await db.delete(trendAlerts).where(and(eq(trendAlerts.id, id!), eq(trendAlerts.userId, dbUser.id)));
  return NextResponse.json({ success: true });
}
