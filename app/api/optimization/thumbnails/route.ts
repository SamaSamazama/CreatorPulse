import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { thumbnailGenerations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  await auth();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { prompt } = await request.json();
  const imagePrompt = `Describe a highly engaging YouTube thumbnail in vivid visual detail for: ${prompt}`;
  const description = await generateOpenRouterCompletion(process.env.OPENROUTER_THUMBNAIL_MODEL || process.env.OPENROUTER_COACH_MODEL || "liquid/lfm-2.5-2.6b:free", imagePrompt, "You are a thumbnail design expert. Return only a concise visual description.");
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (dbUser) await db.insert(thumbnailGenerations).values({ userId: dbUser.id, prompt, imageUrl: description });
  return NextResponse.json({ description, prompt });
}
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([]);
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json([]);
  return NextResponse.json(await db.query.thumbnailGenerations.findMany({ where: eq(thumbnailGenerations.userId, dbUser.id), limit: 20 }));
}
