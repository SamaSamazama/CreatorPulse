import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeKeyword } from '@/lib/youtube/research';
import { db } from '@/lib/db';
import { keywordSearches, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { query } = await request.json();
  try {
    const results = await analyzeKeyword(userId, query);
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
    if (dbUser) await db.insert(keywordSearches).values({ userId: dbUser.id, query, results });
    return NextResponse.json({ query, results });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
