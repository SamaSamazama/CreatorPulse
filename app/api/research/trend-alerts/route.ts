import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { trendAlerts, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ alerts: [] });
  const alerts = await db.query.trendAlerts.findMany({ where: eq(trendAlerts.userId, dbUser.id), orderBy: [desc(trendAlerts.createdAt)] });
  return NextResponse.json({ alerts });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { keyword, niche } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const velocity = Math.floor(Math.random() * 100);
  const alert = await db.insert(trendAlerts).values({ userId: dbUser!.id, keyword, niche, velocity }).returning();
  return NextResponse.json({ alert: alert[0] });
}
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  await db.delete(trendAlerts).where(and(eq(trendAlerts.id, id!), eq(trendAlerts.userId, dbUser!.id)));
  return NextResponse.json({ success: true });
}
