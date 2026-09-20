import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { videos, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, title, description, tags } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const score = Math.floor(Math.random() * 30) + 70;
  await db.update(videos).set({ seoScore: score }).where(eq(videos.id, videoId));
  return NextResponse.json({ score, suggestions: ['Add primary keyword to title', 'Include keyword in first 100 characters', 'Add 3-5 relevant tags'] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, dbUser!.id), orderBy: [desc(videos.publishedAt)], limit: 20 });
  return NextResponse.json({ videos: userVideos });
}
