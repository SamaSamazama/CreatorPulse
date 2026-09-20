"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
export default function BillingPage() {
  const router = useRouter();
  const handleUpgrade = async (priceId: string) => {
    const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId }) });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upgrade your plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Unlock AI-powered growth tools, advanced analytics, and more. All plans include a 7-day free trial.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(PLANS).map((plan) => (
          <Card key={plan.id} className={cn("relative flex flex-col", plan.id === 'pro' ? "border-primary shadow-lg" : "")}>
            {plan.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" /> Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.id === 'pro' ? <Sparkles className="h-5 w-5 text-amber-500" /> : plan.id === 'agency' ? <Zap className="h-5 w-5 text-violet-500" /> : null}
                {plan.name}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <CardDescription>{plan.id === 'free' ? 'Free forever' : 'Billed monthly · Cancel anytime'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2 text-sm mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={cn("w-full", plan.id === 'pro' ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white" : "")}
                variant={plan.id === 'free' ? "secondary" : "default"}
                onClick={() => plan.price > 0 ? handleUpgrade(plan.stripePriceId) : router.push('/dashboard')}
              >
                {plan.price === 0 ? 'Current Plan' : 'Start Free Trial'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground">
        Secure payments powered by Stripe · 256-bit SSL encryption · Cancel anytime
      </div>
    </div>
  );
}
