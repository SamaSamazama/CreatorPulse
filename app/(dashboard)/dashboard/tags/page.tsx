"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag } from "lucide-react";
export default function TagSuggestionsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleGenerate = async () => {
    setIsLoading(true);
    const res = await fetch("/api/optimization/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, topic }) });
    const data = await res.json();
    setTags(data.tags || []);
    setIsLoading(false);
  };
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Tag className="text-blue-500" /> Tag Suggestions</h1>
      <Card><CardContent className="pt-6 space-y-4">
        <Input placeholder="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">{isLoading ? <Loader2 className="animate-spin" /> : "Generate Tags"}</Button>
      </CardContent></Card>
      {tags.length > 0 && (<Card><CardHeader><CardTitle>Suggested Tags</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{tags.map((tag, i) => (<Badge key={i} variant="outline">{tag}</Badge>))}</div></CardContent></Card>)}
    </div>
  );
}
