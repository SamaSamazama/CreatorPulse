import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { thumbnailAnalyses, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, thumbnailUrl } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const score = Math.floor(Math.random() * 40) + 60;
  const readabilityIssues = score < 70 ? ['Text too small', 'Low contrast'] : [];
  const suggestions = score < 80 ? ['Add text overlay', 'Increase contrast', 'Use brighter colors'] : [];
  const analysis = await db.insert(thumbnailAnalyses).values({ userId: dbUser!.id, videoId, thumbnailUrl, score, readabilityIssues, suggestions }).returning();
  return NextResponse.json({ analysis: analysis[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const analyses = await db.query.thumbnailAnalyses.findMany({ where: eq(thumbnailAnalyses.userId, dbUser!.id), orderBy: [desc(thumbnailAnalyses.createdAt)], limit: 20 });
  return NextResponse.json({ analyses });
}
