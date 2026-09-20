import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { keywordTrends, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
function deterministicVolume(seed: number, monthIndex: number): number {
  const base = 5000 + (seed % 50000);
  const variation = ((seed * (monthIndex + 1) * 9301 + 49297) % 10000) / 10000;
  return Math.round(base + variation * 40000);
}
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { query } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const seed = hashString(query || 'default');
  const data = Array.from({ length: 12 }, (_, i) => ({ month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }), volume: deterministicVolume(seed, i) }));
  const trend = await db.insert(keywordTrends).values({ userId: dbUser!.id, query, data }).returning();
  return NextResponse.json({ trend: trend[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const trends = await db.query.keywordTrends.findMany({ where: eq(keywordTrends.userId, dbUser!.id), orderBy: [desc(keywordTrends.createdAt)], limit: 20 });
  return NextResponse.json({ trends });
}
