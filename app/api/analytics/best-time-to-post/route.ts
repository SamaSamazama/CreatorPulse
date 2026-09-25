import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, users, videos } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
function computeBestPostingTime(channel: { subscriberCount?: number | null; videoCount?: number | null }) {
  const subscriberCount = Number(channel.subscriberCount || 0);
  const videoCount = Number(channel.videoCount || 0);
  const dayScore = Math.min(subscriberCount * 0.05, 6);
  const hourScore = Math.min(videoCount * 0.3, 12);
  const bestDay = Math.floor(dayScore) % 7;
  const bestHour = Math.floor(hourScore) % 24;
  const score = Math.min(Math.round((dayScore + hourScore) * 2), 100);
  return { day: bestDay, hour: bestHour, score };
}
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = channelId ? await db.query.channels.findFirst({ where: eq(channels.id, channelId) }) : await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  try {
    const youtube = await getValidYouTubeClient(channel.id);
    const videosRes = await youtube.search.list({ part: ['id'], channelId: channel.platformId, type: ['video'], maxResults: 10, order: 'date' });
    const videoIds = videosRes.data.items?.map(i => i.id?.videoId).filter(Boolean).join(',') || '';
    if (videoIds) {
      const vRes = await youtube.videos.list({ part: ['snippet', 'statistics'], id: videoIds.split(',') });
      const videosData = vRes.data.items || [];
      const hourCounts = new Array(24).fill(0);
      videosData.forEach(video => {
        const publishedAt = new Date(video.snippet?.publishedAt || '');
        const hour = publishedAt.getHours();
        hourCounts[hour] += parseInt(video.statistics?.viewCount || '0');
      });
      const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
      const bestTime = new Date();
      bestTime.setHours(bestHour, 0, 0, 0);
      await db.update(channels).set({ bestTimeToPost: bestTime }).where(eq(channels.id, channel.id));
      return NextResponse.json({ bestTimeToPost: bestTime.toISOString(), day: bestTime.getDay(), hour: bestHour, source: 'youtube_history' });
    }
  } catch (error) {
    console.error('YouTube best time calculation error:', error);
  }
  const { day, hour, score } = computeBestPostingTime(channel);
  const bestTime = new Date();
  bestTime.setHours(hour, 0, 0, 0);
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_CALENDAR_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Channel has ${channel.subscriberCount} subscribers. Best computed posting time: ${bestTime.toISOString()}. Suggest optimal content type and cadence.`, 'You are a YouTube publishing strategist.');
  } catch (error) {
    console.error('AI best time error:', error);
  }
  await db.update(channels).set({ bestTimeToPost: bestTime }).where(eq(channels.id, channel.id));
  return NextResponse.json({ bestTimeToPost: bestTime.toISOString(), day, hour, score, source: 'computed', aiSuggestion });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  return NextResponse.json({ bestTimeToPost: channel?.bestTimeToPost || null });
}
