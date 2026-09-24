import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { webhooks, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json([]);
  return NextResponse.json(await db.query.webhooks.findMany({ where: eq(webhooks.userId, dbUser.id) }));
}
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { url, events } = await req.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_SETTINGS_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Webhook URL: ${url}, events: ${JSON.stringify(events)}. Suggest webhook best practices.`, 'You are a webhook configuration advisor.');
  } catch (error) {
    console.error('AI webhooks error:', error);
  }
  return NextResponse.json({ ...(await db.insert(webhooks).values({ userId: dbUser.id, url, secret: crypto.randomBytes(16).toString('hex'), events: events || ['video.published'] }).returning())[0], aiSuggestion });
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
