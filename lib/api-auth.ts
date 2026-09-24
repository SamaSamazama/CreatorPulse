// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Redis } from '@upstash/redis';

const isRedisValid = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_URL.startsWith('https');
const redis = isRedisValid
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN || 'fake' })
  : { get: async () => null, set: async () => {} };

export async function validatePublicApiKey(req: NextRequest) {
  if (process.env.ENABLE_PUBLIC_API === 'false') {
    return { error: NextResponse.json({ error: 'Public API is currently disabled' }, { status: 503 }), userId: null };
  }
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!apiKey) return { error: NextResponse.json({ error: 'Missing API key' }, { status: 401 }), userId: null };
  const keyRecord = await db.query.apiKeys.findFirst({ where: eq(apiKeys.apiKey, apiKey) });
  if (!keyRecord) return { error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }), userId: null };
  if (isRedisValid) {
    const rateLimitKey = `ratelimit:${apiKey}`;
    const current = await redis.get(rateLimitKey);
    if (current && (current as number) >= 60) return { error: NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }), userId: null };
    await redis.set(rateLimitKey, ((current as number) || 0) + 1, { ex: 60 });
  }
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id));
  return { error: null, userId: keyRecord.userId };
}

const allowedOrigins = [
  'http://localhost:3000',
  'https://my-project-sooty-tau-51.vercel.app',
  'https://www.youtube.com',
  'https://studio.youtube.com',
];

const getCorsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  'Access-Control-Max-Age': '86400',
});

export function corsResponse(body: any, status = 200, origin = '') {
  return NextResponse.json(body, {
    status,
    headers: getCorsHeaders(origin),
  });
}
export function corsOptions(origin = '') {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
export async function getUserIdFromRequest(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  if (apiKey) {
    const keyRecord = await db.query.apiKeys.findFirst({ where: eq(apiKeys.apiKey, apiKey) });
    if (keyRecord) return keyRecord.userId;
  }
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {
    // Clerk auth not available
  }
  return null;
}
