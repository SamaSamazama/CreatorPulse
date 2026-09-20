import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { exports, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { type, format, url } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const exportRecord = await db.insert(exports).values({ userId: dbUser!.id, type, format, url }).returning();
  return NextResponse.json({ export: exportRecord[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const exportsList = await db.query.exports.findMany({ where: eq(exports.userId, dbUser!.id), orderBy: [desc(exports.createdAt)], limit: 50 });
  return NextResponse.json({ exports: exportsList });
}
