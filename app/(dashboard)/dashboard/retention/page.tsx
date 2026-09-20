'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, TrendingUp, Eye } from 'lucide-react';
export default function RetentionPage() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const loadAnalytics = async () => {
    setLoading(true);
    const res = await fetch('/api/analytics/retention');
    const data = await res.json();
    setAnalytics(data.analytics || []);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retention Analyzer</h1>
          <p className="text-muted-foreground mt-1">Analyze audience retention for your videos</p>
        </div>
        <Button onClick={loadAnalytics} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
          Analyze Retention
        </Button>
      </div>
      {analytics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {analytics.map((item, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">Video {item.videoId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Avg Retention: {item.avgRetention}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${item.avgRetention}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!analytics.length && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Analyze retention data for your videos to identify drop-off points</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
