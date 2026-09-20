'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText } from 'lucide-react';
export default function ExportsPage() {
  const [exports, setExports] = useState<any[]>([]);
  const [type, setType] = useState('videos');
  const [format, setFormat] = useState('csv');
  const loadExports = async () => {
    const res = await fetch('/api/settings/exports');
    const data = await res.json();
    setExports(data.exports || []);
  };
  const generateExport = async () => {
    const res = await fetch('/api/settings/exports/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, format }) });
    const data = await res.json();
    setExports([data.export, ...exports]);
    if (data.url) window.open(data.url, '_blank');
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exports</h1>
        <p className="text-muted-foreground mt-1">Export your channel data as CSV or JSON</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background">
                <option value="videos">Videos</option>
                <option value="analytics">Analytics</option>
                <option value="keywords">Keywords</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-background">
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
          <Button onClick={generateExport}><Download className="mr-2 h-4 w-4" />Generate Export</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exports.map((exp, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm capitalize">{exp.type} ({exp.format})</p>
                  <p className="text-xs text-muted-foreground">{new Date(exp.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <Badge variant="secondary">{exp.format.toUpperCase()}</Badge>
            </div>
          ))}
          {exports.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No exports yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
