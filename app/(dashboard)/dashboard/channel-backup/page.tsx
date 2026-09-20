'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Download } from 'lucide-react';
export default function ChannelBackupPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const createBackup = async () => {
    setLoading(true);
    const res = await fetch('/api/settings/channel-backup/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId: '' }) });
    const data = await res.json();
    setBackups([data.backup, ...backups]);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Channel Backup</h1>
          <p className="text-muted-foreground mt-1">Backup and restore your channel data</p>
        </div>
        <Button onClick={createBackup} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
          Create Backup
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {backups.map((b, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Backup #{b.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()} · {b.size} bytes</p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
          ))}
          {backups.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No backups yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
