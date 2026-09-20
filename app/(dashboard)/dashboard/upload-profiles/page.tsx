'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Plus, Trash2, Star } from 'lucide-react';
export default function UploadProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const loadProfiles = async () => {
    const res = await fetch('/api/settings/upload-profiles');
    const data = await res.json();
    setProfiles(data.profiles || []);
  };
  const addProfile = async () => {
    const res = await fetch('/api/settings/upload-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, title, description, tags: [], category, isDefault: profiles.length === 0 }) });
    const data = await res.json();
    setProfiles([...profiles, data.profile]);
    setName(''); setTitle(''); setDescription(''); setCategory('');
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Profiles</h1>
        <p className="text-muted-foreground mt-1">Save default upload settings for faster publishing</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Profile name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Default title template" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Default description template" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <Button onClick={addProfile} disabled={!name}><Plus className="mr-2 h-4 w-4" />Create Profile</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saved Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">{p.name} {p.isDefault && <Star className="h-3 w-3 text-amber-500" />}</p>
                  <p className="text-xs text-muted-foreground">{p.category || 'No category'}</p>
                </div>
              </div>
              <Badge variant="secondary">{p.language}</Badge>
            </div>
          ))}
          {profiles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upload profiles yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
