import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { demonetizationAudits, users, videos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
function computeDemonetizationRisk(title: string, description: string, tags: string[]): { riskLevel: string; flags: string[] } {
  const flaggedPhrases = ['copyright', 'music', 'brand', 'controversial', 'violence', 'hate', 'misinformation', 'medical', 'financial'];
  const text = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  const matches = flaggedPhrases.filter(phrase => text.includes(phrase));
  if (matches.length >= 3) return { riskLevel: 'high', flags: matches.slice(0, 5) };
  if (matches.length >= 1) return { riskLevel: 'medium', flags: matches };
  return { riskLevel: 'low', flags: [] };
}
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const video = await db.query.videos.findFirst({ where: eq(videos.id, videoId) });
  let riskLevel = 'low';
  let flags: string[] = [];
  if (video) {
    const computed = computeDemonetizationRisk(video.title || '', video.description || '', video.tags || []);
    riskLevel = computed.riskLevel;
    flags = computed.flags;
  }
  if (riskLevel !== 'high') {
    try {
      const model = process.env.OPENROUTER_COACH_MODEL || 'google/gemini-2.0-flash-exp:free';
      const prompt = `Analyze this YouTube video for monetization risk. Title: ${video?.title || ''}. Description: ${video?.description || ''}. Tags: ${(video?.tags || []).join(', ')}. Return risk level (low/medium/high) and flagged phrases.`;
      const response = await generateOpenRouterCompletion(model, prompt, 'You are a YouTube monetization expert. Analyze content for advertiser-friendly guidelines.');
      const lower = response.toLowerCase();
      if (lower.includes('high')) riskLevel = 'high';
      else if (lower.includes('medium') && riskLevel === 'low') riskLevel = 'medium';
      const aiFlags = response.match(/(?:flagged phrases?|risks?|issues?)[:\s]+([^\n]+)/i);
      if (aiFlags) flags.push(...aiFlags[1].split(',').map((f: string) => f.trim()).filter(Boolean));
    } catch (error) {
      console.error('AI monetization audit error:', error);
    }
  }
  const audit = await db.insert(demonetizationAudits).values({ userId: dbUser!.id, videoId, riskLevel, flags }).returning();
  return NextResponse.json({ audit: audit[0] });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const audits = await db.query.demonetizationAudits.findMany({ where: eq(demonetizationAudits.userId, dbUser!.id), orderBy: [desc(demonetizationAudits.createdAt)] });
  return NextResponse.json({ audits });
}
