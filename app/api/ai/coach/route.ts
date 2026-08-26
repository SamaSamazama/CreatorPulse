import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { coachModel } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { channels, videos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { prompt } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, dbUser!.id), with: { videos: { orderBy: [desc(videos.publishedAt)], limit: 5 } } });
  const channelContext = userChannels.map(c => ({ name: c.title, subs: c.subscriberCount, recentVideos: c.videos?.map(v => ({ title: v.title, views: v.viewCount })) || [] }));
  const result = await coachModel.generateContent(`Channel Context: ${JSON.stringify(channelContext)}\nUser Question: ${prompt}`);
  return NextResponse.json({ response: result.response.text() });
}
