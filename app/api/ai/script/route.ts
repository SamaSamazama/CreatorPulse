import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { scriptModel } from "@/lib/ai/gemini";
export async function POST(request: NextRequest) {
  await auth();
  const { topic, tone, duration } = await request.json();
  const result = await scriptModel.generateContent(`Write a YouTube script. Topic: ${topic}. Tone: ${tone}. Duration: ${duration}. Include [VISUAL] and [AUDIO] cues.`);
  return NextResponse.json({ script: result.response.text() });
}
