import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { videos, users, channels } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, dbUser!.id) });
  const channelIds = userChannels.map(c => c.id);
  const topVideos = await db.query.videos.findMany({ where: sql`${videos.channelId} IN ${channelIds}`, orderBy: [desc(videos.viewCount)], limit: 10 });
  return NextResponse.json({ videos: topVideos });
}
