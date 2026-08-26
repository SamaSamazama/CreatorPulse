import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { webhooks, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  return NextResponse.json(await db.query.webhooks.findMany({ where: eq(webhooks.userId, dbUser!.id) }));
}
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { url, events } = await req.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  return NextResponse.json((await db.insert(webhooks).values({ userId: dbUser!.id, url, secret: crypto.randomBytes(16).toString('hex'), events: events || ['video.published'] }).returning())[0]);
}
export async function PUT(req: NextRequest) {
  const { id, isActive } = await req.json();
  await db.update(webhooks).set({ isActive }).where(eq(webhooks.id, id));
  return NextResponse.json({ success: true });
}
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(webhooks).where(eq(webhooks.id, id));
  return NextResponse.json({ success: true });
}
