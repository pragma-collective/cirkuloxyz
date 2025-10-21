import { z } from "zod";

/**
 * Onboarding form validation schema
 *
 * Validates user profile creation including name, Lens username, bio, and profile photo.
 * Username validation follows Lens Protocol rules:
 * - 3-26 characters
 * - Lowercase letters, numbers, and underscores only
 * - Must be available on Lens Protocol (checked separately via API)
 */
export const onboardingSchema = z.object({
	/**
	 * User's full name
	 * - Required
	 * - Min 2 characters
	 * - Letters, spaces, and hyphens only
	 */
	name: z
		.string()
		.min(1, "Name is required")
		.min(2, "Name must be at least 2 characters")
		.regex(/^[a-zA-Z\s-]+$/, "Name can only contain letters, spaces, and hyphens"),

	/**
	 * Lens Protocol username (localName only, e.g., "alice" for lens/alice)
	 * - Required
	 * - 3-26 characters
	 * - Lowercase letters, numbers, and underscores only
	 */
	lensUsername: z
		.string()
		.min(1, "Lens username is required")
		.min(3, "Username must be at least 3 characters")
		.max(26, "Username must be no more than 26 characters")
		.regex(
			/^[a-z0-9_]+$/,
			"Username can only contain lowercase letters, numbers, and underscores",
		),

	/**
	 * User bio/description
	 * - Optional
	 * - Max 280 characters
	 */
	bio: z.string().max(280, "Bio must be no more than 280 characters").optional(),

	/**
	 * Profile photo file
	 * - Optional
	 * - File object (validated separately)
	 */
	profilePhoto: z.instanceof(File).nullable().optional(),
});

/**
 * Inferred TypeScript type from the schema
 * Use this type for form data throughout the application
 */
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
