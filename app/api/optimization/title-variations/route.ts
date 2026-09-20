import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { videos, users, channels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, currentTitle, currentDescription } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, dbUser!.id), orderBy: [desc(videos.publishedAt)], limit: 5 });
  const model = process.env.OPENROUTER_TITLE_MODEL || 'google/gemini-2.0-flash-exp:free';
  const systemInstruction = 'You are a YouTube SEO expert. Generate 5 optimized title variations for the given video. Return as JSON array of strings.';
  const prompt = `Current title: ${currentTitle}\nDescription: ${currentDescription}\nRecent videos: ${userVideos.map(v => v.title).join(', ')}\nGenerate 5 optimized titles.`;
  const response = await generateOpenRouterCompletion(model, prompt, systemInstruction);
  let titles: string[] = [];
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) titles = JSON.parse(jsonMatch[0]);
  } catch {
    titles = response.split('\n').filter((line: string) => line.trim().length > 5).slice(0, 5);
  }
  return NextResponse.json({ titles });
}
