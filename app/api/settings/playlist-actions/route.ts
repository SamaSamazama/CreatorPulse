import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { playlistActions, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { playlistId, videoId, action } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_PLAYLISTS_MODEL || 'google/gemma-3-26b-a4b';
    aiSuggestion = await generateOpenRouterCompletion(model, `Playlist action: ${action} for playlist ${playlistId}, video ${videoId}. Suggest playlist organization strategy.`, 'You are a YouTube playlist strategist.');
  } catch (error) {
    console.error('AI playlist error:', error);
  }
  const playlistAction = await db.insert(playlistActions).values({ userId: dbUser!.id, playlistId, videoId, action }).returning();
  return NextResponse.json({ action: playlistAction[0], aiSuggestion });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const actions = await db.query.playlistActions.findMany({ where: eq(playlistActions.userId, dbUser!.id), orderBy: [desc(playlistActions.createdAt)] });
  return NextResponse.json({ actions });
}
