import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getValidAccessToken } from "@/lib/youtube/client";
import { fetchRevenueData } from "@/lib/youtube/analytics";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
    if (!userChannel) return NextResponse.json({ error: "Connect channel first" }, { status: 400 });
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    let parsed: any[] = [];
    try {
      const token = await getValidAccessToken(userChannel.id);
      const data = await fetchRevenueData(token, userChannel.platformId, fmt(start), fmt(end));
      parsed = (data.rows || []).map((row: any) => {
        const revenue = parseFloat(row[1]);
        const views = parseInt(row[2]);
        const watchTime = parseFloat(row[3]);
        return {
          date: row[0],
          revenue: isNaN(revenue) ? 0 : revenue,
          views: isNaN(views) ? 0 : views,
          watchTime: isNaN(watchTime) ? 0 : watchTime,
          rpm: views > 0 ? (revenue / views) * 1000 : 0,
        };
      });
    } catch (error) {
      console.error("Revenue fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch revenue. Is your channel monetized?" }, { status: 500 });
    }
    let aiInsights = "";
    try {
      const model = process.env.OPENROUTER_REVENUE_MODEL || "z-ai/glm-5-2";
      aiInsights = await generateOpenRouterCompletion(model, `Revenue data: ${JSON.stringify(parsed)}. Suggest monetization improvements.`, "You are a YouTube revenue strategist.");
    } catch (error) {
      console.error("AI revenue error:", error);
    }
    return NextResponse.json({ parsed, aiInsights });
  } catch (error: any) {
    console.error("Revenue route error:", error);
    return NextResponse.json({ error: error.message || "Revenue route failed" }, { status: 500 });
  }
}
