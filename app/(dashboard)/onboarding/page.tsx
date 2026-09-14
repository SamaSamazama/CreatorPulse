"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Loader2 } from "lucide-react";
export default function OnboardingPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/channels', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error('Connect error:', e);
      setIsConnecting(false);
    }
  };
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader><Video className="h-12 w-12 mx-auto text-red-600 mb-4" /><CardTitle>Connect Your Channel</CardTitle><CardDescription>To get started, connect your YouTube channel.</CardDescription></CardHeader>
        <CardContent><Button onClick={handleConnect} disabled={isConnecting} size="lg" className="w-full bg-red-600 hover:bg-red-700">{isConnecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Video className="mr-2 h-5 w-5" />}{isConnecting ? 'Connecting...' : 'Connect YouTube'}</Button></CardContent>
      </Card>
    </div>
  );
}
