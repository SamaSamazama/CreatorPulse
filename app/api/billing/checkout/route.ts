import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { priceId } = await req.json();
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId!) });
  let stripeCustomerId = dbUser!.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: dbUser!.email, metadata: { clerkId: userId! } });
    stripeCustomerId = customer.id;
    await db.update(users).set({ stripeCustomerId }).where(eq(users.id, dbUser!.id));
  }
  const session = await stripe.checkout.sessions.create({ customer: stripeCustomerId, line_items: [{ price: priceId, quantity: 1 }], mode: 'subscription', success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`, cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true` });
  return NextResponse.json({ url: session.url });
}
