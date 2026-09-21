import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { dailyIdeas, users, channels, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { channelId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!isValidUuid(channelId)) {
    return NextResponse.json({ error: 'Invalid channel ID. Please connect a channel first.' }, { status: 400 });
  }
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  if (!channel) return NextResponse.json({ error: 'No channel found' }, { status: 404 });
  const recentVideos = await db.query.videos.findMany({ where: eq(videos.channelId, channel.id), orderBy: [desc(videos.publishedAt)], limit: 5 });
  const model = process.env.OPENROUTER_IDEAS_MODEL || process.env.OPENROUTER_COACH_MODEL || 'meta-llama/llama-4-maverick:free';
  const systemInstruction = 'You are a YouTube content strategist. Generate 5 specific video ideas based on the channel niche and recent content. Return as JSON array of objects with title, description, estimatedViews, competitionScore (1-100), trendScore (1-100).';
  const prompt = `Channel: ${channel.title}. Niche: ${channel.niche || 'general'}. Recent videos: ${recentVideos.map(v => v.title).join(', ')}. Generate 5 daily video ideas.`;
  const response = await generateOpenRouterCompletion(model, prompt, systemInstruction);
  let ideas: any[] = [];
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) ideas = JSON.parse(jsonMatch[0]);
  } catch {
    ideas = response.split('\n').filter((line: string) => line.trim().length > 10).map((title: string) => ({ title, description: '', estimatedViews: 1000, competitionScore: 50, trendScore: 50 }));
  }
  const inserted = await db.insert(dailyIdeas).values(ideas.map((idea: any) => ({ userId: dbUser.id, channelId: channel.id, title: idea.title || idea, description: idea.description || '', estimatedViews: idea.estimatedViews || 1000, competitionScore: idea.competitionScore || 50, trendScore: idea.trendScore || 50 }))).returning();
  return NextResponse.json({ ideas: inserted });
}
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ ideas: [] });
  const ideas = await db.query.dailyIdeas.findMany({ where: eq(dailyIdeas.userId, dbUser.id), orderBy: [desc(dailyIdeas.createdAt)], limit: 20 });
  return NextResponse.json({ ideas });
}
