'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Calendar } from 'lucide-react';
export default function BestTimeToPostPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const findBestTime = async () => {
    setLoading(true);
    const res = await fetch('/api/analytics/best-time-to-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId: '' }) });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Best Time to Post</h1>
        <p className="text-muted-foreground mt-1">Find the optimal posting time based on your audience</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analyze Best Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={findBestTime} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            Find Best Time
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Posting Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-12 w-12 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{result.day}</p>
                <p className="text-muted-foreground">at {result.hour}:00</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Posting at this time maximizes your initial view velocity based on your audience activity patterns.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
