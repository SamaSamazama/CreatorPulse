import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { commentTemplates, users } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ templates: [] });
  const templates = await db.query.commentTemplates.findMany({ where: eq(commentTemplates.userId, dbUser.id), orderBy: [desc(commentTemplates.createdAt)] });
  return NextResponse.json({ templates });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { name, content } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const template = await db.insert(commentTemplates).values({ userId: dbUser!.id, name, content }).returning();
  return NextResponse.json({ template: template[0] });
}
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { id, name, content } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const updated = await db.update(commentTemplates).set({ name, content }).where(and(eq(commentTemplates.id, id), eq(commentTemplates.userId, dbUser!.id))).returning();
  return NextResponse.json({ template: updated[0] });
}
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  await db.delete(commentTemplates).where(and(eq(commentTemplates.id, id!), eq(commentTemplates.userId, dbUser!.id)));
  return NextResponse.json({ success: true });
}
