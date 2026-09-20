ALTER TABLE "channels" ADD COLUMN IF NOT EXISTS "audit_score" integer;
ALTER TABLE "channels" ADD COLUMN IF NOT EXISTS "seo_score" integer;
ALTER TABLE "channels" ADD COLUMN IF NOT EXISTS "best_time_to_post" timestamp;
ALTER TABLE "channels" ADD COLUMN IF NOT EXISTS "niche" varchar(255);
ALTER TABLE "channels" ADD COLUMN IF NOT EXISTS "channel_backup_at" timestamp;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "seo_score" integer;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "retention_data" jsonb;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "click_magnet_score" integer;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "best_time_to_post" timestamp;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "sunset_at" timestamp;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "scheduled_update_at" timestamp;

CREATE TABLE IF NOT EXISTS "channel_audits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "channel_id" uuid NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
  "overall_score" integer NOT NULL,
  "metrics" jsonb,
  "recommendations" text[],
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "thumbnail_ab_tests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255) NOT NULL,
  "original_thumbnail" text NOT NULL,
  "variant_thumbnail" text NOT NULL,
  "status" varchar(50) DEFAULT 'active' NOT NULL,
  "original_ctr" integer,
  "variant_ctr" integer,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "ended_at" timestamp
);

CREATE TABLE IF NOT EXISTS "end_screens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255) NOT NULL,
  "elements" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "cards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255) NOT NULL,
  "elements" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "comment_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_ideas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "channel_id" uuid NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "estimated_views" integer,
  "competition_score" integer,
  "trend_score" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "trend_alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "keyword" varchar(255) NOT NULL,
  "niche" varchar(255),
  "velocity" integer DEFAULT 0,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "exports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" varchar(50) NOT NULL,
  "format" varchar(50) NOT NULL,
  "url" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "retention_analytics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255) NOT NULL,
  "data" jsonb,
  "avg_retention" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "milestones" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "channel_id" uuid NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
  "type" varchar(50) NOT NULL,
  "value" integer NOT NULL,
  "achieved_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "niche_leaderboard" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "niche" varchar(255) NOT NULL,
  "channel_id" uuid NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
  "rank" integer NOT NULL,
  "score" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "channel_backups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "channel_id" uuid NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
  "size" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sunset_videos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255) NOT NULL,
  "reason" varchar(255),
  "scheduled_at" timestamp NOT NULL,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "scheduled_updates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255) NOT NULL,
  "title" text,
  "description" text,
  "tags" jsonb,
  "scheduled_at" timestamp NOT NULL,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "keyword_trends" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "query" varchar(255) NOT NULL,
  "data" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "thumbnail_analyses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255),
  "thumbnail_url" text NOT NULL,
  "score" integer,
  "readability_issues" text[],
  "suggestions" text[],
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "channelytics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "competitor_id" uuid NOT NULL REFERENCES "competitors"("id") ON DELETE CASCADE,
  "data" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "demonetization_audits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "video_id" varchar(255) NOT NULL,
  "risk_level" varchar(50),
  "flags" text[],
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "upload_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "title" text,
  "description" text,
  "tags" jsonb,
  "category" varchar(100),
  "language" varchar(10) DEFAULT 'en',
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "playlist_actions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "playlist_id" varchar(255) NOT NULL,
  "video_id" varchar(255),
  "action" varchar(50) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
