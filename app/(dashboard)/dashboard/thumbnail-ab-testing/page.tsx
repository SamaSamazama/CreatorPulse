'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function ThumbnailABPage() {
  const router = useRouter();
  const [videoId, setVideoId] = useState('');
  const [variantUrl, setVariantUrl] = useState('');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const startTest = async () => {
    setLoading(true);
    const res = await fetch('/api/optimization/thumbnail-ab-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, variantThumbnail: variantUrl, action: 'start' }) });
    const data = await res.json();
    if (data.success) setTests([{ videoId, variantThumbnail: variantUrl, status: 'active' }, ...tests]);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thumbnail A/B Testing</h1>
        <p className="text-muted-foreground mt-1">Test thumbnails to maximize click-through rate</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Start New Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
            <Input placeholder="Variant Thumbnail URL" value={variantUrl} onChange={e => setVariantUrl(e.target.value)} />
          </div>
          <Button onClick={startTest} disabled={loading || !videoId || !variantUrl}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            Start Test
          </Button>
        </CardContent>
      </Card>
      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map((test, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{test.videoId}</p>
                    <p className="text-xs text-muted-foreground">Variant: {test.variantThumbnail?.slice(0, 50)}...</p>
                  </div>
                </div>
                <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>{test.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
