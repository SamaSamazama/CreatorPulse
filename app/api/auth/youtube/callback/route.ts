import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client } from '@/lib/youtube/client';
import { db } from '@/lib/db';
import { channels, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code'); const state = searchParams.get('state');
  if (!code || !state) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token) throw new Error('Failed to retrieve access token');
    oauth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelResponse = await youtube.channels.list({ part: ['snippet', 'statistics'], mine: true });
    const ytChannel = channelResponse.data.items?.[0];
    if (!ytChannel || !ytChannel.id) throw new Error('Could not fetch channel');
    let stateObj: { userId?: string; clerkId?: string; reconnect?: string } = {};
    try { stateObj = JSON.parse(decodeURIComponent(state)); } catch {}
    const clerkId = stateObj.clerkId || state;
    let dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
    if (!dbUser) {
      const email = clerkId.includes('@') ? clerkId : `${clerkId}@clerk.local`;
      const inserted = await db.insert(users).values({ clerkId, email, name: clerkId }).returning();
      dbUser = inserted[0];
    }
    const values = {
      userId: dbUser.id, platformId: ytChannel.id, platform: 'youtube' as const, title: ytChannel.snippet?.title || 'Unknown',
      handle: ytChannel.snippet?.customUrl, thumbnailUrl: ytChannel.snippet?.thumbnails?.default?.url,
      subscriberCount: parseInt(ytChannel.statistics?.subscriberCount || '0'), viewCount: parseInt(ytChannel.statistics?.viewCount || '0'),
      videoCount: parseInt(ytChannel.statistics?.videoCount || '0'), accessToken: tokens.access_token, refreshToken: tokens.refresh_token || null,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null, lastSyncedAt: new Date(),
    };
    if (stateObj.reconnect) {
      await db.update(channels).set(values).where(eq(channels.id, stateObj.reconnect));
    } else {
      const existing = await db.query.channels.findFirst({ where: eq(channels.platformId, ytChannel.id) });
      if (existing) {
        await db.update(channels).set(values).where(eq(channels.id, existing.id));
      } else {
        await db.insert(channels).values(values);
      }
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) { console.error('YouTube callback error:', error); return NextResponse.redirect(new URL('/onboarding?error=youtube_auth_failed', request.url)); }
}
