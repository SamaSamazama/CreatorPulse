import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { videos, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { type, format } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userVideos = await db.query.videos.findMany({ where: eq(videos.channelId, dbUser!.id) });
  let url = '';
  if (format === 'csv') {
    const headers = 'Title,Views,Likes,Comments,Published At\n';
    const rows = userVideos.map((v: any) => `"${v.title}",${v.viewCount},${v.likeCount},${v.commentCount},${v.publishedAt}`).join('\n');
    url = `data:text/csv;charset=utf-8,${encodeURIComponent(headers + rows)}`;
  } else {
    url = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(userVideos, null, 2))}`;
  }
  const exportRecord = (await db.insert(exports).values({ userId: dbUser!.id, type, format, url }).returning()) as any[];
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_SETTINGS_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Generated ${format} export with ${userVideos.length} videos. Suggest analysis or next steps.`, 'You are a YouTube analytics assistant.');
  } catch (error) {
    console.error('AI export generate error:', error);
  }
  return NextResponse.json({ export: exportRecord[0], url, aiSuggestion });
}
