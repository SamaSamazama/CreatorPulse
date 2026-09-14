import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiKey, corsResponse, corsOptions } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export async function OPTIONS() {
  return corsOptions();
}
export async function GET(req: NextRequest) {
  const { error, userId } = await validatePublicApiKey(req);
  if (error) return corsResponse(error, error.status);
  const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, userId!) });
  return corsResponse({ channels: userChannels });
}
