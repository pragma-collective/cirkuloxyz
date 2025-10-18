// Database schema definitions using Drizzle ORM
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Invite status enum
export const inviteStatusEnum = pgEnum("invite_status", [
	"pending",
	"accepted",
	"expired",
]);

// Invites table
export const invites = pgTable("invites", {
	id: uuid("id").defaultRandom().primaryKey(),
	recipientEmail: text("recipient_email").notNull(),
	senderAddress: text("sender_address").notNull(), // Lens Protocol Account address from JWT act.sub claim
	groupAddress: text("group_address").notNull(), // Group wallet address
	status: inviteStatusEnum("status").notNull().default("pending"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
});
