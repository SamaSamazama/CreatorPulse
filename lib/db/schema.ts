import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum, jsonb, real } from 'drizzle-orm/pg-core';
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
  auditScore: integer('audit_score'),
  seoScore: integer('seo_score'),
  bestTimeToPost: timestamp('best_time_to_post'),
  niche: varchar('niche', { length: 255 }),
  channelBackupAt: timestamp('channel_backup_at'),
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
  seoScore: integer('seo_score'),
  retentionData: jsonb('retention_data').$type<any[]>(),
  clickMagnetScore: integer('click_magnet_score'),
  bestTimeToPost: timestamp('best_time_to_post'),
  sunsetAt: timestamp('sunset_at'),
  scheduledUpdateAt: timestamp('scheduled_update_at'),
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

export const channelAudits = pgTable('channel_audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  overallScore: integer('overall_score').notNull(),
  metrics: jsonb('metrics').$type<Record<string, number>>(),
  recommendations: jsonb('recommendations').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const thumbnailAbTests = pgTable('thumbnail_ab_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  originalThumbnail: text('original_thumbnail').notNull(),
  variantThumbnail: text('variant_thumbnail').notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  originalCtr: integer('original_ctr'),
  variantCtr: integer('variant_ctr'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
});

export const endScreens = pgTable('end_screens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  elements: jsonb('elements').$type<any[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cards = pgTable('cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  elements: jsonb('elements').$type<any[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commentTemplates = pgTable('comment_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dailyIdeas = pgTable('daily_ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  estimatedViews: integer('estimated_views'),
  competitionScore: integer('competition_score'),
  trendScore: integer('trend_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const trendAlerts = pgTable('trend_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  niche: varchar('niche', { length: 255 }),
  velocity: integer('velocity').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const exports = pgTable('exports', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  format: varchar('format', { length: 50 }).notNull(),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const retentionAnalytics = pgTable('retention_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  data: jsonb('data').$type<any[]>(),
  avgRetention: integer('avg_retention'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const milestones = pgTable('milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  value: integer('value').notNull(),
  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
});

export const nicheLeaderboard = pgTable('niche_leaderboard', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  niche: varchar('niche', { length: 255 }).notNull(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  rank: integer('rank').notNull(),
  score: integer('score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const channelBackups = pgTable('channel_backups', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'cascade' }).notNull(),
  size: integer('size').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sunsetVideos = pgTable('sunset_videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  reason: varchar('reason', { length: 255 }),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scheduledUpdates = pgTable('scheduled_updates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  title: text('title'),
  description: text('description'),
  tags: jsonb('tags').$type<string[]>(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const keywordTrends = pgTable('keyword_trends', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  query: varchar('query', { length: 255 }).notNull(),
  data: jsonb('data').$type<any[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const thumbnailAnalyses = pgTable('thumbnail_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }),
  thumbnailUrl: text('thumbnail_url').notNull(),
  score: integer('score'),
  readabilityIssues: jsonb('readability_issues').$type<string[]>(),
  suggestions: jsonb('suggestions').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const channelytics = pgTable('channelytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  competitorId: uuid('competitor_id').references(() => competitors.id, { onDelete: 'cascade' }).notNull(),
  competitorName: varchar('competitor_name', { length: 255 }),
  data: jsonb('data').$type<{ metrics?: Record<string, number>; comparison?: Record<string, number> }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const demonetizationAudits = pgTable('demonetization_audits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  videoId: varchar('video_id', { length: 255 }).notNull(),
  riskLevel: varchar('risk_level', { length: 50 }),
  flags: jsonb('flags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const uploadProfiles = pgTable('upload_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  title: text('title'),
  description: text('description'),
  tags: jsonb('tags').$type<string[]>(),
  category: varchar('category', { length: 100 }),
  language: varchar('language', { length: 10 }).default('en'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playlistActions = pgTable('playlist_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  playlistId: varchar('playlist_id', { length: 255 }).notNull(),
  videoId: varchar('video_id', { length: 255 }),
  action: varchar('action', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transcriptAnalyses = pgTable('transcript_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  channelId: uuid('channel_id').references(() => channels.id, { onDelete: 'set null' }),
  videoId: uuid('video_id').references(() => videos.id, { onDelete: 'set null' }),
  transcriptText: text('transcript_text'),
  keywords: jsonb('keywords').$type<string[]>(),
  sentiment: real('sentiment'),
  summary: text('summary'),
  recommendations: jsonb('recommendations').$type<string[]>(),
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({ channels: many(channels) }));
export const channelsRelations = relations(channels, ({ one, many }) => ({
  user: one(users, { fields: [channels.userId], references: [users.id] }),
  videos: many(videos),
}));
export const videosRelations = relations(videos, ({ one }) => ({
  channel: one(channels, { fields: [videos.channelId], references: [channels.id] }),
}));

export const channelAuditsRelations = relations(channelAudits, ({ one }) => ({
  user: one(users, { fields: [channelAudits.userId], references: [users.id] }),
  channel: one(channels, { fields: [channelAudits.channelId], references: [channels.id] }),
}));

export const thumbnailAbTestsRelations = relations(thumbnailAbTests, ({ one }) => ({
  user: one(users, { fields: [thumbnailAbTests.userId], references: [users.id] }),
}));

export const endScreensRelations = relations(endScreens, ({ one }) => ({
  user: one(users, { fields: [endScreens.userId], references: [users.id] }),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  user: one(users, { fields: [cards.userId], references: [users.id] }),
}));

export const commentTemplatesRelations = relations(commentTemplates, ({ one }) => ({
  user: one(users, { fields: [commentTemplates.userId], references: [users.id] }),
}));

export const dailyIdeasRelations = relations(dailyIdeas, ({ one }) => ({
  user: one(users, { fields: [dailyIdeas.userId], references: [users.id] }),
  channel: one(channels, { fields: [dailyIdeas.channelId], references: [channels.id] }),
}));

export const trendAlertsRelations = relations(trendAlerts, ({ one }) => ({
  user: one(users, { fields: [trendAlerts.userId], references: [users.id] }),
}));

export const exportsRelations = relations(exports, ({ one }) => ({
  user: one(users, { fields: [exports.userId], references: [users.id] }),
}));

export const retentionAnalyticsRelations = relations(retentionAnalytics, ({ one }) => ({
  user: one(users, { fields: [retentionAnalytics.userId], references: [users.id] }),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  user: one(users, { fields: [milestones.userId], references: [users.id] }),
  channel: one(channels, { fields: [milestones.channelId], references: [channels.id] }),
}));

export const nicheLeaderboardRelations = relations(nicheLeaderboard, ({ one }) => ({
  user: one(users, { fields: [nicheLeaderboard.userId], references: [users.id] }),
  channel: one(channels, { fields: [nicheLeaderboard.channelId], references: [channels.id] }),
}));

export const channelBackupsRelations = relations(channelBackups, ({ one }) => ({
  user: one(users, { fields: [channelBackups.userId], references: [users.id] }),
  channel: one(channels, { fields: [channelBackups.channelId], references: [channels.id] }),
}));

export const sunsetVideosRelations = relations(sunsetVideos, ({ one }) => ({
  user: one(users, { fields: [sunsetVideos.userId], references: [users.id] }),
}));

export const scheduledUpdatesRelations = relations(scheduledUpdates, ({ one }) => ({
  user: one(users, { fields: [scheduledUpdates.userId], references: [users.id] }),
}));

export const keywordTrendsRelations = relations(keywordTrends, ({ one }) => ({
  user: one(users, { fields: [keywordTrends.userId], references: [users.id] }),
}));

export const thumbnailAnalysesRelations = relations(thumbnailAnalyses, ({ one }) => ({
  user: one(users, { fields: [thumbnailAnalyses.userId], references: [users.id] }),
}));

export const channelyticsRelations = relations(channelytics, ({ one }) => ({
  user: one(users, { fields: [channelytics.userId], references: [users.id] }),
}));

export const demonetizationAuditsRelations = relations(demonetizationAudits, ({ one }) => ({
  user: one(users, { fields: [demonetizationAudits.userId], references: [users.id] }),
}));

export const uploadProfilesRelations = relations(uploadProfiles, ({ one }) => ({
  user: one(users, { fields: [uploadProfiles.userId], references: [users.id] }),
}));

export const playlistActionsRelations = relations(playlistActions, ({ one }) => ({
  user: one(users, { fields: [playlistActions.userId], references: [users.id] }),
}));

export const transcriptAnalysesRelations = relations(transcriptAnalyses, ({ one }) => ({
  user: one(users, { fields: [transcriptAnalyses.userId], references: [users.id] }),
  channel: one(channels, { fields: [transcriptAnalyses.channelId], references: [channels.id] }),
  video: one(videos, { fields: [transcriptAnalyses.videoId], references: [videos.id] }),
}));
