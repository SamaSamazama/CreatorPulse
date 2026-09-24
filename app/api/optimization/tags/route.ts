import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserIdFromRequest, corsResponse, corsOptions } from "@/lib/api-auth";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  return corsOptions(origin);
}
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return corsResponse({ error: "Unauthorized" }, 401, request.headers.get("origin") || "");
    const { title, description, topic } = await request.json();
    try {
      const model = process.env.OPENROUTER_TAGS_MODEL || "meta-llama/llama-4-maverick:free";
      const prompt = `Generate YouTube tags for a video. Title: "${title}". Description: "${description}". Topic: ${topic}. Return comma-separated tags only, no explanation.`;
      const result = await generateOpenRouterCompletion(model, prompt, "You are a YouTube SEO expert.");
      const tags = result.split(",").map((t: string) => t.trim()).filter(Boolean);
      return corsResponse({ tags }, 200, request.headers.get("origin") || "");
    } catch (error: any) {
      console.error("Tag generation error:", error);
      return corsResponse({ error: error.message || "Tag generation failed" }, 500, request.headers.get("origin") || "");
    }
  } catch (error: any) {
    console.error("Tags route error:", error);
    return corsResponse({ error: error.message || "Tag generation failed" }, 500, request.headers.get("origin") || "");
  }
}
