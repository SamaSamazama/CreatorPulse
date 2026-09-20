'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Plus, Trash2 } from 'lucide-react';
export default function ScheduledUpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const loadUpdates = async () => {
    const res = await fetch('/api/optimization/scheduled-updates');
    const data = await res.json();
    setUpdates(data.updates || []);
  };
  const addUpdate = async () => {
    const res = await fetch('/api/optimization/scheduled-updates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, title, description, tags: [], scheduledAt }) });
    const data = await res.json();
    setUpdates([data.update, ...updates]);
    setVideoId(''); setTitle(''); setDescription(''); setScheduledAt('');
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scheduled Updates</h1>
        <p className="text-muted-foreground mt-1">Schedule title and description updates for your videos</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schedule Update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
          <Input placeholder="New Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="New Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          <Button onClick={addUpdate} disabled={!videoId || !title}><Plus className="mr-2 h-4 w-4" />Schedule Update</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {updates.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{u.title}</p>
                  <p className="text-xs text-muted-foreground">Video: {u.videoId} · {new Date(u.scheduledAt).toLocaleString()}</p>
                </div>
              </div>
              <Badge variant={u.status === 'pending' ? 'default' : 'secondary'}>{u.status}</Badge>
            </div>
          ))}
          {updates.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No scheduled updates</p>}
        </CardContent>
      </Card>
    </div>
  );
}
