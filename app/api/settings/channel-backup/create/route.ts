import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelBackups, users, channels, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { resolveUserChannel } from '@/lib/db/resolve-channel';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { channelId } = await request.json().catch(() => ({}));
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const channel = await resolveUserChannel(dbUser.id, channelId);
  if (!channel) return NextResponse.json({ error: 'No channel found. Please connect a channel first.' }, { status: 404 });
  const channelVideos = await db.query.videos.findMany({ where: eq(videos.channelId, channel.id) });
  const size = channelVideos.length * 1024;
  const backup = await db.insert(channelBackups).values({ userId: dbUser.id, channelId: channel.id, size }).returning();
  await db.update(channels).set({ channelBackupAt: new Date() }).where(eq(channels.id, channel.id));
  return NextResponse.json({ backup: backup[0], videoCount: channelVideos.length });
}
