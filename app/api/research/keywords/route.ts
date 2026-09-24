import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeKeyword } from '@/lib/youtube/research';
import { db } from '@/lib/db';
import { keywordSearches, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { query } = await request.json();
  try {
    const results = await analyzeKeyword(userId, query);
    let aiInsights = '';
    try {
      const model = process.env.OPENROUTER_KEYWORD_TRENDS_MODEL || 'google/gemma-3-26b-a4b';
      aiInsights = await generateOpenRouterCompletion(model, `Keyword: ${query}. Results: ${JSON.stringify(results)}. Suggest keyword strategy.`, 'You are a YouTube keyword strategist.');
    } catch (error) {
      console.error('AI keywords error:', error);
    }
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (dbUser) await db.insert(keywordSearches).values({ userId: dbUser.id, query, results }).returning();
    return NextResponse.json({ query, results, aiInsights });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
