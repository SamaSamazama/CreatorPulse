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
    if (!tokens.access_token || !tokens.refresh_token) throw new Error('Failed to retrieve tokens');
    oauth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelResponse = await youtube.channels.list({ part: ['snippet', 'statistics'], mine: true });
    const ytChannel = channelResponse.data.items?.[0];
    if (!ytChannel || !ytChannel.id) throw new Error('Could not fetch channel');
    const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, state) });
    if (!dbUser) throw new Error('User not found');
    await db.insert(channels).values({
      userId: dbUser.id, platformId: ytChannel.id, platform: 'youtube', title: ytChannel.snippet?.title || 'Unknown',
      handle: ytChannel.snippet?.customUrl, thumbnailUrl: ytChannel.snippet?.thumbnails?.default?.url,
      subscriberCount: parseInt(ytChannel.statistics?.subscriberCount || '0'), viewCount: parseInt(ytChannel.statistics?.viewCount || '0'),
      videoCount: parseInt(ytChannel.statistics?.videoCount || '0'), accessToken: tokens.access_token, refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null, lastSyncedAt: new Date(),
    }).onConflictDoUpdate({ target: channels.platformId, set: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token, tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null, lastSyncedAt: new Date() } });
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) { return NextResponse.redirect(new URL('/dashboard?error=youtube_auth_failed', request.url)); }
}
