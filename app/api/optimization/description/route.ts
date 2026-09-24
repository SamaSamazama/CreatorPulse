import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function POST(request: NextRequest) {
  await auth();
  const { topic, title, tone } = await request.json();
  try {
    const model = process.env.OPENROUTER_DESCRIPTION_MODEL || "meta-llama/llama-4-maverick:free";
    const prompt = `Write a YouTube video description. Title: "${title}". Topic: ${topic}. Tone: ${tone}. Include timestamps, call-to-action, and social links placeholders.`;
    const result = await generateOpenRouterCompletion(model, prompt, "You are a YouTube description writer.");
    return NextResponse.json({ description: result });
  } catch (error: any) {
    console.error("Description generation error:", error);
    return NextResponse.json({ error: error.message || "Description generation failed" }, { status: 500 });
  }
}
