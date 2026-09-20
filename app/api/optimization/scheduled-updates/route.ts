import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { scheduledUpdates, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, title, description, tags, scheduledAt } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const update = await db.insert(scheduledUpdates).values({ userId: dbUser!.id, videoId, title, description, tags, scheduledAt: new Date(scheduledAt) }).returning();
  return NextResponse.json({ update: update[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const updates = await db.query.scheduledUpdates.findMany({ where: eq(scheduledUpdates.userId, dbUser!.id), orderBy: [desc(scheduledUpdates.createdAt)] });
  return NextResponse.json({ updates });
}
