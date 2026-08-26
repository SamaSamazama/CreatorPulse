"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date()); const [events, setEvents] = useState<any[]>([]); const [newTitle, setNewTitle] = useState("");
  const fetchEvents = async () => { if (!date) return; const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString(); const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString(); const res = await fetch(`/api/optimization/calendar?start=${start}&end=${end}`); setEvents(await res.json()); };
  useEffect(() => { fetchEvents(); }, [date]);
  const handleAdd = async () => { await fetch("/api/optimization/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle, scheduledAt: date }) }); setNewTitle(""); fetchEvents(); };
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between"><h1 className="text-3xl font-bold">Content Calendar</h1><Dialog><DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Schedule</DialogTitle></DialogHeader><Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /><Button onClick={handleAdd} className="mt-4 w-full">Save</Button></DialogContent></Dialog></div>
      <div className="grid md:grid-cols-[1fr_300px] gap-6"><Card><CardContent className="pt-6 flex justify-center"><Calendar mode="single" selected={date} onSelect={setDate} /></CardContent></Card><Card><CardHeader><CardTitle>{date?.toDateString()}</CardTitle></CardHeader><CardContent>{events.filter(e => new Date(e.scheduledAt).toDateString() === date?.toDateString()).map(e => <div key={e.id} className="p-3 border rounded-lg mb-2">{e.title}</div>)}</CardContent></Card></div>
    </div>
  );
}
