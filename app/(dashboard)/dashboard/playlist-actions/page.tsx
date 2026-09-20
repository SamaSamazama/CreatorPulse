'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, List, Plus } from 'lucide-react';
export default function PlaylistActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [playlistId, setPlaylistId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [actionType, setActionType] = useState('add');
  const loadActions = async () => {
    const res = await fetch('/api/settings/playlist-actions');
    const data = await res.json();
    setActions(data.actions || []);
  };
  const addAction = async () => {
    const res = await fetch('/api/settings/playlist-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playlistId, videoId, action: actionType }) });
    const data = await res.json();
    setActions([data.action, ...actions]);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Playlist Actions</h1>
        <p className="text-muted-foreground mt-1">Manage playlist operations in bulk</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add to Playlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Playlist ID" value={playlistId} onChange={e => setPlaylistId(e.target.value)} />
          <Input placeholder="Video ID" value={videoId} onChange={e => setVideoId(e.target.value)} />
          <select value={actionType} onChange={e => setActionType(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background">
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </select>
          <Button onClick={addAction} disabled={!playlistId || !videoId}><Plus className="mr-2 h-4 w-4" />Execute</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <List className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm capitalize">{a.action}</p>
                  <p className="text-xs text-muted-foreground">Playlist: {a.playlistId} · Video: {a.videoId || 'N/A'}</p>
                </div>
              </div>
              <Badge variant="secondary">{a.action}</Badge>
            </div>
          ))}
          {actions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No actions yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
