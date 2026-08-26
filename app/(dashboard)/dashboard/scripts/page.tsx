"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PenTool } from "lucide-react";
import ReactMarkdown from "react-markdown";
export default function ScriptWriterPage() {
  const [topic, setTopic] = useState(""); const [script, setScript] = useState(""); const [isLoading, setIsLoading] = useState(false);
  const handleGenerate = async () => { setIsLoading(true); setScript(""); const res = await fetch("/api/ai/script", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, tone: 'engaging', duration: '8-10 mins' }) }); const data = await res.json(); setScript(data.script); setIsLoading(false); };
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><PenTool className="text-blue-500" /> AI Script Writer</h1>
      <Card><CardContent className="pt-6 space-y-4"><Input placeholder="Video Topic" value={topic} onChange={(e) => setTopic(e.target.value)} /><Button onClick={handleGenerate} disabled={isLoading} className="w-full">{isLoading ? <Loader2 className="animate-spin" /> : <PenTool className="mr-2 h-4 w-4" />}Generate</Button></CardContent></Card>
      {script && <Card className="bg-muted/50"><CardContent className="pt-6 prose dark:prose-invert max-w-none whitespace-pre-wrap"><ReactMarkdown>{script}</ReactMarkdown></CardContent></Card>}
    </div>
  );
}
