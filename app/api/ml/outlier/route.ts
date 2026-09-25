// @ts-nocheck
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, videos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([]);
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  if (!dbUser) return NextResponse.json([]);
  const channel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
  if (!channel) return NextResponse.json([]);
  const vids = await db.query.videos.findMany({ where: eq(videos.channelId, channel.id), orderBy: [desc(videos.publishedAt)], limit: 20 });
  const subs = Math.max(channel.subscriberCount, 1);
  const scored = vids.map(v => {
    const days = Math.max(Math.floor((Date.now() - new Date(v.publishedAt ?? Date.now()).getTime()) / 86400000), 1);
    const velocity = v.viewCount / days;
    const ratio = Math.min(v.viewCount / subs, 10);
    const score = Math.min(Math.round(Math.min(velocity / 100, 1) * 50 + (ratio / 10) * 50), 100);
    return { videoId: v.platformVideoId, title: v.title, viralityScore: score, isOutlier: ratio >= 2 };
  });
  const sorted = scored.sort((a, b) => b.viralityScore - a.viralityScore);
  let aiInterpretation = '';
  try {
    const model = process.env.OPENROUTER_OUTLIERS_MODEL || 'z-ai/glm-5.2';
    aiInterpretation = await generateOpenRouterCompletion(model, `Outlier videos: ${JSON.stringify(sorted.slice(0, 5))}. Interpret what makes them successful.`, 'You are a YouTube outlier analyst.');
  } catch (error) {
    console.error('AI outlier error:', error);
  }
  return NextResponse.json({ videos: sorted, aiInterpretation });
}
