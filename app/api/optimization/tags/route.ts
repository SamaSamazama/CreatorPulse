import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function POST(request: NextRequest) {
  await auth();
  const { title, description, topic } = await request.json();
  const model = process.env.OPENROUTER_COACH_MODEL || "liquid/lfm-2.5-2.6b:free";
  const prompt = `Generate YouTube tags for a video. Title: "${title}". Description: "${description}". Topic: ${topic}. Return comma-separated tags only, no explanation.`;
  const result = await generateOpenRouterCompletion(model, prompt, "You are a YouTube SEO expert.");
  const tags = result.split(",").map((t: string) => t.trim()).filter(Boolean);
  return NextResponse.json({ tags });
}
