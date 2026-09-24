import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiKey, corsResponse, corsOptions, getCorsHeaders } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return corsOptions(origin);
}
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const { error, userId } = await validatePublicApiKey(request);
  if (error) {
    const text = await error.text();
    return new Response(text, {
      status: error.status,
      headers: getCorsHeaders(origin),
    });
  }
  const userChannels = await db.query.channels.findMany({ where: eq(channels.userId, userId!) });
  return corsResponse({ channels: userChannels }, 200, origin);
}
