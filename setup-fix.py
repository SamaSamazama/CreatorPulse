import os, json

files = {
'lib/utils.ts': r"""import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}""",
'lib/providers.tsx': r""""use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}""",
'lib/db/schema.ts': r"""import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
export const platformEnum = pgEnum('platform', ['youtube', 'tiktok', 'instagram']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'starter', 'pro', 'agency']);
export const videoStatusEnum = pgEnum('video_status', ['public', 'private', 'unlisted', 'draft']);
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const channels = pgTable('channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  platformId: varchar('platform_id', { length: 255 }).notNull(),
  platform: platformEnum('platform').default('youtube').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  handle: varchar('handle', { length: 255 }),
  thumbnailUrl: text('thumbnail_url'),
  subscriberCount: integer('subscriber_count').default(0),
  viewCount: integer('view_count').default(0),
  videoCount: integer('video_count').default(0),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiry: timestamp('token_expiry'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const videos = pgTable('videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  platformVideoId: varchar('platform_video_id', { length: 255 }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  publishedAt: timestamp('published_at'),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  durationSeconds: integer('duration_seconds'),
  thumbnailUrl: text('thumbnail_url'),
  tags: jsonb('tags').$type<string[]>(),
  status: videoStatusEnum('status').default('public').notNull(),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const competitors = pgTable('competitors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  platformId: varchar('platform_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  handle: varchar('handle', { length: 255 }),
  thumbnailUrl: text('thumbnail_url'),
  subscriberCount: integer('subscriber_count').default(0),
  viewCount: integer('view_count').default(0),
  videoCount: integer('video_count').default(0),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const keywordSearches = pgTable('keyword_searches', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  query: varchar('query', { length: 255 }).notNull(),
  results: jsonb('results').$type<any[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const abTests = pgTable('ab_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  originalTitle: text('original_title').notNull(),
  variantTitle: text('variant_title').notNull(),
  originalThumbnail: text('original_thumbnail'),
  variantThumbnail: text('variant_thumbnail'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  originalCtr: integer('original_ctr'),
  variantCtr: integer('variant_ctr'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const thumbnailGenerations = pgTable('thumbnail_generations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  prompt: text('prompt').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  apiKey: varchar('api_key', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  secret: varchar('secret', { length: 255 }).notNull(),
  events: jsonb('events').$type<string[]>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const usersRelations = relations(users, ({ many }) => ({ channels: many(channels) }));
export const channelsRelations = relations(channels, ({ one, many }) => ({
  user: one(users, { fields: [channels.userId], references: [users.id] }),
  videos: many(videos),
}));
export const videosRelations = relations(videos, ({ one }) => ({
  channel: one(channels, { fields: [videos.channelId], references: [channels.id] }),
}));""",
'lib/youtube/client.ts': r"""import { google } from 'googleapis';
import { db } from '@/lib/db';
import { channels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
  );
}
export async function getValidAccessToken(channelId: string): Promise<string> {
  const channel = await db.query.channels.findFirst({ where: eq(channels.id, channelId) });
  if (!channel || !channel.refreshToken) throw new Error('Channel not found');
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: channel.accessToken ?? undefined, refresh_token: channel.refreshToken });
  const isExpired = channel.tokenExpiry ? new Date(channel.tokenExpiry).getTime() < Date.now() + 300000 : true;
  if (isExpired) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db.update(channels).set({ accessToken: credentials.access_token ?? null, tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null }).where(eq(channels.id, channelId));
    return credentials.access_token as string;
  }
  return channel.accessToken as string;
}
export async function getValidYouTubeClient(channelId: string) {
  const token = await getValidAccessToken(channelId);
  const auth = createOAuth2Client();
  auth.setCredentials({ access_token: token });
  return google.youtube({ version: 'v3', auth });
}""",
'lib/youtube/api.ts': r"""import { google } from 'googleapis';
import { getValidYouTubeClient } from './client';
export async function fetchChannelAnalytics(youtube: any) {
  const response = await youtube.channels.list({ part: ['snippet', 'statistics', 'status'], mine: true });
  return response.data.items?.[0];
}
export async function fetchRecentVideos(youtube: any, maxResults = 10) {
  const response = await youtube.search.list({ part: ['snippet'], forMine: true, type: ['video'], order: 'date', maxResults });
  const videoIds = response.data.items?.map((item: any) => item.id.videoId).join(',');
  if (!videoIds) return [];
  const statsResponse = await youtube.videos.list({ part: ['snippet', 'statistics', 'contentDetails'], id: videoIds });
  return statsResponse.data.items || [];
}""",
'lib/ai/gemini.ts': r"""import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const coachModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: "You are CreatorPulse AI, an expert YouTube channel coach. Provide highly specific, data-driven advice." });
export const scriptModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: "You are an expert YouTube scriptwriter. Write engaging scripts with [VISUAL] and [AUDIO] cues." });""",
'lib/stripe/index.ts': r"""import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const PLANS = {
  free: { id: 'free', name: 'Free', price: 0, stripePriceId: '', features: ['1 Channel', '10 Keywords/day'] },
  starter: { id: 'starter', name: 'Starter', price: 19, stripePriceId: process.env.STRIPE_PRICE_STARTER ?? '', features: ['3 Channels', 'Unlimited Keywords', 'A/B Testing'] },
  pro: { id: 'pro', name: 'Pro', price: 49, stripePriceId: process.env.STRIPE_PRICE_PRO ?? '', features: ['10 Channels', 'AI Coach', 'Thumbnail AI'] },
  agency: { id: 'agency', name: 'Agency', price: 99, stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? '', features: ['Unlimited Channels', 'Team Seats', 'Public API'] },
};
export type PlanId = keyof typeof PLANS;""",
'components/ui/button.tsx': r"""import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const buttonVariants = cva("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", ghost: "hover:bg-accent hover:text-accent-foreground", link: "text-primary underline-offset-4 hover:underline" }, size: { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" } },
  defaultVariants: { variant: "default", size: "default" },
})
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"
export { Button, buttonVariants }""",
'components/ui/card.tsx': r"""import * as React from "react"
import { cn } from "@/lib/utils"
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />)
Card.displayName = "Card"
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />)
CardHeader.displayName = "CardHeader"
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />)
CardTitle.displayName = "CardTitle"
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)
CardDescription.displayName = "CardDescription"
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />)
CardContent.displayName = "CardContent"
export { Card, CardHeader, CardTitle, CardDescription, CardContent }""",
'components/ui/input.tsx': r"""import * as React from "react"
import { cn } from "@/lib/utils"
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return <input type={type} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />
})
Input.displayName = "Input"
export { Input }""",
'components/ui/badge.tsx': r"""import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
  variants: { variant: { default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80", outline: "text-foreground" } },
  defaultVariants: { variant: "default" },
})
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }""",
'components/ui/textarea.tsx': r"""import * as React from "react"
import { cn } from "@/lib/utils"
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />
})
Textarea.displayName = "Textarea"
export { Textarea }""",
'components/ui/progress.tsx': r"""import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName
export { Progress }""",
'components/ui/skeleton.tsx': r"""import { cn } from "@/lib/utils"
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}
export { Skeleton }""",
'components/ui/switch.tsx': r"""import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className)} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className={cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName
export { Switch }""",
'components/ui/table.tsx': r"""import * as React from "react"
import { cn } from "@/lib/utils"
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => <div className="relative w-full overflow-auto"><table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>)
Table.displayName = "Table"
const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />)
TableHeader.displayName = "TableHeader"
const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />)
TableBody.displayName = "TableBody"
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => <tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />)
TableRow.displayName = "TableRow"
const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />)
TableHead.displayName = "TableHead"
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />)
TableCell.displayName = "TableCell"
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }""",
'components/ui/tabs.tsx': r"""import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
const Tabs = TabsPrimitive.Root
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />)
TabsList.displayName = TabsPrimitive.List.displayName
const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />)
TabsContent.displayName = TabsPrimitive.Content.displayName
export { Tabs, TabsList, TabsTrigger, TabsContent }""",
'components/ui/checkbox.tsx': r"""import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root ref={ref} className={cn("peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}><Check className="h-4 w-4" /></CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
export { Checkbox }""",
'components/ui/dialog.tsx': r"""import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => (
  <DialogPortal><DialogOverlay /><DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className)} {...props}>
    {children}
    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"><X className="h-4 w-4" /><span className="sr-only">Close</span></DialogPrimitive.Close>
  </DialogPrimitive.Content></DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
DialogHeader.displayName = "DialogHeader"
const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />)
DialogTitle.displayName = DialogPrimitive.Title.displayName
const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />)
DialogDescription.displayName = DialogPrimitive.Description.displayName
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }""",
'components/ui/calendar.tsx': r"""import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
export type CalendarProps = React.ComponentProps<typeof DayPicker>
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker showOutsideDays={showOutsideDays} className={cn("p-3", className)} classNames={{
      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0", month: "space-y-4", caption: "flex justify-center pt-1 relative items-center", caption_label: "text-sm font-medium", nav: "space-x-1 flex items-center",
      nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"), nav_button_previous: "absolute left-1", nav_button_next: "absolute right-1", table: "w-full border-collapse space-y-1",
      head_row: "flex", head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]", row: "flex w-full mt-2", cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
      day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"), day_range_end: "day-range-end", day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
      day_today: "bg-accent text-accent-foreground", day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30", day_disabled: "text-muted-foreground opacity-50",
      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground", day_hidden: "invisible", ...classNames,
    }} components={{ IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />, IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" /> }} {...props} />
  )
}
Calendar.displayName = "Calendar"
export { Calendar }""",
'app/layout.tsx': r"""import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Providers } from "@/lib/providers";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = { title: "CreatorPulse", description: "AI YouTube Growth", manifest: "/manifest.json" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Providers>{children}<Toaster richColors position="top-right" /></Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}""",
'app/(dashboard)/onboarding/page.tsx': r"""import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
export default function OnboardingPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader><Video className="h-12 w-12 mx-auto text-red-600 mb-4" /><CardTitle>Connect Your Channel</CardTitle><CardDescription>To get started, connect your YouTube channel.</CardDescription></CardHeader>
        <CardContent><Button asChild size="lg" className="w-full bg-red-600 hover:bg-red-700"><a href="/api/auth/youtube"><Video className="mr-2 h-5 w-5" />Connect YouTube</a></Button></CardContent>
      </Card>
    </div>
  );
}""",
'app/(dashboard)/dashboard/page.tsx': r"""
"use client";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Eye, Video, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export default function DashboardPage() {
  const { data, isLoading, refetch, isRefetching } = useDashboard();
  const router = useRouter();
  const [chartData, setChartData] = useState<{ name: string; views: number }[]>([]);
  useEffect(() => {
    if (data?.requiresOnboarding) router.push("/onboarding");
    if (data?.videos) setChartData(data.videos.slice(0, 10).reverse().map((v: any, i: number) => ({ name: `Video ${i + 1}`, views: v.viewCount })));
  }, [data, router]);
  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  const channel = data?.channel;
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => refetch()} disabled={isRefetching}><RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />Sync</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Subscribers" value={channel?.subscriberCount || 0} icon={Users} />
        <StatCard title="Total Views" value={channel?.viewCount || 0} icon={Eye} />
        <StatCard title="Total Videos" value={channel?.videoCount || 0} icon={Video} />
        <StatCard title="Est. Revenue" value="$0.00" icon={TrendingUp} />
      </div>
      <Card><CardHeader><CardTitle>Recent Performance</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><AreaChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="views" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} /></AreaChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader><CardTitle>Recent Videos</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Video</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader><TableBody>{data?.videos?.map((video: any) => (<TableRow key={video.id}><TableCell className="font-medium truncate max-w-xs">{video.title}</TableCell><TableCell className="text-right">{video.viewCount.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
    </div>
  );
}""",
'app/api/ml/forecast/route.ts': r"""import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, videos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ forecastedViews: [], trend: "no_data" });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json({ forecastedViews: [], trend: "no_data" });
  const channel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id), with: { videos: { orderBy: [desc(videos.publishedAt)], limit: 20 } } });
  if (!channel || !channel.videos?.length) return NextResponse.json({ forecastedViews: [], trend: "no_data" });
  const points = channel.videos.map(v => ({ x: Math.max(Math.floor((Date.now() - new Date(v.publishedAt ?? Date.now()).getTime()) / 86400000), 1), y: v.viewCount }));
  if (points.length < 3) return NextResponse.json({ forecastedViews: new Array(30).fill(0), trend: "insufficient_data" });
  const n = points.length;
  const sx = points.reduce((a, p) => a + p.x, 0);
  const sy = points.reduce((a, p) => a + p.y, 0);
  const sxy = points.reduce((a, p) => a + p.x * p.y, 0);
  const sxx = points.reduce((a, p) => a + p.x * p.x, 0);
  const denom = n * sxx - sx * sx || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const lastDay = Math.max(...points.map(p => p.x));
  const forecastedViews = Array.from({ length: 30 }, (_, i) => Math.max(0, Math.round(slope * (lastDay + i + 1) + intercept)));
  const trend = slope > 50 ? "growing" : slope < -50 ? "declining" : "stable";
  return NextResponse.json({ forecastedViews, trend });
}""",
'app/api/ml/outlier/route.ts': r"""import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, videos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([]);
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json([]);
  const channel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
  if (!channel) return NextResponse.json([]);
  const vids = await db.query.videos.findMany({ where: eq(videos.channelId, channel.id), orderBy: [desc(videos.publishedAt)], limit: 20 });
  const subs = Math.max(channel.subscriberCount, 1);
  const scored = vids.map(v => {
    const days = Math.max(Math.floor((Date.now() - new Date(v.publishedAt ?? Date.now()).getTime()) / 86400000), 1);
    const velocity = v.viewCount / days;
    const ratio = Math.min(v.viewCount / subs, 10);
    const score = Math.min(Math.round(Math.min(velocity / 100, 1) * 50 + (ratio / 10) * 50), 100);
    return { videoId: v.platformVideoId, title: v.title, viralityScore: score, isOutlier: ratio >= 2 };
  });
  return NextResponse.json(scored.sort((a, b) => b.viralityScore - a.viralityScore));
}""",
'app/api/analytics/revenue/route.ts': r"""import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { channels, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getValidAccessToken } from "@/lib/youtube/client";
import { fetchRevenueData } from "@/lib/youtube/analytics";
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const userChannel = await db.query.channels.findFirst({ where: eq(channels.userId, dbUser.id) });
  if (!userChannel) return NextResponse.json({ error: "Connect channel first" }, { status: 400 });
  const end = new Date(); const start = new Date(); start.setDate(start.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  try {
    const token = await getValidAccessToken(userChannel.id);
    const data = await fetchRevenueData(token, userChannel.platformId, fmt(start), fmt(end));
    const parsed = (data.rows || []).map((row: any) => ({ date: row[0], revenue: parseFloat(row[1]), views: parseInt(row[2]), watchTime: parseFloat(row[3]), rpm: parseInt(row[2]) > 0 ? (parseFloat(row[1]) / parseInt(row[2])) * 1000 : 0 }));
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch revenue. Is your channel monetized?" }, { status: 500 });
  }
}""",
'app/api/optimization/thumbnails/route.ts': r"""import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { thumbnailGenerations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { prompt } = await request.json();
  const response = await openai.images.generate({ model: "gpt-image-1", prompt: `Highly engaging YouTube thumbnail, vibrant colors, wide format. Subject: ${prompt}`, n: 1, size: "1536x1024" });
  const b64 = response.data?.[0]?.b64_json ?? "";
  const imageUrl = `data:image/png;base64,${b64}`;
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (dbUser) await db.insert(thumbnailGenerations).values({ userId: dbUser.id, prompt, imageUrl });
  return NextResponse.json({ imageUrl, prompt });
}
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([]);
  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser) return NextResponse.json([]);
  return NextResponse.json(await db.query.thumbnailGenerations.findMany({ where: eq(thumbnailGenerations.userId, dbUser.id), limit: 20 }));
}"""
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + "\n")

# Fix package.json: add every missing dependency
with open('package.json', encoding='utf-8') as f:
    pkg = json.load(f)
deps = pkg.setdefault('dependencies', {})
add = {
    "class-variance-authority": "^0.7.1", "clsx": "^2.1.1", "tailwind-merge": "^3.3.1",
    "@radix-ui/react-slot": "^1.2.3", "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-switch": "^1.2.5", "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-checkbox": "^1.3.2", "@radix-ui/react-dialog": "^1.1.14",
    "@tanstack/react-query": "^5.80.0", "googleapis": "^148.0.0", "openai": "^4.104.0",
    "stripe": "^17.7.0", "@google/generative-ai": "^0.24.0", "@upstash/redis": "^1.35.0",
    "react-markdown": "^9.1.0", "recharts": "^2.15.4", "sonner": "^2.0.5",
    "lucide-react": "^0.525.0", "drizzle-orm": "^0.44.2",
    "@neondatabase/serverless": "^1.0.1", "date-fns": "^3.6.0"
}
for k, v in add.items():
    deps.setdefault(k, v)
deps['react-day-picker'] = '8.10.2'
with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)

print("ALL FIXES APPLIED SUCCESSFULLY")