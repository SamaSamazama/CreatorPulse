"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/stripe";
export default function BillingPage() {
  const handleUpgrade = async (priceId: string) => { const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId }) }); const { url } = await res.json(); if (url) window.location.href = url; };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Billing</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(PLANS).map((plan) => (<Card key={plan.id} className={plan.id === 'pro' ? 'border-primary' : ''}><CardHeader><CardTitle>{plan.name}</CardTitle><p className="text-3xl font-bold mt-2">${plan.price}/mo</p></CardHeader><CardContent><ul className="space-y-2 text-sm mb-4">{plan.features.map((f) => (<li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" />{f}</li>))}</ul><Button className="w-full" onClick={() => plan.price > 0 && handleUpgrade(plan.stripePriceId)}>{plan.price === 0 ? 'Current' : 'Upgrade'}</Button></CardContent></Card>))}
      </div>
    </div>
  );
}
