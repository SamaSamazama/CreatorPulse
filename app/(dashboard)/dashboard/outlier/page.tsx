"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export default function OutlierPage() {
  const [forecast, setForecast] = useState<any>(null); const [outliers, setOutliers] = useState<any[]>([]);
  useEffect(() => { Promise.all([fetch("/api/ml/forecast", { method: "POST" }), fetch("/api/ml/outlier", { method: "POST" })]).then(async ([f, o]) => { setForecast(await f.json()); setOutliers(await o.json()); }); }, []);
  const chartData = forecast?.forecastedViews?.map((views: number, i: number) => ({ day: `Day ${i + 1}`, views })) || [];
  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Viral Outliers & Forecasting</h1>
      <Card><CardHeader><CardTitle>30-Day Forecast</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><XAxis dataKey="day" /><YAxis /><Tooltip /><Area type="monotone" dataKey="views" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} /></AreaChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Zap className="text-yellow-500" /> Outliers</CardTitle></CardHeader><CardContent className="space-y-4">{outliers.slice(0, 5).map((vid: any) => (<div key={vid.videoId} className="flex items-center justify-between p-4 border rounded-lg"><p className="font-semibold truncate mr-4">{vid.title}</p><div className="flex items-center gap-3 w-48"><Progress value={vid.viralityScore} /><span className="font-bold">{vid.viralityScore}</span></div></div>))}</CardContent></Card>
    </div>
  );
}
