import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  const bestTime = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  await db.update(channels).set({ bestTimeToPost: bestTime }).where(eq(channels.id, channelId));
  return NextResponse.json({ bestTimeToPost: bestTime.toISOString(), day: bestTime.toLocaleDateString('en-US', { weekday: 'long' }), hour: bestTime.getHours() });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  return NextResponse.json({ bestTimeToPost: channel?.bestTimeToPost || null });
}
