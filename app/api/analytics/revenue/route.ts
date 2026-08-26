import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getValidAccessToken } from "@/lib/youtube/client";
import { fetchRevenueData } from "@/lib/youtube/analytics";
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
  if (!userChannel) return NextResponse.json({ error: "Connect channel first" }, { status: 400 });
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  try {
    const token = await getValidAccessToken(userChannel.id);
    const data = await fetchRevenueData(token, userChannel.platformId, fmt(start), fmt(end));
    const parsed = (data.rows || []).map((row: any) => ({ date: row[0], revenue: parseFloat(row[1]), views: parseInt(row[2]), watchTime: parseFloat(row[3]), rpm: parseInt(row[2]) > 0 ? (parseFloat(row[1]) / parseInt(row[2])) * 1000 : 0 }));
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch revenue. Is your channel monetized?" }, { status: 500 });
  }
}
