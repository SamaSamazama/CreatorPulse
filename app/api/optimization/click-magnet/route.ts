import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { videos, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, title, description } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const model = process.env.OPENROUTER_TITLE_MODEL || 'google/gemini-2.0-flash-exp:free';
  const systemInstruction = 'You are a YouTube optimization expert. Score the combination of title and thumbnail for click-through rate potential. Return JSON with score (1-100) and reasoning.';
  const prompt = `Title: ${title}\nDescription: ${description}\nScore this for CTR potential.`;
  const response = await generateOpenRouterCompletion(model, prompt, systemInstruction);
  let score = 75;
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      score = parsed.score || 75;
    }
  } catch {
    score = parseInt(response.match(/\d+/)?.[0] || '75');
  }
  await db.update(videos).set({ clickMagnetScore: score }).where(eq(videos.id, videoId));
  return NextResponse.json({ score, reasoning: response });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, dbUser!.id), orderBy: [desc(videos.publishedAt)], limit: 20 });
  return NextResponse.json({ videos: userVideos });
}
