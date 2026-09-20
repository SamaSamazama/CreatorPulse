"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Plus, Trash2, RefreshCw, Loader2, ExternalLink, BarChart3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export default function ChannelsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['channels'], queryFn: async () => { const res = await fetch('/api/channels'); return res.json(); } });
  const removeMutation = useMutation({ mutationFn: async (channelId: string) => { const res = await fetch(`/api/channels/${channelId}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed'); return res.json(); }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels'] }) });
  const reconnectMutation = useMutation({ mutationFn: async (channelId: string) => { const res = await fetch(`/api/channels/${channelId}`, { method: 'PUT' }); if (!res.ok) throw new Error('Failed'); const data = await res.json(); window.location.href = data.url; }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels'] }) });
  const addChannel = async () => {
    try {
      const res = await fetch('/api/channels', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to add channel');
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      alert(e.message || 'Failed to add channel');
    }
  };
  useEffect(() => { if (!data?.channels?.length && !isLoading) { router.push('/onboarding'); } }, [data, isLoading, router]);
  if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
          <p className="text-muted-foreground mt-1">Manage your connected YouTube channels</p>
        </div>
        <Button onClick={addChannel}><Plus className="mr-2 h-4 w-4" />Add Channel</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.channels?.map((channel: any) => (
          <Card key={channel.id} className="group hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {channel.thumbnailUrl && <img src={channel.thumbnailUrl} className="h-12 w-12 rounded-full object-cover ring-2 ring-background" />}
                  <div>
                    <CardTitle className="text-base leading-tight">{channel.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">{channel.handle || channel.platformId}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">YouTube</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-xs text-muted-foreground">Subs</div>
                  <div className="text-sm font-semibold">{(channel.subscriberCount || 0).toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-xs text-muted-foreground">Views</div>
                  <div className="text-sm font-semibold">{(channel.viewCount || 0).toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-xs text-muted-foreground">Videos</div>
                  <div className="text-sm font-semibold">{(channel.videoCount || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard?channel=${channel.id}`)}>
                  <BarChart3 className="mr-2 h-4 w-4" />View Analytics
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => reconnectMutation.mutate(channel.id)} disabled={reconnectMutation.isPending}>
                  <RefreshCw className="mr-2 h-4 w-4" />Reconnect
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { if (confirm('Remove this channel?')) removeMutation.mutate(channel.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
