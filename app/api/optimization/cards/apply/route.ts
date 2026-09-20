import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cards, users, channels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, elements } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const existing = await db.query.cards.findFirst({ where: and(eq(cards.videoId, videoId), eq(cards.userId, dbUser!.id)) });
  if (existing) {
    await db.update(cards).set({ elements }).where(eq(cards.id, existing.id));
  } else {
    await db.insert(cards).values({ userId: dbUser!.id, videoId, elements });
  }
  return NextResponse.json({ success: true, message: 'Card template saved. Apply in YouTube Studio.' });
}
