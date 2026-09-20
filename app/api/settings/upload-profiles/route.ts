import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { uploadProfiles, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const profiles = await db.query.uploadProfiles.findMany({ where: eq(uploadProfiles.userId, dbUser!.id), orderBy: [desc(uploadProfiles.createdAt)] });
  return NextResponse.json({ profiles });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { name, title, description, tags, category, language, isDefault } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (isDefault) await db.update(uploadProfiles).set({ isDefault: false }).where(eq(uploadProfiles.userId, dbUser!.id));
  const profile = await db.insert(uploadProfiles).values({ userId: dbUser!.id, name, title, description, tags, category, language, isDefault }).returning();
  return NextResponse.json({ profile: profile[0] });
}
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { id, name, title, description, tags, category, language, isDefault } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (isDefault) await db.update(uploadProfiles).set({ isDefault: false }).where(eq(uploadProfiles.userId, dbUser!.id));
  const updated = await db.update(uploadProfiles).set({ name, title, description, tags, category, language, isDefault }).where(and(eq(uploadProfiles.id, id), eq(uploadProfiles.userId, dbUser!.id))).returning();
  return NextResponse.json({ profile: updated[0] });
}
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  await db.delete(uploadProfiles).where(and(eq(uploadProfiles.id, id!), eq(uploadProfiles.userId, dbUser!.id)));
  return NextResponse.json({ success: true });
}
