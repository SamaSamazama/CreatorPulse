// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { abTests, users, channels } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getValidYouTubeClient } from "@/lib/youtube/client";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { videoId, variantTitle, action } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const youtube = await getValidYouTubeClient(userChannel!.id);
  if (action === "start") {
    const originalVideo = await youtube.videos.list({ part: ["snippet"], id: [videoId] });
    const origSnippet = originalVideo.data.items?.[0]?.snippet;
    let aiVariant = '';
    try {
      const model = process.env.OPENROUTER_AB_TESTING_MODEL || 'z-ai/glm-5.2';
      aiVariant = await generateOpenRouterCompletion(model, `Original title: ${origSnippet!.title}. Suggest a testable variant.`, 'You are a YouTube A/B testing expert.');
    } catch (error) {
      console.error('AI A/B test error:', error);
    }
    const test = await db.insert(abTests).values({ userId: dbUser!.id, videoId, originalTitle: origSnippet!.title, variantTitle: variantTitle, status: "active", aiVariant }).returning();
    return NextResponse.json({ success: true, aiVariant });
  }
  if (action === "end") {
    const test = await db.query.abTests.findFirst({ where: and(eq(abTests.videoId, videoId), eq(abTests.status, "active")) });
    const keepVariant = request.nextUrl.searchParams.get("keep") === "true";
    if (!keepVariant) {
      const currentVideo = await youtube.videos.list({ part: ["snippet"], id: [videoId] });
      await youtube.videos.update({ part: ["snippet"], requestBody: { id: videoId, snippet: { ...currentVideo.data.items?.[0]?.snippet, title: test!.originalTitle } } });
    }
    await db.update(abTests).set({ status: "completed", endedAt: new Date() }).where(eq(abTests.id, test!.id));
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  return NextResponse.json(await db.query.abTests.findMany({ where: eq(abTests.userId, dbUser!.id) }));
}
