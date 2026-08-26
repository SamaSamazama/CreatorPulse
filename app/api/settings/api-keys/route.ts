import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { apiKeys, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  const keys = await db.query.apiKeys.findMany({ where: eq(apiKeys.userId, dbUser!.id) });
  return NextResponse.json(keys.map(k => ({ ...k, apiKey: `${k.apiKey.substring(0, 8)}...${k.apiKey.substring(k.apiKey.length - 4)}` })));
}
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { name } = await req.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  const newKey = `cp_live_${crypto.randomBytes(24).toString('hex')}`;
  return NextResponse.json((await db.insert(apiKeys).values({ userId: dbUser!.id, apiKey: newKey, name: name || 'Default' }).returning())[0]);
}
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
  return NextResponse.json({ success: true });
}
