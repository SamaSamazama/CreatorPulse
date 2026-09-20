'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, TrendingUp } from 'lucide-react';
export default function NicheLeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [niche, setNiche] = useState('');
  const [score, setScore] = useState('');
  const loadEntries = async () => {
    const res = await fetch('/api/research/niche-leaderboard');
    const data = await res.json();
    setEntries(data.entries || []);
  };
  const addEntry = async () => {
    const res = await fetch('/api/research/niche-leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId: '', niche, score: parseInt(score) || 0 }) });
    const data = await res.json();
    setEntries([data.entry, ...entries]);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Niche Leaderboard</h1>
          <p className="text-muted-foreground mt-1">See how you rank in your niche</p>
        </div>
        <Button onClick={loadEntries} variant="outline"><TrendingUp className="mr-2 h-4 w-4" />Refresh</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Your Channel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Niche (e.g., Gaming, Tech)" value={niche} onChange={e => setNiche(e.target.value)} />
            <Input placeholder="Score" type="number" value={score} onChange={e => setScore(e.target.value)} />
          </div>
          <Button onClick={addEntry} disabled={!niche || !score}><Trophy className="mr-2 h-4 w-4" />Add Entry</Button>
        </CardContent>
      </Card>
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={i < 3 ? 'default' : 'secondary'}>#{entry.rank}</Badge>
                  <div>
                    <p className="font-medium text-sm">{entry.niche}</p>
                    <p className="text-xs text-muted-foreground">Score: {entry.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
