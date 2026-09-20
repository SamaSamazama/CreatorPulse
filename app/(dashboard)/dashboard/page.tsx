"use client";
import { useDashboard, useSyncDashboard } from "@/lib/hooks/use-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Eye, Video, TrendingUp, RefreshCw, VideoIcon, Crown, Zap, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
export default function DashboardPage() {
  const router = useRouter();
  const [chartData, setChartData] = useState<{ name: string; views: number }[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { data, isLoading, refetch, isRefetching } = useDashboard(selectedChannelId || undefined);
  const syncDashboard = useSyncDashboard();
  useEffect(() => {
    if (data?.requiresOnboarding) router.push("/onboarding");
    if (data?.channels?.length && !selectedChannelId) setSelectedChannelId(data.channels[0].id);
    if (data?.videos) setChartData(data.videos.slice(0, 10).reverse().map((v: any, i: number) => ({ name: `Video ${i + 1}`, views: v.viewCount })));
  }, [data, router, selectedChannelId]);
  const currentChannel = data?.channels?.find((c: any) => c.id === selectedChannelId) || data?.channel;
  const handleChannelChange = (channelId: string) => { setSelectedChannelId(channelId); };
  const handleSync = async () => { await syncDashboard(selectedChannelId || undefined); refetch(); };
  if (isLoading) return <div className="p-8 space-y-6"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div><Skeleton className="h-96 w-full" /></div>;
  const channels = data?.channels || (data?.channel ? [data.channel] : []);
  if (!isLoading && !channels.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">No channel connected yet</h2>
          <p className="text-muted-foreground max-w-md">Connect your YouTube channel to unlock AI-powered insights, analytics, and growth tools.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="bg-red-600 hover:bg-red-700" onClick={async () => { const res = await fetch('/api/channels', { method: 'POST' }); const data = await res.json(); if (data.url) window.location.href = data.url; else alert(data.error || data.details || 'Failed to connect'); }}>Connect YouTube</Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/dashboard/settings')}>View Features</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl">
          <Card><CardHeader><CardTitle className="text-base">Analytics</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Deep insights into your channel performance</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">AI Tools</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Generate titles, tags, and scripts with AI</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Growth</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Optimize thumbnails, schedules, and revenue</p></CardContent></Card>
        </div>
      </div>
    );
  }
  const isPro = false;
  const trialDaysLeft = 3;
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back{currentChannel?.title ? ` · ${currentChannel.title}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <Button variant="outline" className="gap-2" onClick={() => router.push('/dashboard/settings/billing')}>
              <Crown className="h-4 w-4 text-amber-500" />
              Upgrade to Pro
            </Button>
          )}
          <Button onClick={handleSync} disabled={isRefetching} variant={isRefetching ? "secondary" : "default"}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            {isRefetching ? "Syncing..." : "Sync"}
          </Button>
        </div>
      </div>
      {!isPro && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">You're on the Free trial</p>
                <p className="text-xs text-muted-foreground mt-0.5">{trialDaysLeft} days left · Upgrade to unlock AI tools, revenue tracking, and more.</p>
              </div>
            </div>
            <Button size="sm" className="shrink-0" onClick={() => router.push('/dashboard/settings/billing')}>
              Upgrade Now <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}
      {channels.length > 1 && (
        <div className="flex items-center gap-4">
          <VideoIcon className="h-5 w-5 text-muted-foreground" />
          <select value={selectedChannelId || ''} onChange={(e) => handleChannelChange(e.target.value)} className="border rounded-lg px-3 py-2 bg-background">
            {channels.map((ch: any) => (<option key={ch.id} value={ch.id}>{ch.title}</option>))}
          </select>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Subscribers" value={currentChannel?.subscriberCount || 0} icon={Users} trend="+12% this month" />
        <StatCard title="Total Views" value={currentChannel?.viewCount || 0} icon={Eye} trend="+8% this month" />
        <StatCard title="Total Videos" value={currentChannel?.videoCount || 0} icon={Video} />
        <StatCard title="Est. Revenue" value="$0.00" icon={TrendingUp} trend="+5% this month" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
            <CardDescription>Views over your latest videos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Channel Health</CardTitle>
            <CardDescription>Based on recent uploads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Engagement</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Consistency</span>
                <span className="font-medium">64%</span>
              </div>
              <Progress value={64} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Growth</span>
                <span className="font-medium">91%</span>
              </div>
              <Progress value={91} className="h-2" />
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full" size="sm" onClick={() => router.push('/dashboard/ai-coach')}>
                <Sparkles className="mr-2 h-4 w-4" /> Get AI Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>Your latest uploads and performance</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/channels')}>View all</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.videos?.map((video: any) => (
                <TableRow key={video.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/channels/${currentChannel?.id}`)}>
                  <TableCell className="font-medium truncate max-w-xs">{video.title}</TableCell>
                  <TableCell className="text-right">{video.viewCount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{video.likeCount?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-right">{video.commentCount?.toLocaleString() ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
