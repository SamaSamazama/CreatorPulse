import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { thumbnailAnalyses, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { computeThumbnailScore } from '@/lib/scoring';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, thumbnailUrl, score } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const computedScore = computeThumbnailScore({ thumbnailUrl, score });
  const readabilityIssues = computedScore < 70 ? ['Text too small', 'Low contrast'] : [];
  const suggestions = computedScore < 80 ? ['Add text overlay', 'Increase contrast', 'Use brighter colors'] : [];
  const analysis = await db.insert(thumbnailAnalyses).values({ userId: dbUser!.id, videoId, thumbnailUrl, score: computedScore, readabilityIssues, suggestions }).returning();
  return NextResponse.json({ analysis: analysis[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const analyses = await db.query.thumbnailAnalyses.findMany({ where: eq(thumbnailAnalyses.userId, dbUser!.id), orderBy: [desc(thumbnailAnalyses.createdAt)], limit: 20 });
  return NextResponse.json({ analyses });
}
