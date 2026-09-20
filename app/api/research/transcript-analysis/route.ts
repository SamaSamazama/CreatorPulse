import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { transcript, competitorChannel } = await request.json();
  const model = process.env.OPENROUTER_COACH_MODEL || 'google/gemini-2.0-flash-exp:free';
  const systemInstruction = 'You are a YouTube transcript analyst. Analyze the provided transcript and extract talking points, key segments, hook strategies, and retention techniques. Return structured analysis.';
  const response = await generateOpenRouterCompletion(model, `Transcript from ${competitorChannel || 'video'}:\n${transcript}\n\nAnalyze this transcript for talking points, structure, and retention tactics.`, systemInstruction);
  return NextResponse.json({ analysis: response });
}
