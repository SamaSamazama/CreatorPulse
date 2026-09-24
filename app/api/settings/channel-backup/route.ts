import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelBackups, users, channels, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  const channelVideos = await db.query.videos.findMany({ where: eq(videos.channelId, channelId) });
  const size = channelVideos.length * 2048;
  const backup = await db.insert(channelBackups).values({ userId: dbUser!.id, channelId: channel!.id, size }).returning();
  await db.update(channels).set({ channelBackupAt: new Date() }).where(eq(channels.id, channelId));
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_SETTINGS_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Channel backup created with ${channelVideos.length} videos. Suggest backup cadence and retention strategy.`, 'You are a YouTube channel backup advisor.');
  } catch (error) {
    console.error('AI backup error:', error);
  }
  return NextResponse.json({ backup: backup[0], videoCount: channelVideos.length, aiSuggestion });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const backups = await db.query.channelBackups.findMany({ where: eq(channelBackups.userId, dbUser!.id), orderBy: [desc(channelBackups.createdAt)], limit: 10 });
  return NextResponse.json({ backups });
}
