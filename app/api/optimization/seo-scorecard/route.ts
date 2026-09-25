import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { videos, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { computeSeoScore } from '@/lib/scoring';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, title, description, tags } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const score = computeSeoScore({ title, description, tags });
  const suggestions: string[] = [];
  if (!title || title.length < 40) suggestions.push('Add primary keyword to title and aim for 40-70 characters');
  if (!description || description.length < 150) suggestions.push('Expand description to 150-300 words and include target keywords');
  const tagCount = Array.isArray(tags) ? tags.length : 0;
  if (tagCount < 5) suggestions.push('Add 5-10 relevant tags including broad and long-tail keywords');
  if (suggestions.length === 0) suggestions.push('Title, description, and tags look solid for this video.');
  let aiSuggestions = '';
  try {
    const model = process.env.OPENROUTER_SEO_SCORECARD_MODEL || 'z-ai/glm-5-2';
    aiSuggestions = await generateOpenRouterCompletion(model, `Title: ${title}. Description: ${description}. Tags: ${JSON.stringify(tags)}. Score: ${score}. Suggest SEO improvements.`, 'You are a YouTube SEO expert.');
  } catch (error) {
    console.error('AI SEO scorecard error:', error);
  }
  if (videoId && isValidUuid(videoId)) {
    await db.update(videos).set({ seoScore: score }).where(eq(videos.id, videoId));
  }
  return NextResponse.json({ score, suggestions, aiSuggestions });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, dbUser!.id), orderBy: [desc(videos.publishedAt)], limit: 20 });
  return NextResponse.json({ videos: userVideos });
}
