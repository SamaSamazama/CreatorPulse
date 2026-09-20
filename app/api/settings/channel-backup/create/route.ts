import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelBackups, users, channels, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channelVideos = await db.query.videos.findMany({ where: eq(videos.channelId, channelId) });
  const size = channelVideos.length * 1024;
  const backup = await db.insert(channelBackups).values({ userId: dbUser!.id, channelId, size }).returning();
  await db.update(channels).set({ channelBackupAt: new Date() }).where(eq(channels.id, channelId));
  return NextResponse.json({ backup: backup[0], videoCount: channelVideos.length });
}
