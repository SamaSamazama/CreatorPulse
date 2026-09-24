import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { uploadProfiles, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
import { getUserIdFromRequest, corsResponse, corsOptions } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return corsOptions(origin);
}
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const profiles = await db.query.uploadProfiles.findMany({ where: eq(uploadProfiles.userId, dbUser!.id), orderBy: [desc(uploadProfiles.createdAt)] });
  return corsResponse({ profiles }, 200, request.headers.get('origin') || '');
}
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  const { name, title, description, tags, category, language, isDefault } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_UPLOAD_PROFILES_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Upload profile: ${name}. Title: ${title}. Category: ${category}. Suggest metadata improvements.`, 'You are a YouTube upload strategist.');
  } catch (error) {
    console.error('AI upload profile error:', error);
  }
  if (isDefault) await db.update(uploadProfiles).set({ isDefault: false }).where(eq(uploadProfiles.userId, dbUser!.id));
  const profile = await db.insert(uploadProfiles).values({ userId: dbUser!.id, name, title, description, tags, category, language, isDefault }).returning();
  return corsResponse({ profile: profile[0], aiSuggestion }, 200, request.headers.get('origin') || '');
}
export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  const { id, name, title, description, tags, category, language, isDefault } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (isDefault) await db.update(uploadProfiles).set({ isDefault: false }).where(eq(uploadProfiles.userId, dbUser!.id));
  const updated = await db.update(uploadProfiles).set({ name, title, description, tags, category, language, isDefault }).where(and(eq(uploadProfiles.id, id), eq(uploadProfiles.userId, dbUser!.id))).returning();
  return corsResponse({ profile: updated[0] }, 200, request.headers.get('origin') || '');
}
export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  await db.delete(uploadProfiles).where(and(eq(uploadProfiles.id, id!), eq(uploadProfiles.userId, dbUser!.id)));
  return corsResponse({ success: true }, 200, request.headers.get('origin') || '');
}
