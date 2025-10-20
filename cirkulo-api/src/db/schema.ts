// Database schema definitions using Drizzle ORM
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Invite status enum
export const inviteStatusEnum = pgEnum("invite_status", [
	"pending",
	"accepted",
	"expired",
	"cancelled",
]);

// Invites table
export const invites = pgTable("invites", {
	id: uuid("id").defaultRandom().primaryKey(),
	code: uuid("code").defaultRandom().notNull().unique(), // Unique invite code for validation

	// Email-based invite (sent first)
	recipientEmail: text("recipient_email").notNull(),

	// Blockchain fields (NOT used - invite code is all that matters)
	// recipientAddress is not needed - user provides any wallet when joining
	configSalt: text("config_salt").notNull(), // Group's configSalt from Lens Protocol

	// Group and sender
	groupAddress: text("group_address").notNull(), // Group wallet address
	senderAddress: text("sender_address").notNull(), // Lens Protocol Account address from JWT act.sub claim

	// Status tracking
	status: inviteStatusEnum("status").notNull().default("pending"),
	expiresAt: timestamp("expires_at").notNull(), // When invite expires
	acceptedAt: timestamp("accepted_at"), // When invite was accepted
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});
