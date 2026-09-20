import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channelBackups, users, channels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  const backup = await db.insert(channelBackups).values({ userId: dbUser!.id, channelId: channel!.id, size: Math.floor(Math.random() * 1000000) }).returning();
  await db.update(channels).set({ channelBackupAt: new Date() }).where(eq(channels.id, channelId));
  return NextResponse.json({ backup: backup[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const backups = await db.query.channelBackups.findMany({ where: eq(channelBackups.userId, dbUser!.id), orderBy: [desc(channelBackups.createdAt)], limit: 10 });
  return NextResponse.json({ backups });
}
