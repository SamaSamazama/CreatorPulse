import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, videos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  const channel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id), with: { videos: { orderBy: [desc(videos.publishedAt)], limit: 20 } } });
  if (!channel || !channel.videos.length) return NextResponse.json({ forecastedViews: [], trend: "no_data" });
  const historicalViews = channel.videos.map(v => v.viewCount);
  const daysSinceUpload = channel.videos.map(v => Math.floor((Date.now() - new Date(v.publishedAt!).getTime()) / (1000 * 60 * 60 * 24)));
  const res = await fetch(`${process.env.ML_SERVICE_URL}/predict/forecast`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ historicalViews, daysSinceUpload }) });
  return NextResponse.json(await res.json());
}
