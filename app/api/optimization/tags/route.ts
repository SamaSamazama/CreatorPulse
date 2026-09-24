import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function POST(request: NextRequest) {
  await auth();
  const { title, description, topic } = await request.json();
  try {
    const model = process.env.OPENROUTER_TAGS_MODEL || "meta-llama/llama-4-maverick:free";
    const prompt = `Generate YouTube tags for a video. Title: "${title}". Description: "${description}". Topic: ${topic}. Return comma-separated tags only, no explanation.`;
    const result = await generateOpenRouterCompletion(model, prompt, "You are a YouTube SEO expert.");
    const tags = result.split(",").map((t: string) => t.trim()).filter(Boolean);
    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error("Tag generation error:", error);
    return NextResponse.json({ error: error.message || "Tag generation failed" }, { status: 500 });
  }
}
