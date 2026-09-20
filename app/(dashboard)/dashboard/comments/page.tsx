'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Plus, Trash2 } from 'lucide-react';
export default function CommentsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const loadTemplates = async () => {
    const res = await fetch('/api/comments/templates');
    const data = await res.json();
    setTemplates(data.templates || []);
  };
  const addTemplate = async () => {
    const res = await fetch('/api/comments/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, content }) });
    const data = await res.json();
    setTemplates([...templates, data.template]);
    setName(''); setContent('');
  };
  const deleteTemplate = async (id: string) => {
    await fetch(`/api/comments/templates?id=${id}`, { method: 'DELETE' });
    setTemplates(templates.filter(t => t.id !== id));
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comment Manager</h1>
        <p className="text-muted-foreground mt-1">Manage canned responses and comment templates</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Template name" value={name} onChange={e => setName(e.target.value)} />
          <Textarea placeholder="Comment content..." value={content} onChange={e => setContent(e.target.value)} />
          <Button onClick={addTemplate} disabled={!name || !content}><Plus className="mr-2 h-4 w-4" />Add Template</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saved Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{t.content}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteTemplate(t.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {templates.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No templates yet. Create your first above.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
