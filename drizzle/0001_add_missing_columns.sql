ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" varchar(255);--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN IF NOT EXISTS "platform_id" varchar(255) DEFAULT 'youtube' NOT NULL;
