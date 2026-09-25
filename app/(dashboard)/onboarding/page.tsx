"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Loader2, CheckCircle2, BarChart3, Sparkles, Rocket, ShieldCheck, Play } from "lucide-react";
import { cn } from "@/lib/utils";
const steps = [
  { title: "Connect YouTube", description: "Securely link your channel in one click.", icon: Video },
  { title: "AI Analysis", description: "We analyze your content and audience.", icon: BarChart3 },
  { title: "Grow Faster", description: "Get AI-powered recommendations and tools.", icon: Rocket },
];
export default function OnboardingPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const message = params.get('message');
    if (error === 'youtube_auth_failed') {
      const detail = message ? ` Details: ${message}` : '';
      setAuthError(`YouTube connection failed. This may be due to an expired session or revoked permissions.${detail} Please try again.`);
    }
  }, []);
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/channels', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.details || `Connection failed (${res.status})`);
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'No redirect URL returned');
    } catch (e: any) {
      console.error('Connect error:', e);
      setAuthError(e.message || 'Failed to connect channel');
    } finally {
      setIsConnecting(false);
    }
  };
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <Video className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to CreatorPulse</h1>
          <p className="text-muted-foreground max-w-md mx-auto">The AI-powered growth platform for YouTube creators. Connect your channel to get started.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <Card key={s.title} className={cn("transition-all", isActive ? "border-primary shadow-md" : "opacity-80")}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", isDone ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : isActive ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-muted text-muted-foreground")}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <CardDescription className="text-xs">{s.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardContent className="p-6">
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{authError}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Connect your YouTube channel</p>
                  <p className="text-xs text-muted-foreground">We only request read-only access to your analytics.</p>
                </div>
              </div>
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700" onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>) : ("Connect YouTube")}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Secure & Private</p>
              <p className="text-xs text-muted-foreground">Your data is encrypted and never shared.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">AI-Powered</p>
              <p className="text-xs text-muted-foreground">Get recommendations tailored to your channel.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Rocket className="h-5 w-5 text-violet-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Grow Faster</p>
              <p className="text-xs text-muted-foreground">Optimize titles, tags, thumbnails, and more.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
