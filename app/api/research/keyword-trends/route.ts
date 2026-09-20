import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { keywordTrends, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { query } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const data = Array.from({ length: 12 }, (_, i) => ({ month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }), volume: Math.floor(Math.random() * 100000) + 1000 }));
  const trend = await db.insert(keywordTrends).values({ userId: dbUser!.id, query, data }).returning();
  return NextResponse.json({ trend: trend[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const trends = await db.query.keywordTrends.findMany({ where: eq(keywordTrends.userId, dbUser!.id), orderBy: [desc(keywordTrends.createdAt)], limit: 20 });
  return NextResponse.json({ trends });
}
