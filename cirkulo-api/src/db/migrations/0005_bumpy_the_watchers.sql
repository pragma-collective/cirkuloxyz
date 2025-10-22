CREATE TABLE "circles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_name" text NOT NULL,
	"pool_address" text NOT NULL,
	"lens_group_address" text NOT NULL,
	"pool_deployment_tx_hash" text,
	"creator_address" text NOT NULL,
	"circle_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "circles_pool_address_unique" UNIQUE("pool_address"),
	CONSTRAINT "circles_lens_group_address_unique" UNIQUE("lens_group_address")
);
