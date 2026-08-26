"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
export default function AICoachPage() {
  const [prompt, setPrompt] = useState(""); const [response, setResponse] = useState(""); const [isLoading, setIsLoading] = useState(false);
  const handleAsk = async () => { setIsLoading(true); setResponse(""); const res = await fetch("/api/ai/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }); const data = await res.json(); setResponse(data.response); setIsLoading(false); };
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="text-purple-500" /> AI Coach</h1>
      <Card><CardContent className="pt-6 space-y-4"><Textarea placeholder="Ask about your CTR, retention..." value={prompt} onChange={(e) => setPrompt(e.target.value)} /><Button onClick={handleAsk} disabled={isLoading} className="w-full">{isLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Ask</Button></CardContent></Card>
      {response && <Card className="bg-muted/50"><CardContent className="pt-6 prose dark:prose-invert max-w-none"><ReactMarkdown>{response}</ReactMarkdown></CardContent></Card>}
    </div>
  );
}
