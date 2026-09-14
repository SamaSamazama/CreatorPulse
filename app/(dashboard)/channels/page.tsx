"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export default function ChannelsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['channels'], queryFn: async () => { const res = await fetch('/api/channels'); return res.json(); } });
  const removeMutation = useMutation({ mutationFn: async (channelId: string) => { const res = await fetch(`/api/channels/${channelId}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed'); return res.json(); }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels'] }) });
  const reconnectMutation = useMutation({ mutationFn: async (channelId: string) => { const res = await fetch(`/api/channels/${channelId}`, { method: 'PUT' }); if (!res.ok) throw new Error('Failed'); const data = await res.json(); window.location.href = data.url; }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels'] }) });
  const addChannel = async () => { const res = await fetch('/api/channels', { method: 'POST' }); const data = await res.json(); if (data.url) window.location.href = data.url; };
  useEffect(() => { if (!data?.channels?.length && !isLoading) { router.push('/onboarding'); } }, [data, isLoading, router]);
  if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Channels</h1>
        <Button onClick={addChannel}><Plus className="mr-2 h-4 w-4" />Add Channel</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.channels?.map((channel: any) => (
          <Card key={channel.id}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-red-500" />{channel.title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {channel.thumbnailUrl && <img src={channel.thumbnailUrl} className="h-16 w-16 rounded-full object-cover" />}
                <div>
                  <p className="font-semibold">{channel.title}</p>
                  <p className="text-sm text-muted-foreground">{channel.handle || channel.platformId}</p>
                  <p className="text-sm text-muted-foreground">{(channel.subscriberCount || 0).toLocaleString()} subscribers</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => reconnectMutation.mutate(channel.id)} disabled={reconnectMutation.isPending}>
                  <RefreshCw className="mr-2 h-4 w-4" />Reconnect
                </Button>
                <Button variant="destructive" onClick={() => { if (confirm('Remove this channel?')) removeMutation.mutate(channel.id); }}>
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
