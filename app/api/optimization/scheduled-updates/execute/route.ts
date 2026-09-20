import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { scheduledUpdates, channels, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { id } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const update = await db.query.scheduledUpdates.findFirst({ where: and(eq(scheduledUpdates.id, id), eq(scheduledUpdates.userId, dbUser!.id)) });
  if (!update) return NextResponse.json({ error: 'Scheduled update not found' }, { status: 404 });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const youtube = await getValidYouTubeClient(userChannel!.id);
  await youtube.videos.update({ part: ['snippet'], requestBody: { id: update.videoId, snippet: { title: update.title, description: update.description, tags: update.tags } } });
  await db.update(scheduledUpdates).set({ status: 'completed' }).where(eq(scheduledUpdates.id, id));
  return NextResponse.json({ success: true });
}
