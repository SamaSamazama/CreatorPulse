import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, videos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { prompt } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  try {
    const userChannels = await db.query.channels.findMany({
      where: eq(channels.userId, dbUser.id),
      with: { videos: { orderBy: [desc(videos.publishedAt)], limit: 5 } },
    });
    const channelContext = userChannels.map((c) => ({
      name: c.title,
      subs: c.subscriberCount,
      recentVideos: c.videos?.map((v) => ({ title: v.title, views: v.viewCount })) || [],
    }));
    const model = process.env.OPENROUTER_COACH_MODEL || "meta-llama/llama-4-maverick:free";
    const systemInstruction = "You are CreatorPulse AI, an expert YouTube channel coach. Provide highly specific, data-driven advice.";
    const response = await generateOpenRouterCompletion(
      model,
      `Channel Context: ${JSON.stringify(channelContext)}\nUser Question: ${prompt}`,
      systemInstruction
    );
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("AI coach error:", error);
    return NextResponse.json({ error: error.message || "AI coach failed" }, { status: 500 });
  }
}
