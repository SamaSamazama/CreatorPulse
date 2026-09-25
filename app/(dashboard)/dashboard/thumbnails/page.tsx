"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageIcon } from "lucide-react";
export default function ThumbnailsPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const handleGenerate = async () => {
    setIsGenerating(true);
    setDescription(null);
    const res = await fetch("/api/optimization/thumbnails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
    const data = await res.json();
    setDescription(data.description || null);
    setIsGenerating(false);
  };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">AI Thumbnail Generator</h1>
      <Card><CardContent className="pt-6 space-y-4"><Textarea placeholder="Describe thumbnail..." value={prompt} onChange={(e) => setPrompt(e.target.value)} /><Button onClick={handleGenerate} disabled={isGenerating} className="w-full">{isGenerating ? <Loader2 className="animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}Generate</Button></CardContent></Card>
      {description && (<Card><CardHeader><CardTitle>Thumbnail Concept</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed whitespace-pre-wrap">{description}</p></CardContent></Card>)}
    </div>
  );
}
