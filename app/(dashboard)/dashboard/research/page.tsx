"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Loader2 } from "lucide-react";
import { useKeywordResearch, useCompetitors, useAddCompetitor } from "@/lib/hooks/use-research";
export default function ResearchPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Research & Discovery</h1>
      <Tabs defaultValue="keywords"><TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="keywords">Keywords</TabsTrigger><TabsTrigger value="competitors">Competitors</TabsTrigger></TabsList>
        <TabsContent value="keywords"><KeywordTab /></TabsContent>
        <TabsContent value="competitors"><CompetitorTab /></TabsContent>
      </Tabs>
    </div>
  );
}
function KeywordTab() {
  const [query, setQuery] = useState("");
  const { mutate: analyze, data, isPending } = useKeywordResearch();
  return (
    <Card><CardContent className="pt-6 space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); analyze(query); }} className="flex gap-2"><Input placeholder="e.g., nextjs tutorial" value={query} onChange={(e) => setQuery(e.target.value)} /><Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="animate-spin" /> : <Search className="mr-2 h-4 w-4" />}Analyze</Button></form>
      {data && <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead className="text-right">Views</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader><TableBody>{data.results.map((r: any) => (<TableRow key={r.videoId}><TableCell className="truncate max-w-xs">{r.title}</TableCell><TableCell className="text-right">{r.viewCount.toLocaleString()}</TableCell><TableCell className="text-right"><Badge>{r.opportunityScore}</Badge></TableCell></TableRow>))}</TableBody></Table>}
    </CardContent></Card>
  );
}
function CompetitorTab() {
  const [newComp, setNewComp] = useState("");
  const { data: competitors } = useCompetitors();
  const { mutate: add, isPending } = useAddCompetitor();
  return (
    <Card><CardContent className="pt-6 space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); add(newComp); setNewComp(""); }} className="flex gap-2"><Input placeholder="@handle" value={newComp} onChange={(e) => setNewComp(e.target.value)} /><Button disabled={isPending}><Plus className="mr-2 h-4 w-4" />Add</Button></form>
      <div className="grid gap-4 md:grid-cols-2">{competitors?.map((c: any) => (<div key={c.id} className="flex items-center gap-4 p-4 border rounded-lg"><img src={c.thumbnailUrl} className="h-10 w-10 rounded-full" /><div><p className="font-semibold">{c.title}</p><p className="text-sm text-muted-foreground">{c.subscriberCount.toLocaleString()} subs</p></div></div>))}</div>
    </CardContent></Card>
  );
}
