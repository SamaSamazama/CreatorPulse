import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { sunsetVideos, channels, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { id } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const sunset = await db.query.sunsetVideos.findFirst({ where: and(eq(sunsetVideos.id, id), eq(sunsetVideos.userId, dbUser!.id)) });
  if (!sunset) return NextResponse.json({ error: 'Sunset video not found' }, { status: 404 });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const youtube = await getValidYouTubeClient(userChannel!.id);
  await youtube.videos.update({ part: ['status'], requestBody: { id: sunset.videoId, status: { privacyStatus: 'private' } } });
  await db.update(sunsetVideos).set({ status: 'completed' }).where(eq(sunsetVideos.id, id));
  return NextResponse.json({ success: true });
}
