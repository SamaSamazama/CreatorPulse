import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadProfiles, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserIdFromRequest, corsResponse, corsOptions } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return corsOptions(origin);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(request);
  if (!userId) return corsResponse({ error: 'Unauthorized' }, 401, request.headers.get('origin') || '');
  const profile = await db.query.uploadProfiles.findFirst({ where: and(eq(uploadProfiles.id, id), eq(uploadProfiles.userId, userId)) });
  if (!profile) return corsResponse({ error: 'Profile not found' }, 404, request.headers.get('origin') || '');
  return corsResponse({ profile }, 200, request.headers.get('origin') || '');
}
