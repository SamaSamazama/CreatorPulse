"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Webhook, Trash2, Plus, Loader2 } from "lucide-react";
export default function SettingsPage() {
  const [keys, setKeys] = useState<any[]>([]); const [hooks, setHooks] = useState<any[]>([]); const [newKey, setNewKey] = useState<string | null>(null); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { Promise.all([fetch("/api/settings/api-keys").then(r => { if (!r.ok) throw new Error('Failed to load API keys'); return r.json(); }), fetch("/api/settings/webhooks").then(r => { if (!r.ok) throw new Error('Failed to load webhooks'); return r.json(); })]).then(([k, h]) => { setKeys(k); setHooks(h); }).catch(e => setError(e.message)).finally(() => setIsLoading(false)); }, []);
  const createKey = async () => { setError(null); try { const res = await fetch("/api/settings/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Default" }) }); if (!res.ok) throw new Error('Failed to create key'); const data = await res.json(); setNewKey(data.apiKey); fetch("/api/settings/api-keys").then(r => r.json()).then(setKeys); } catch (e: any) { setError(e.message); } };
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm">{error}</div>}
      {isLoading ? <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
        <>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />API Keys</CardTitle></CardHeader><CardContent className="space-y-4">
            {newKey && <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"><code className="break-all">{newKey}</code></div>}
            <Button onClick={createKey}><Plus className="mr-2 h-4 w-4" />Generate Key</Button>
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead></TableRow></TableHeader><TableBody>{keys.map(k => <TableRow key={k.id}><TableCell>{k.name}</TableCell><TableCell><code>{k.apiKey}</code></TableCell></TableRow>)}</TableBody></Table>
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" />Webhooks</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>URL</TableHead><TableHead>Active</TableHead></TableRow></TableHeader><TableBody>{hooks.map(h => (<TableRow key={h.id}><TableCell className="truncate max-w-xs">{h.url}</TableCell><TableCell><Switch checked={h.isActive} /></TableCell></TableRow>))}</TableBody></Table>
          </CardContent></Card>
        </>
      )}
    </div>
  );
}
