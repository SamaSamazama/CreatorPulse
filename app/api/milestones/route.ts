import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { milestones, users, channels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const userMilestones = await db.query.milestones.findMany({ where: eq(milestones.userId, dbUser!.id), orderBy: [desc(milestones.achievedAt)] });
  return NextResponse.json({ milestones: userMilestones });
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { channelId, type, value } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId as string) });
  const milestone = await db.insert(milestones).values({ userId: dbUser!.id, channelId, type, value }).returning();
  let aiSuggestion = '';
  try {
    const model = process.env.OPENROUTER_MILESTONES_MODEL || 'z-ai/glm-5-2';
    aiSuggestion = await generateOpenRouterCompletion(model, `Milestone: ${type} = ${value}. Suggest next milestone target and actions.`, 'You are a YouTube growth strategist.');
  } catch (error) {
    console.error('AI milestones error:', error);
  }
  return NextResponse.json({ milestone: milestone[0], aiSuggestion });
}
