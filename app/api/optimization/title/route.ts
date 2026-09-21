import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function POST(request: NextRequest) {
  await auth();
  const { title, topic } = await request.json();
  try {
    const model = process.env.OPENROUTER_COACH_MODEL || "liquid/lfm-2.5-2.6b:free";
    const prompt = `Optimize this YouTube title for maximum CTR: "${title}". Topic: ${topic}. Return 5 optimized titles, one per line, no numbering.`;
    const result = await generateOpenRouterCompletion(model, prompt, "You are a YouTube title optimization expert.");
    const titles = result.split("\n").filter((t: string) => t.trim().length > 0).slice(0, 5);
    return NextResponse.json({ titles });
  } catch (error: any) {
    console.error("Title optimization error:", error);
    return NextResponse.json({ error: error.message || "Title optimization failed" }, { status: 500 });
  }
}
