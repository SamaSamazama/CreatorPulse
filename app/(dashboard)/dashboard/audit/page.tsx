'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function AuditPage() {
  const router = useRouter();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const runAudit = async () => {
    setLoading(true);
    const res = await fetch('/api/optimization/audit', { method: 'POST' });
    const data = await res.json();
    setAudit(data.audit);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Channel Audit</h1>
          <p className="text-muted-foreground mt-1">Instant diagnostics of your entire channel health</p>
        </div>
        <Button onClick={runAudit} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Run Audit
        </Button>
      </div>
      {audit && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${audit.overallScore >= 80 ? 'text-green-600' : audit.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {audit.overallScore}
                </div>
                <div className="text-muted-foreground">out of 100</div>
              </div>
              <Progress value={audit.overallScore} className="mt-4 h-3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Metrics Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {Object.entries(audit.metrics || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(audit.recommendations || []).map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  {rec.toLowerCase().includes('great') ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />}
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
      {!audit && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Run an audit to see your channel health score and recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
