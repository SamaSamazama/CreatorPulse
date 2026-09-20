'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Shield } from 'lucide-react';
export default function DemonetizationAuditPage() {
  const [videoId, setVideoId] = useState('');
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const runAudit = async () => {
    setLoading(true);
    const res = await fetch('/api/monetization/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId }) });
    const data = await res.json();
    setAudits([data.audit, ...audits]);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demonetization Audit</h1>
        <p className="text-muted-foreground mt-1">Check videos for potential monetization risks</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Run Audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
          <Button onClick={runAudit} disabled={loading || !videoId}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
            Audit Video
          </Button>
        </CardContent>
      </Card>
      {audits.length > 0 && (
        <div className="grid gap-4">
          {audits.map((audit, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Video: {audit.videoId}
                  <Badge variant={audit.riskLevel === 'low' ? 'default' : audit.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                    {audit.riskLevel?.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {audit.flags?.length > 0 ? (
                  <div className="space-y-2">
                    {audit.flags.map((flag: string, j: number) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-amber-600"><AlertTriangle className="h-4 w-4" />{flag}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600 flex items-center gap-2"><Shield className="h-4 w-4" />No monetization risks detected</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
