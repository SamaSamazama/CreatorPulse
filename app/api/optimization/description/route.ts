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
    const { topic, title, tone } = await request.json();
    try {
      const model = process.env.OPENROUTER_DESCRIPTION_MODEL || "z-ai/glm-5-2";
      const prompt = `Write a YouTube video description. Title: "${title}". Topic: ${topic}. Tone: ${tone}. Include timestamps, call-to-action, and social links placeholders.`;
      const result = await generateOpenRouterCompletion(model, prompt, "You are a YouTube description writer.");
      return corsResponse({ description: result }, 200, request.headers.get("origin") || "");
    } catch (error: any) {
      console.error("Description generation error:", error);
      return corsResponse({ error: error.message || "Description generation failed" }, 500, request.headers.get("origin") || "");
    }
  } catch (error: any) {
    console.error("Description route error:", error);
    return corsResponse({ error: error.message || "Description generation failed" }, 500, request.headers.get("origin") || "");
  }
}
