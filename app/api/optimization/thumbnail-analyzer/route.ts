import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { thumbnailAnalyses, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { computeThumbnailScore } from '@/lib/scoring';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
import { getUserIdFromRequest, corsResponse, corsOptions } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return corsOptions(origin);
}
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  const { videoId, thumbnailUrl, score } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const computedScore = computeThumbnailScore({ thumbnailUrl, score });
  const readabilityIssues = computedScore < 70 ? ['Text too small', 'Low contrast'] : [];
  const suggestions = computedScore < 80 ? ['Add text overlay', 'Increase contrast', 'Use brighter colors'] : [];
  let aiAnalysis = '';
  try {
    const model = process.env.OPENROUTER_THUMBNAIL_ANALYZER_MODEL || 'google/gemma-3-26b-a4b';
    aiAnalysis = await generateOpenRouterCompletion(model, `Thumbnail URL: ${thumbnailUrl}. Score: ${computedScore}. Analyze visual appeal and suggest improvements.`, 'You are a YouTube thumbnail expert.');
  } catch (error) {
    console.error('AI thumbnail analyzer error:', error);
  }
  const analysis = await db.insert(thumbnailAnalyses).values({ userId: dbUser!.id, videoId, thumbnailUrl, score: computedScore, readabilityIssues, suggestions: [...suggestions, ...(aiAnalysis ? [aiAnalysis] : [])] }).returning();
  return corsResponse({ analysis: analysis[0] }, 200, request.headers.get('origin') || '');
}
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const analyses = await db.query.thumbnailAnalyses.findMany({ where: eq(thumbnailAnalyses.userId, dbUser!.id), orderBy: [desc(thumbnailAnalyses.createdAt)], limit: 20 });
  return corsResponse({ analyses }, 200, request.headers.get('origin') || '');
}
