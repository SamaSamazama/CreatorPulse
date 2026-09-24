import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getValidYouTubeClient } from "@/lib/youtube/client";
import { generateOpenRouterCompletion } from "@/lib/ai/openrouter";
export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  const { videoIds, appendTags, appendDescription } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  const youtube = await getValidYouTubeClient(userChannel!.id);
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_BULK_EDITOR_MODEL || 'meta-llama/llama-4-maverick:free';
    aiSuggestion = await generateOpenRouterCompletion(model, `Bulk updating ${videoIds.length} videos with tags: ${appendTags}, description append: ${appendDescription}. Suggest best practices.`, 'You are a YouTube bulk editor assistant.');
  } catch (error) {
    console.error('AI bulk update error:', error);
  }
  for (const vid of videoIds) {
    const current = await youtube.videos.list({ part: ["snippet"], id: [vid] });
    const snippet = current.data.items?.[0]?.snippet;
    if (!snippet) continue;
    await youtube.videos.update({ part: ["snippet"], requestBody: { id: vid, snippet: { ...snippet, tags: appendTags ? [...(snippet.tags || []), ...appendTags] : snippet.tags, description: appendDescription ? `${snippet.description}\n\n${appendDescription}` : snippet.description } } });
  }
  return NextResponse.json({ successCount: videoIds.length, aiSuggestion });
}
