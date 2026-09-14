import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function POST(request: NextRequest) {
  await auth();
  const { topic, tone, duration } = await request.json();
  const model = process.env.OPENROUTER_SCRIPT_MODEL || "google/gemini-2.0-flash-exp:free";
  const prompt = `Write a YouTube script. Topic: ${topic}. Tone: ${tone}. Duration: ${duration}. Include [VISUAL] and [AUDIO] cues.`;
  const systemInstruction = "You are an expert YouTube scriptwriter. Write engaging scripts with [VISUAL] and [AUDIO] cues.";
  const script = await generateOpenRouterCompletion(model, prompt, systemInstruction);
  return NextResponse.json({ script });
}
