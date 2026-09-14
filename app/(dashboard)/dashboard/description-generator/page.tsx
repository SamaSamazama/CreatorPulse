"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
export default function DescriptionGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState("engaging");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleGenerate = async () => {
    setIsLoading(true);
    setDescription("");
    const res = await fetch("/api/optimization/description", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, title, tone }) });
    const data = await res.json();
    setDescription(data.description || "");
    setIsLoading(false);
  };
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="text-purple-500" /> Description Generator</h1>
      <Card><CardContent className="pt-6 space-y-4">
        <Input placeholder="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Input placeholder="Tone (e.g., engaging, professional, casual)" value={tone} onChange={(e) => setTone(e.target.value)} />
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">{isLoading ? <Loader2 className="animate-spin" /> : "Generate Description"}</Button>
      </CardContent></Card>
      {description && (<Card className="bg-muted/50"><CardHeader><CardTitle>Generated Description</CardTitle></CardHeader><CardContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap"><ReactMarkdown>{description}</ReactMarkdown></CardContent></Card>)}
    </div>
  );
}
