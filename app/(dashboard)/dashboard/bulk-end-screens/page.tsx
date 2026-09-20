'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function BulkEndScreensPage() {
  const router = useRouter();
  const [videoId, setVideoId] = useState('');
  const [elements, setElements] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const addElement = () => setElements([...elements, { type: 'video', videoId: '', position: 'bottom-right' }]);
  const save = async () => {
    const res = await fetch('/api/optimization/end-screens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, elements }) });
    const data = await res.json();
    setSaved([data.endScreen, ...saved]);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk End Screens</h1>
        <p className="text-muted-foreground mt-1">Create and manage end screen templates for your videos</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create End Screen Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
          <div className="space-y-2">
            {elements.map((el, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input placeholder="Target video ID" value={el.videoId} onChange={e => { const next = [...elements]; next[i].videoId = e.target.value; setElements(next); }} className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => setElements(elements.filter((_, idx) => idx !== i))}>×</Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addElement}><Plus className="mr-2 h-4 w-4" />Add Element</Button>
            <Button onClick={save} disabled={!videoId}>Save Template</Button>
          </div>
        </CardContent>
      </Card>
      {saved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {saved.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Video: {item.videoId}</p>
                    <p className="text-xs text-muted-foreground">{item.elements?.length || 0} elements</p>
                  </div>
                </div>
                <Badge variant="secondary">{item.createdAt ? 'Saved' : ''}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
