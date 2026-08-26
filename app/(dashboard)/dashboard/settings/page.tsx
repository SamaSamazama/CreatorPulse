"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Webhook, Trash2, Plus } from "lucide-react";
export default function SettingsPage() {
  const [keys, setKeys] = useState<any[]>([]); const [hooks, setHooks] = useState<any[]>([]); const [newKey, setNewKey] = useState<string | null>(null);
  useEffect(() => { fetch("/api/settings/api-keys").then(r => r.json()).then(setKeys); fetch("/api/settings/webhooks").then(r => r.json()).then(setHooks); }, []);
  const createKey = async () => { const res = await fetch("/api/settings/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "New Key" }) }); const data = await res.json(); setNewKey(data.apiKey); fetch("/api/settings/api-keys").then(r => r.json()).then(setKeys); };
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />API Keys</CardTitle></CardHeader><CardContent className="space-y-4">
        {newKey && <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"><code className="break-all">{newKey}</code></div>}
        <Button onClick={createKey}><Plus className="mr-2 h-4 w-4" />Generate Key</Button>
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead></TableRow></TableHeader><TableBody>{keys.map(k => <TableRow key={k.id}><TableCell>{k.name}</TableCell><TableCell><code>{k.apiKey}</code></TableCell></TableRow>)}</TableBody></Table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" />Webhooks</CardTitle></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>URL</TableHead><TableHead>Active</TableHead></TableRow></TableHeader><TableBody>{hooks.map(h => <TableRow key={h.id}><TableCell className="truncate max-w-xs">{h.url}</TableCell><TableCell><Switch checked={h.isActive} /></TableCell></TableRow>)}</TableBody></Table>
      </CardContent></Card>
    </div>
  );
}
