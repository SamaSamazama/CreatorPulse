import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { endScreens, users, channels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, elements } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const youtube = await getValidYouTubeClient(userChannel!.id);
  const existing = await db.query.endScreens.findFirst({ where: and(eq(endScreens.videoId, videoId), eq(endScreens.userId, dbUser!.id)) });
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_END_SCREENS_MODEL || 'google/gemma-3-26b-a4b';
    aiSuggestion = await generateOpenRouterCompletion(model, `Applying end screen for video ${videoId}. Elements: ${JSON.stringify(elements)}. Suggest optimization tips.`, 'You are a YouTube end screen strategist.');
  } catch (error) {
    console.error('AI end screen apply error:', error);
  }
  if (existing) {
    await db.update(endScreens).set({ elements }).where(eq(endScreens.id, existing.id));
  } else {
    await db.insert(endScreens).values({ userId: dbUser!.id, videoId, elements });
  }
  return NextResponse.json({ success: true, message: 'End screen template saved. Apply in YouTube Studio.', aiSuggestion });
}
