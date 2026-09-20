'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Moon, Plus, Trash2 } from 'lucide-react';
export default function SunsetVideosPage() {
  const [sunsets, setSunsets] = useState<any[]>([]);
  const [videoId, setVideoId] = useState('');
  const [reason, setReason] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const loadSunsets = async () => {
    const res = await fetch('/api/optimization/sunset-videos');
    const data = await res.json();
    setSunsets(data.sunsets || []);
  };
  const addSunset = async () => {
    const res = await fetch('/api/optimization/sunset-videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, reason, scheduledAt }) });
    const data = await res.json();
    setSunsets([data.sunset, ...sunsets]);
    setVideoId(''); setReason(''); setScheduledAt('');
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sunset Videos</h1>
        <p className="text-muted-foreground mt-1">Schedule old videos for archival or private status</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schedule Sunset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
          <Input placeholder="Reason (e.g., outdated, rebrand)" value={reason} onChange={e => setReason(e.target.value)} />
          <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          <Button onClick={addSunset} disabled={!videoId}><Plus className="mr-2 h-4 w-4" />Schedule Sunset</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Sunsets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sunsets.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Video: {s.videoId}</p>
                  <p className="text-xs text-muted-foreground">{s.reason || 'No reason'} · {new Date(s.scheduledAt).toLocaleString()}</p>
                </div>
              </div>
              <Badge variant={s.status === 'pending' ? 'default' : 'secondary'}>{s.status}</Badge>
            </div>
          ))}
          {sunsets.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No scheduled sunsets</p>}
        </CardContent>
      </Card>
    </div>
  );
}
