import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';
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
}));
