import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { thumbnailGenerations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { prompt } = await request.json();
  const response = await openai.images.generate({ model: "dall-e-3", prompt: `Highly engaging YouTube thumbnail, vibrant colors, 16:9. Subject: ${prompt}`, n: 1, size: "1792x1024" });
  const imageUrl = response.data[0].url;
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  if (dbUser) await db.insert(thumbnailGenerations).values({ userId: dbUser.id, prompt, imageUrl });
  return NextResponse.json({ imageUrl, prompt });
}
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  if (!dbUser) return NextResponse.json([]);
  return NextResponse.json(await db.query.thumbnailGenerations.findMany({ where: eq(thumbnailGenerations.userId, dbUser.id), limit: 20 }));
}
