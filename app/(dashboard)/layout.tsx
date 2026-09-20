"use client";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  VideoIcon,
  TrendingUp,
  Sparkles,
  FileText,
  Tag,
  PenTool,
  Image,
  CalendarDays,
  Layers,
  FlaskConical,
  BarChart3,
  DollarSign,
  Settings,
  Zap,
  Search,
  Bell,
  Lightbulb,
  Monitor,
  MessageSquare,
  Trophy,
  Moon,
  Database,
  Download,
  Shield,
  List,
  Target,
  CheckCircle2,
  Users,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/channels", label: "Channels", icon: VideoIcon },
  { href: "/dashboard/audit", label: "Channel Audit", icon: Sparkles },
  { href: "/dashboard/daily-ideas", label: "Daily Ideas", icon: Lightbulb },
  { href: "/dashboard/research", label: "Research", icon: TrendingUp },
  { href: "/dashboard/keyword-trends", label: "Keyword Trends", icon: Search },
  { href: "/dashboard/ai-coach", label: "AI Coach", icon: Sparkles },
  { href: "/dashboard/scripts", label: "Scripts", icon: FileText },
  { href: "/dashboard/title-optimizer", label: "Titles", icon: PenTool },
  { href: "/dashboard/click-magnet", label: "Click Magnet", icon: Target },
  { href: "/dashboard/seo-scorecard", label: "SEO Scorecard", icon: CheckCircle2 },
  { href: "/dashboard/tags", label: "Tags", icon: Tag },
  { href: "/dashboard/description-generator", label: "Descriptions", icon: FileText },
  { href: "/dashboard/thumbnails", label: "Thumbnails", icon: Image },
  { href: "/dashboard/thumbnail-analyzer", label: "Thumbnail Analyzer", icon: Image },
  { href: "/dashboard/thumbnail-ab-testing", label: "Thumbnail A/B", icon: FlaskConical },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/bulk-editor", label: "Bulk Editor", icon: Layers },
  { href: "/dashboard/bulk-end-screens", label: "End Screens", icon: Monitor },
  { href: "/dashboard/bulk-cards", label: "Cards", icon: MessageSquare },
  { href: "/dashboard/ab-testing", label: "A/B Testing", icon: FlaskConical },
  { href: "/dashboard/outlier", label: "Outliers", icon: BarChart3 },
  { href: "/dashboard/channelytics", label: "Channelytics", icon: Users },
  { href: "/dashboard/retention", label: "Retention", icon: BarChart3 },
  { href: "/dashboard/revenue", label: "Revenue", icon: DollarSign },
  { href: "/dashboard/milestones", label: "Milestones", icon: Trophy },
  { href: "/dashboard/niche-leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/scheduled-updates", label: "Scheduled", icon: CalendarDays },
  { href: "/dashboard/sunset-videos", label: "Sunset", icon: Moon },
  { href: "/dashboard/comments", label: "Comments", icon: MessageSquare },
  { href: "/dashboard/demonetization-audit", label: "Ad Safety", icon: Shield },
  { href: "/dashboard/upload-profiles", label: "Upload Profiles", icon: FileText },
  { href: "/dashboard/playlist-actions", label: "Playlists", icon: List },
  { href: "/dashboard/channel-backup", label: "Backup", icon: Database },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="flex h-full flex-col">
          <div className="p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">CreatorPulse</span>
                <span className="text-[10px] text-muted-foreground leading-tight">AI YouTube Growth</span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3 space-y-3">
            <OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" />
            <UserButton />
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search features, videos, keywords..." className="pl-9 h-9" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <UserButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
