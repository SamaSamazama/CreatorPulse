'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, AlertTriangle, CheckCircle2 } from 'lucide-react';
export default function ThumbnailAnalyzerPage() {
  const router = useRouter();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const analyze = async () => {
    setLoading(true);
    const res = await fetch('/api/optimization/thumbnail-analyzer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId: '', thumbnailUrl }) });
    const data = await res.json();
    setAnalyses([data.analysis, ...analyses]);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thumbnail Analyzer</h1>
        <p className="text-muted-foreground mt-1">Analyze thumbnails for readability and CTR potential</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analyze Thumbnail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Thumbnail URL" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
          <Button onClick={analyze} disabled={loading || !thumbnailUrl}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image className="mr-2 h-4 w-4" />}
            Analyze
          </Button>
        </CardContent>
      </Card>
      {analyses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {analyses.map((a, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Score: {a.score}/100
                  {a.score >= 80 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {a.readabilityIssues?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Issues:</p>
                    {a.readabilityIssues.map((issue: string, j: number) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-red-600"><AlertTriangle className="h-3 w-3" />{issue}</div>
                    ))}
                  </div>
                )}
                {a.suggestions?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suggestions:</p>
                    {a.suggestions.map((sug: string, j: number) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-3 w-3" />{sug}</div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
