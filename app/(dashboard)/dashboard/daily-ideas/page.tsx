'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, TrendingUp, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function DailyIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const generateIdeas = async () => {
    setLoading(true);
    const res = await fetch('/api/ai/daily-ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId: '' }) });
    const data = await res.json();
    setIdeas(data.ideas || []);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Ideas</h1>
          <p className="text-muted-foreground mt-1">AI-generated video ideas tailored to your channel</p>
        </div>
        <Button onClick={generateIdeas} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Generate Ideas
        </Button>
      </div>
      {ideas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {ideas.map((idea, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{idea.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{idea.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /><span>{idea.estimatedViews?.toLocaleString()} est. views</span></div>
                  <div className="flex items-center gap-1"><Target className="h-3 w-3" /><span>Competition: {idea.competitionScore}%</span></div>
                  <Badge variant={idea.trendScore >= 70 ? 'default' : 'secondary'}>Trend: {idea.trendScore}%</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!ideas.length && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Generate AI-powered daily video ideas based on your channel history and trends</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
