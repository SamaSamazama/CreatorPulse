"use client";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Eye, Video, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export default function DashboardPage() {
  const { data, isLoading, refetch, isRefetching } = useDashboard();
  const router = useRouter();
  const [chartData, setChartData] = useState<{ name: string; views: number }[]>([]);
  useEffect(() => {
    if (data?.requiresOnboarding) router.push("/onboarding");
    if (data?.videos) setChartData(data.videos.slice(0, 10).reverse().map((v: any, i: number) => ({ name: `Video ${i + 1}`, views: v.viewCount })));
  }, [data, router]);
  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  const channel = data?.channel;
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => refetch()} disabled={isRefetching}><RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />Sync</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Subscribers" value={channel?.subscriberCount || 0} icon={Users} />
        <StatCard title="Total Views" value={channel?.viewCount || 0} icon={Eye} />
        <StatCard title="Total Videos" value={channel?.videoCount || 0} icon={Video} />
        <StatCard title="Est. Revenue" value="$0.00" icon={TrendingUp} />
      </div>
      <Card><CardHeader><CardTitle>Recent Performance</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} /></AreaChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle>Recent Videos</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Video</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader><TableBody>{data?.videos?.map((video: any) => (<TableRow key={video.id}><TableCell className="font-medium truncate max-w-xs">{video.title}</TableCell><TableCell className="text-right">{video.viewCount.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
}
