import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelytics, users, competitors } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { competitorId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const data = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, views: Math.floor(Math.random() * 50000) + 1000, subscribers: Math.floor(Math.random() * 500) + 10 }));
  const entry = await db.insert(channelytics).values({ userId: dbUser!.id, competitorId, data }).returning();
  return NextResponse.json({ entry: entry[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const entries = await db.query.channelytics.findMany({ where: eq(channelytics.userId, dbUser!.id), orderBy: [desc(channelytics.createdAt)] });
  return NextResponse.json({ entries });
}
