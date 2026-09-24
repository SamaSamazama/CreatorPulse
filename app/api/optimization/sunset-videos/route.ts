import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { sunsetVideos, users } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, reason, scheduledAt } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_SUNSET_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Video ${videoId} sunset reason: ${reason}. Suggest cleanup or repurposing actions.`, 'You are a YouTube content lifecycle strategist.');
  } catch (error) {
    console.error('AI sunset error:', error);
  }
  const sunset = await db.insert(sunsetVideos).values({ userId: dbUser!.id, videoId, reason, scheduledAt: new Date(scheduledAt) }).returning();
  return NextResponse.json({ sunset: sunset[0], aiSuggestion });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const sunsets = await db.query.sunsetVideos.findMany({ where: eq(sunsetVideos.userId, dbUser!.id), orderBy: [desc(sunsetVideos.createdAt)] });
  return NextResponse.json({ sunsets });
}
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  await db.delete(sunsetVideos).where(and(eq(sunsetVideos.id, id!), eq(sunsetVideos.userId, dbUser!.id)));
  return NextResponse.json({ success: true });
}
