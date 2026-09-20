import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
interface StatCardProps { title: string; value: string | number; icon: LucideIcon; trend?: string; accent?: "blue" | "emerald" | "amber" | "rose" | "violet"; }
const accents = {
  blue: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  emerald: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
  amber: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
  rose: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
  violet: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40",
};
export function StatCard({ title, value, icon: Icon, trend, accent = "blue" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", accents[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{trend}</p>}
      </CardContent>
    </Card>
  );
}
