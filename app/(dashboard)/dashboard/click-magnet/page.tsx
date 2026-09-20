'use client';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Target } from 'lucide-react';
export default function ClickMagnetPage() {
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const score = async () => {
    setLoading(true);
    const res = await fetch('/api/optimization/click-magnet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, title, description }) });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Click Magnet</h1>
        <p className="text-muted-foreground mt-1">Score your title and thumbnail combination for CTR potential</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Score Your Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Button onClick={score} disabled={loading || !title}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />}
            Score CTR Potential
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Score Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{result.score}</div>
              <div className="text-muted-foreground">/ 100</div>
            </div>
            <Progress value={result.score} className="h-3" />
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
