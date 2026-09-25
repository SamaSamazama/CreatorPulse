import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { endScreens, users } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, elements } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  let aiRecommendation = '';
  try {
    const model = process.env.OPENROUTER_END_SCREENS_MODEL || 'google/gemma-4-26b-a4b-it';
    aiRecommendation = await generateOpenRouterCompletion(model, `End screen elements: ${JSON.stringify(elements)}. Suggest optimal layout and content.`, 'You are a YouTube end screen strategist.');
  } catch (error) {
    console.error('AI end screens error:', error);
  }
  const endScreen = await db.insert(endScreens).values({ userId: dbUser!.id, videoId, elements: { ...elements, aiRecommendation } }).returning();
  return NextResponse.json({ endScreen: endScreen[0] });
}
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const url = new URL(request.url);
  const videoId = url.searchParams.get('videoId');
  const where = videoId ? eq(endScreens.videoId, videoId) : eq(endScreens.userId, dbUser!.id);
  const endScreensList = await db.query.endScreens.findMany({ where, orderBy: [desc(endScreens.createdAt)] });
  return NextResponse.json({ endScreens: endScreensList });
}
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { id, elements } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const updated = await db.update(endScreens).set({ elements }).where(and(eq(endScreens.id, id), eq(endScreens.userId, dbUser!.id))).returning();
  return NextResponse.json({ endScreen: updated[0] });
}
