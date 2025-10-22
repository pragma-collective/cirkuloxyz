import { z } from "zod";

export const inviteSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
});

// Infer TypeScript type from schema
export type InviteFormData = z.infer<typeof inviteSchema>;
