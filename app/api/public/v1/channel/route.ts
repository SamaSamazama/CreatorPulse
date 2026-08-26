import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiKey } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export async function GET(req: NextRequest) {
  const { error, userId } = await validatePublicApiKey(req);
  if (error) return error;
  return NextResponse.json({ channels: await db.query.channels.findMany({ where: eq(channels.userId, userId!) }) });
}
