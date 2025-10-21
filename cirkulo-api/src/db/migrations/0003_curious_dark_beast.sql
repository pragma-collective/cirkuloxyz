ALTER TABLE "invites" ADD COLUMN "config_salt" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "accepted_at" timestamp;