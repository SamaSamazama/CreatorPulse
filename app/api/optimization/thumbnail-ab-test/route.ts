import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { thumbnailAbTests, channels, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, variantThumbnail, action } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const youtube = await getValidYouTubeClient(userChannel!.id);
  if (action === 'start') {
    const video = await youtube.videos.list({ part: ['snippet'], id: [videoId] });
    const thumbnails = video.data.items?.[0]?.snippet?.thumbnails;
    const originalThumbnail = thumbnails?.maxres?.url || thumbnails?.high?.url || thumbnails?.default?.url || '';
    let aiComparison = '';
    try {
      const model = process.env.OPENROUTER_THUMBNAIL_AB_MODEL || 'google/gemma-3-26b-a4b';
      aiComparison = await generateOpenRouterCompletion(model, `Original: ${originalThumbnail}. Variant: ${variantThumbnail}. Compare click appeal.`, 'You are a YouTube thumbnail A/B testing expert.');
    } catch (error) {
      console.error('AI thumbnail A/B error:', error);
    }
    const test = await db.insert(thumbnailAbTests).values({ userId: dbUser!.id, videoId, originalThumbnail, variantThumbnail, status: 'active' }).returning();
    return NextResponse.json({ success: true, aiComparison });
  }
  if (action === 'end') {
    const test = await db.query.thumbnailAbTests.findFirst({ where: and(eq(thumbnailAbTests.videoId, videoId), eq(thumbnailAbTests.status, 'active')) });
    const keepVariant = request.nextUrl.searchParams.get('keep') === 'true';
    if (!keepVariant && test) {
      const currentVideo = await youtube.videos.list({ part: ['snippet'], id: [videoId] });
      const currentThumb = currentVideo.data.items?.[0]?.snippet?.thumbnails;
      const currentUrl = currentThumb?.maxres?.url || currentThumb?.high?.url || currentThumb?.default?.url || '';
      if (currentUrl !== test.originalThumbnail) {
        await youtube.thumbnails.set({ videoId: videoId });
      }
    }
    if (test) await db.update(thumbnailAbTests).set({ status: 'completed', endedAt: new Date() }).where(eq(thumbnailAbTests.id, test.id));
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const tests = await db.query.thumbnailAbTests.findMany({ where: eq(thumbnailAbTests.userId, dbUser!.id), orderBy: [desc(thumbnailAbTests.startedAt)] });
  return NextResponse.json({ tests });
}
