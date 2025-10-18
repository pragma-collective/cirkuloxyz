ALTER TYPE "public"."invite_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN "code" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_code_unique" UNIQUE("code");