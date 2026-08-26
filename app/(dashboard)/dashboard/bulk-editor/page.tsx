"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/lib/hooks/use-dashboard";
export default function BulkEditorPage() {
  const { data } = useDashboard(); const videos = data?.videos || [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]); const [appendTags, setAppendTags] = useState(""); const [appendDesc, setAppendDesc] = useState("");
  const handleSave = async () => { await fetch("/api/optimization/bulk-update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoIds: selectedIds, appendTags: appendTags.split(","), appendDescription: appendDesc }) }); };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Bulk Editor</h1>
      <Card><CardContent className="pt-6 space-y-4"><Input placeholder="Append Tags (comma sep)" value={appendTags} onChange={(e) => setAppendTags(e.target.value)} /><Textarea placeholder="Append Description" value={appendDesc} onChange={(e) => setAppendDesc(e.target.value)} /><Button onClick={handleSave} className="w-full">Apply to {selectedIds.length} Videos</Button></CardContent></Card>
      <Card><CardContent className="pt-6"><Table><TableHeader><TableRow><TableHead></TableHead><TableHead>Title</TableHead></TableRow></TableHeader><TableBody>{videos.map((vid: any) => (<TableRow key={vid.id}><TableCell><Checkbox checked={selectedIds.includes(vid.platformVideoId)} onCheckedChange={() => setSelectedIds(prev => prev.includes(vid.platformVideoId) ? prev.filter(i => i !== vid.platformVideoId) : [...prev, vid.platformVideoId])} /></TableCell><TableCell>{vid.title}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
}
