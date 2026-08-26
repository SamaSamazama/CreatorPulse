"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, FlaskConical } from "lucide-react";
export default function ABTestingPage() {
  const [videoId, setVideoId] = useState(""); const [variantTitle, setVariantTitle] = useState(""); const [tests, setTests] = useState<any[]>([]);
  const fetchTests = async () => { const res = await fetch("/api/optimization/ab-test"); setTests(await res.json()); };
  useEffect(() => { fetchTests(); }, []);
  const handleStart = async () => { await fetch("/api/optimization/ab-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId, variantTitle, action: "start" }) }); fetchTests(); };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">A/B Testing Engine</h1>
      <Card><CardContent className="pt-6 space-y-4"><Input placeholder="Video ID" value={videoId} onChange={(e) => setVideoId(e.target.value)} /><Input placeholder="Variant Title" value={variantTitle} onChange={(e) => setVariantTitle(e.target.value)} /><Button onClick={handleStart} className="w-full"><FlaskConical className="mr-2 h-4 w-4" />Start Test</Button></CardContent></Card>
      <Card><CardHeader><CardTitle>Tests</CardTitle></CardHeader><CardContent className="space-y-4">{tests.map((t) => (<div key={t.id} className="p-4 border rounded-lg"><p className="font-semibold">{t.variantTitle}</p><Badge className="mt-2">{t.status}</Badge></div>))}</CardContent></Card>
    </div>
  );
}
