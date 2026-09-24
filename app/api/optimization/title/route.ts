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
    const { title, topic } = await request.json();
    try {
      const model = process.env.OPENROUTER_TITLE_MODEL || "meta-llama/llama-4-maverick:free";
      const prompt = `Optimize this YouTube title for maximum CTR: "${title}". Topic: ${topic}. Return 5 optimized titles, one per line, no numbering.`;
      const result = await generateOpenRouterCompletion(model, prompt, "You are a YouTube title optimization expert.");
      const titles = result.split("\n").filter((t: string) => t.trim().length > 0).slice(0, 5);
      return corsResponse({ titles }, 200, request.headers.get("origin") || "");
    } catch (error: any) {
      console.error("Title optimization error:", error);
      return corsResponse({ error: error.message || "Title optimization failed" }, 500, request.headers.get("origin") || "");
    }
  } catch (error: any) {
    console.error("Title route error:", error);
    return corsResponse({ error: error.message || "Title optimization failed" }, 500, request.headers.get("origin") || "");
  }
}
