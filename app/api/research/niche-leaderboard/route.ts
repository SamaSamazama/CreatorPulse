import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { nicheLeaderboard, users, channels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const entries = await db.query.nicheLeaderboard.findMany({ where: eq(nicheLeaderboard.userId, dbUser!.id), orderBy: [desc(nicheLeaderboard.score)] });
  return NextResponse.json({ entries });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId, niche, score } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  const existingCount = await db.query.nicheLeaderboard.findMany({ where: eq(nicheLeaderboard.niche, niche) });
  const rank = existingCount.length + 1;
  const entry = await db.insert(nicheLeaderboard).values({ userId: dbUser!.id, channelId, niche, rank, score: score || 0 }).returning();
  return NextResponse.json({ entry: entry[0] });
}
