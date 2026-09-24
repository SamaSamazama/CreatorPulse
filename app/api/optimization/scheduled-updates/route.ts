import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { scheduledUpdates, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, title, description, tags, scheduledAt } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_SCHEDULED_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Scheduled update for video ${videoId} at ${scheduledAt}. Title: ${title}. Suggest optimal timing and content.`, 'You are a YouTube scheduling assistant.');
  } catch (error) {
    console.error('AI scheduled error:', error);
  }
  const update = await db.insert(scheduledUpdates).values({ userId: dbUser!.id, videoId, title, description, tags, scheduledAt: new Date(scheduledAt) }).returning();
  return NextResponse.json({ update: update[0], aiSuggestion });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const updates = await db.query.scheduledUpdates.findMany({ where: eq(scheduledUpdates.userId, dbUser!.id), orderBy: [desc(scheduledUpdates.createdAt)] });
  return NextResponse.json({ updates });
}
