import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cards, users } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, elements } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const card = await db.insert(cards).values({ userId: dbUser!.id, videoId, elements }).returning();
  return NextResponse.json({ card: card[0] });
}
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const url = new URL(request.url);
  const videoId = url.searchParams.get('videoId');
  const where = videoId ? eq(cards.videoId, videoId) : eq(cards.userId, dbUser!.id);
  const cardsList = await db.query.cards.findMany({ where, orderBy: [desc(cards.createdAt)] });
  return NextResponse.json({ cards: cardsList });
}
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { id, elements } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const updated = await db.update(cards).set({ elements }).where(and(eq(cards.id, id), eq(cards.userId, dbUser!.id))).returning();
  return NextResponse.json({ card: updated[0] });
}
