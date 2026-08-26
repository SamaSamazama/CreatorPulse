import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, videos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ forecastedViews: [], trend: "no_data" });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json({ forecastedViews: [], trend: "no_data" });
  const channel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id), with: { videos: { orderBy: [desc(videos.publishedAt)], limit: 20 } } });
  if (!channel || !channel.videos?.length) return NextResponse.json({ forecastedViews: [], trend: "no_data" });
  const points = channel.videos.map(v => ({ x: Math.max(Math.floor((Date.now() - new Date(v.publishedAt ?? Date.now()).getTime()) / 86400000), 1), y: v.viewCount }));
  if (points.length < 3) return NextResponse.json({ forecastedViews: new Array(30).fill(0), trend: "insufficient_data" });
  const n = points.length;
  const sx = points.reduce((a, p) => a + p.x, 0);
  const sy = points.reduce((a, p) => a + p.y, 0);
  const sxy = points.reduce((a, p) => a + p.x * p.y, 0);
  const sxx = points.reduce((a, p) => a + p.x * p.x, 0);
  const denom = n * sxx - sx * sx || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const lastDay = Math.max(...points.map(p => p.x));
  const forecastedViews = Array.from({ length: 30 }, (_, i) => Math.max(0, Math.round(slope * (lastDay + i + 1) + intercept)));
  const trend = slope > 50 ? "growing" : slope < -50 ? "declining" : "stable";
  return NextResponse.json({ forecastedViews, trend });
}
