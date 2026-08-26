import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export async function POST(req: NextRequest) {
  const body = await req.text(); const sig = req.headers.get('stripe-signature')!;
  let event;
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!); } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 400 }); }
  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as any;
    const customerId = subscription.customer as string;
    const dbUser = await db.query.users.findFirst({ where: eq(users.stripeCustomerId, customerId) });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const priceId = subscription.plan?.id || subscription.price?.id;
    let tier = 'free';
    if (priceId === process.env.STRIPE_PRICE_STARTER) tier = 'starter';
    if (priceId === process.env.STRIPE_PRICE_PRO) tier = 'pro';
    if (priceId === process.env.STRIPE_PRICE_AGENCY) tier = 'agency';
    await db.update(users).set({ subscriptionTier: tier as any }).where(eq(users.id, dbUser.id));
  }
  return NextResponse.json({ received: true });
}
