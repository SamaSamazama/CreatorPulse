import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { demonetizationAudits, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const riskLevels = ['low', 'medium', 'high'];
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  const flags = riskLevel === 'low' ? [] : ['Brand mentions', 'Copyright music', 'Controversial topic'];
  const audit = await db.insert(demonetizationAudits).values({ userId: dbUser!.id, videoId, riskLevel, flags }).returning();
  return NextResponse.json({ audit: audit[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const audits = await db.query.demonetizationAudits.findMany({ where: eq(demonetizationAudits.userId, dbUser!.id), orderBy: [desc(demonetizationAudits.createdAt)] });
  return NextResponse.json({ audits });
}
