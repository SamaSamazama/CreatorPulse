import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
import { db } from '@/lib/db';
import { transcriptAnalyses, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
function extractStructuredAnalysis(text: string) {
  const lower = text.toLowerCase();
  const keywords: string[] = [];
  const keywordMatch = text.match(/(?:keywords?|key terms?|main points?)[:\s]+([^\n]+)/i);
  if (keywordMatch) {
    keywords.push(...keywordMatch[1].split(',').map(k => k.trim()).filter(Boolean));
  }
  const summaryMatch = text.match(/(?:summary|overview|brief)[:\s]+([^\n]+)/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : text.slice(0, 300);
  const sentimentMatch = text.match(/(?:sentiment|tone|emotion)[:\s]+(positive|negative|neutral|informative|motivational|controversial)/i);
  const sentiment = sentimentMatch ? sentimentMatch[1].toLowerCase() : 'neutral';
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const recommendations = sentences.slice(-3).map(s => s.trim()).filter(Boolean);
  return {
    keywords: keywords.length > 0 ? keywords : extractKeywords(text),
    summary: summary || text.slice(0, 300),
    sentiment,
    recommendations: recommendations.length > 0 ? recommendations : ['Add a clear hook in the first 3 seconds', 'Use rhetorical questions to maintain engagement', 'Include a clear call-to-action at the end'],
  };
}
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const frequency = new Map<string, number>();
  words.forEach(word => frequency.set(word, (frequency.get(word) || 0) + 1));
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { transcript, competitorChannel } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const model = process.env.OPENROUTER_COACH_MODEL || 'google/gemini-2.0-flash-exp:free';
  const systemInstruction = 'You are a YouTube transcript analyst. Analyze the provided transcript and extract talking points, key segments, hook strategies, and retention techniques. Return structured analysis.';
  const prompt = `Transcript from ${competitorChannel || 'video'}:\n${transcript}\n\nAnalyze this transcript for talking points, structure, and retention tactics. Provide: 1) Top keywords, 2) Summary, 3) Sentiment, 4) Key recommendations.`;
  let analysisText = '';
  try {
    analysisText = await generateOpenRouterCompletion(model, prompt, systemInstruction);
  } catch (error) {
    console.error('AI analysis error:', error);
    analysisText = `Analysis of ${competitorChannel || 'video'} transcript. This content focuses on key topics with structured pacing.`;
  }
  const structured = extractStructuredAnalysis(analysisText);
  const analysis = await db.insert(transcriptAnalyses).values({ userId: dbUser!.id, transcriptText: transcript, keywords: structured.keywords, summary: structured.summary, sentiment: structured.sentiment === 'positive' ? 0.7 : structured.sentiment === 'negative' ? 0.3 : 0.5, recommendations: structured.recommendations }).returning();
  return NextResponse.json({ analysis: analysis[0] });
}
