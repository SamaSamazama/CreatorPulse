"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, Eye, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export default function RevenuePage() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { fetch("/api/analytics/revenue").then(r => r.json()).then(setData); }, []);
  const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0);
  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Revenue Analytics</h1>
      <div className="grid md:grid-cols-3 gap-4"><StatCard title="Revenue (30d)" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} /><StatCard title="Views" value={data.reduce((a, d) => a + d.views, 0)} icon={Eye} /><StatCard title="Avg RPM" value={`$${data.length > 0 ? ((totalRevenue / data.reduce((a, d) => a + d.views, 0)) * 1000).toFixed(2) : '0.00'}`} icon={TrendingUp} /></div>
      <Card><CardHeader><CardTitle>Daily Revenue</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="#10b981" /></BarChart></ResponsiveContainer></CardContent></Card>
    </div>
  );
}
