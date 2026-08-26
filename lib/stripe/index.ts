import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const PLANS = {
  free: { id: 'free', name: 'Free', price: 0, stripePriceId: '', features: ['1 Channel', '10 Keywords/day'] },
  starter: { id: 'starter', name: 'Starter', price: 19, stripePriceId: process.env.STRIPE_PRICE_STARTER ?? '', features: ['3 Channels', 'Unlimited Keywords', 'A/B Testing'] },
  pro: { id: 'pro', name: 'Pro', price: 49, stripePriceId: process.env.STRIPE_PRICE_PRO ?? '', features: ['10 Channels', 'AI Coach', 'Thumbnail AI'] },
  agency: { id: 'agency', name: 'Agency', price: 99, stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? '', features: ['Unlimited Channels', 'Team Seats', 'Public API'] },
};
export type PlanId = keyof typeof PLANS;
