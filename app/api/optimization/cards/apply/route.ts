import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cards, users, channels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, elements } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const existing = await db.query.cards.findFirst({ where: and(eq(cards.videoId, videoId), eq(cards.userId, dbUser!.id)) });
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_CARDS_MODEL || 'google/gemma-3-26b-a4b';
    aiSuggestion = await generateOpenRouterCompletion(model, `Applying info card for video ${videoId}. Elements: ${JSON.stringify(elements)}. Suggest optimization tips.`, 'You are a YouTube info card strategist.');
  } catch (error) {
    console.error('AI card apply error:', error);
  }
  if (existing) {
    await db.update(cards).set({ elements }).where(eq(cards.id, existing.id));
  } else {
    await db.insert(cards).values({ userId: dbUser!.id, videoId, elements });
  }
  return NextResponse.json({ success: true, message: 'Card template saved. Apply in YouTube Studio.', aiSuggestion });
}
