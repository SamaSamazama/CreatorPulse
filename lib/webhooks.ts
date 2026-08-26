import { db } from '@/lib/db';
import { webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
export async function triggerWebhooks(userId: string, event: string, payload: any) {
  const userWebhooks = await db.query.webhooks.findMany({ where: eq(webhooks.userId, userId) });
  for (const webhook of userWebhooks) {
    if (!webhook.isActive || !webhook.events.includes(event)) continue;
    const signature = crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(payload)).digest('hex');
    try {
      await fetch(webhook.url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CreatorPulse-Signature': signature, 'X-CreatorPulse-Event': event }, body: JSON.stringify(payload) });
    } catch (e) { console.error(`Failed to trigger webhook ${webhook.id}`, e); }
  }
}
