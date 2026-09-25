import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

  return NextResponse.json({
    youtubeClientIdConfigured: Boolean(clientId),
    youtubeClientIdLength: clientId?.length ?? 0,

    youtubeClientSecretConfigured: Boolean(clientSecret),
    youtubeClientSecretLength: clientSecret?.length ?? 0,

    youtubeRedirectUriConfigured: Boolean(redirectUri),
    youtubeRedirectUri: redirectUri ?? null,

    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}