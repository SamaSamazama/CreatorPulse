import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { calendarEvents, users } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  const start = request.nextUrl.searchParams.get("start"); const end = request.nextUrl.searchParams.get("end");
  if (start && end) return NextResponse.json(await db.query.calendarEvents.findMany({ where: and(eq(calendarEvents.userId, dbUser!.id), gte(calendarEvents.scheduledAt, new Date(start)), lte(calendarEvents.scheduledAt, new Date(end))) }));
  return NextResponse.json(await db.query.calendarEvents.findMany({ where: eq(calendarEvents.userId, dbUser!.id) }));
}
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const { title, description, scheduledAt } = await request.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  return NextResponse.json((await db.insert(calendarEvents).values({ userId: dbUser!.id, title, description, scheduledAt: new Date(scheduledAt) }).returning())[0]);
}
