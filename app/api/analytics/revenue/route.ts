import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getValidYouTubeClient } from '@/lib/youtube/client';
import { fetchRevenueData } from '@/lib/youtube/analytics';
export async function GET() {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser!.id) });
  if (!userChannel) return NextResponse.json({ error: 'Connect channel first' }, { status: 400 });
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 30);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  try {
    const youtube = await getValidYouTubeClient(userChannel.id);
    const token = (youtube as any)._options.auth?.credentials?.access_token;
    const data = await fetchRevenueData(token, userChannel.platformId, formatDate(start), formatDate(end));
    const parsedData = (data.rows || []).map((row: any) => ({ date: row[0], revenue: parseFloat(row[1]), views: parseInt(row[2]), watchTime: parseFloat(row[3]), rpm: parseInt(row[2]) > 0 ? (parseFloat(row[1]) / parseInt(row[2])) * 1000 : 0 }));
    return NextResponse.json(parsedData);
  } catch (error: any) { return NextResponse.json({ error: 'Failed to fetch revenue. Is your channel monetized?' }, { status: 500 }); }
}
