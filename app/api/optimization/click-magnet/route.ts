import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { videos, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { computeClickMagnetScore } from '@/lib/scoring';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, title, description } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const score = computeClickMagnetScore({ title, description });
  const reasoning = `This title/description combination has a ${score}/100 estimated CTR potential based on length and structure heuristics.`;
  if (videoId && isValidUuid(videoId)) {
    await db.update(videos).set({ clickMagnetScore: score }).where(eq(videos.id, videoId));
  }
  return NextResponse.json({ score, reasoning });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, dbUser!.id), orderBy: [desc(videos.publishedAt)], limit: 20 });
  return NextResponse.json({ videos: userVideos });
}
