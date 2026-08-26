import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { thumbnailGenerations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { prompt } = await request.json();
  const response = await openai.images.generate({ model: "gpt-image-1", prompt: `Highly engaging YouTube thumbnail, vibrant colors, wide format. Subject: ${prompt}`, n: 1, size: "1536x1024" });
  const b64 = response.data?.[0]?.b64_json ?? "";
  const imageUrl = `data:image/png;base64,${b64}`;
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (dbUser) await db.insert(thumbnailGenerations).values({ userId: dbUser.id, prompt, imageUrl });
  return NextResponse.json({ imageUrl, prompt });
}
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([]);
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json([]);
  return NextResponse.json(await db.query.thumbnailGenerations.findMany({ where: eq(thumbnailGenerations.userId, dbUser.id), limit: 20 }));
}
