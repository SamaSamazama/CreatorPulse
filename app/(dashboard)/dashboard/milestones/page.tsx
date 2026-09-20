'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Target } from 'lucide-react';
export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const loadMilestones = async () => {
    setLoading(true);
    const res = await fetch('/api/milestones');
    const data = await res.json();
    setMilestones(data.milestones || []);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Milestones</h1>
          <p className="text-muted-foreground mt-1">Track and celebrate your channel achievements</p>
        </div>
        <Button onClick={loadMilestones} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />}
          Load Milestones
        </Button>
      </div>
      {milestones.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {milestones.map((m, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  {m.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Achieved {new Date(m.achievedAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!milestones.length && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Milestones are automatically tracked as your channel grows</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
