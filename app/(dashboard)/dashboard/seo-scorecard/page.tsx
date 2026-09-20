'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
export default function SEOScorecardPage() {
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const analyze = async () => {
    setLoading(true);
    const res = await fetch('/api/optimization/seo-scorecard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, title, description, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }) });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO Scorecard</h1>
        <p className="text-muted-foreground mt-1">Get a pre-publish SEO checklist and score</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analyze Video SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
          <Button onClick={analyze} disabled={loading || !title}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Analyze SEO
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Score: {result.score}/100</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${result.score >= 80 ? 'bg-green-600' : result.score >= 60 ? 'bg-amber-600' : 'bg-red-600'}`} style={{ width: `${result.score}%` }} />
            </div>
            <div className="space-y-2">
              {(result.suggestions || []).map((sug: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-amber-600" />{sug}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
