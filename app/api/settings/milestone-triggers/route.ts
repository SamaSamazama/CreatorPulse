import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { milestones, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const triggers = await db.query.milestones.findMany({ where: eq(milestones.userId, dbUser!.id), orderBy: [desc(milestones.achievedAt)] });
  return NextResponse.json({ triggers });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId, type, value } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const trigger = await db.insert(milestones).values({ userId: dbUser!.id, channelId, type, value }).returning();
  return NextResponse.json({ trigger: trigger[0] });
}
