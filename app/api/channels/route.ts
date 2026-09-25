import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateOpenRouterCompletion } from '@/lib/ai/openrouter';
import { createOAuth2Client } from '@/lib/youtube/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId as string),
    });

    if (!dbUser) {
      return NextResponse.json({
        channels: [],
      });
    }

    const userChannels =
      await db.query.channels.findMany({
        where: eq(channels.userId, dbUser.id),
      });

    let aiInsights = '';

    try {
      const model =
        process.env.OPENROUTER_CHANNEL_MODEL ||
        'z-ai/glm-5-2';

      aiInsights =
        await generateOpenRouterCompletion(
          model,
          `User has ${userChannels.length} channels. Suggest channel management strategy.`,
          'You are a YouTube channel strategist.'
        );
    } catch (error) {
      console.error(
        'AI channels error:',
        error
      );
    }

    return NextResponse.json({
      channels: userChannels,
      aiInsights,
    });
  } catch (error: any) {
    console.error(
      'GET /api/channels error:',
      error
    );

    return NextResponse.json(
      {
        error: 'Failed to load channels',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let dbUser =
      await db.query.users.findFirst({
        where: eq(
          users.clerkId,
          userId as string
        ),
      });

    if (!dbUser) {
      const email = userId.includes('@')
        ? userId
        : `${userId}@clerk.local`;

      const inserted =
        await db
          .insert(users)
          .values({
            clerkId: userId,
            email,
            name: userId,
          })
          .returning();

      dbUser = inserted[0];
    }

    /*
     * Keep OAuth state tied to the authenticated
     * application user.
     */
    const state = encodeURIComponent(
      JSON.stringify({
        userId: dbUser.id,
        clerkId: userId,
      })
    );

    /*
     * Use the actual request origin instead of
     * relying on NEXT_PUBLIC_APP_URL.
     *
     * This guarantees that the callback belongs
     * to the production domain being used.
     */
    const origin = request.nextUrl.origin;

    const redirectUri =
      `${origin}/api/auth/youtube/callback`;

    /*
     * Use the same OAuth2 client implementation
     * that we already verified successfully in
     * Production.
     */
    const oauth2Client =
      createOAuth2Client(redirectUri);

    const authUrl =
      oauth2Client.generateAuthUrl({
        access_type: 'offline',

        scope: [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/yt-analytics.readonly',
          'https://www.googleapis.com/auth/youtube.force-ssl',
        ],

        state,

        prompt: 'consent',
      });

    return NextResponse.json({
      url: authUrl,
    });
  } catch (error: any) {
    console.error(
      'POST /api/channels error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Failed to start channel connect',
        details:
          error?.message ||
          'Unknown error',
      },
      { status: 500 }
    );
  }
}