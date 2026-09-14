"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp } from "lucide-react";
export default function TitleOptimizerPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleOptimize = async () => {
    setIsLoading(true);
    const res = await fetch("/api/optimization/title", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, topic }) });
    const data = await res.json();
    setResults(data.titles || []);
    setIsLoading(false);
  };
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp className="text-green-500" /> Title Optimizer</h1>
      <Card><CardContent className="pt-6 space-y-4">
        <Input placeholder="Current Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Topic/Keywords" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Button onClick={handleOptimize} disabled={isLoading} className="w-full">{isLoading ? <Loader2 className="animate-spin" /> : "Optimize Titles"}</Button>
      </CardContent></Card>
      {results.length > 0 && (<Card><CardHeader><CardTitle>Optimized Titles</CardTitle></CardHeader><CardContent className="space-y-2">{results.map((t, i) => (<div key={i} className="p-3 border rounded-lg flex items-center justify-between"><span>{t}</span><Badge variant="secondary">#{i + 1}</Badge></div>))}</CardContent></Card>)}
    </div>
  );
}
