import { z } from "zod";

/**
 * Validation schema for creating a post in a circle
 *
 * Posts can contain:
 * - Text content (max 400 characters)
 * - Single image attachment (PNG, JPEG, WebP, max 10MB)
 * - At least one of content or image must be provided
 */
export const postSchema = z.object({
  content: z
    .string()
    .max(400, "Post must be 400 characters or less")
    .optional(),

  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB max
      "Image must be under 10MB"
    )
    .refine(
      (file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "Image must be PNG, JPEG, or WebP"
    )
    .nullable()
    .optional(),
}).refine(
  (data) => (data.content && data.content.trim()) || data.image,
  {
    message: "Post must contain text or an image",
    path: ["content"],
  }
);

/**
 * Inferred TypeScript type from the post schema
 */
export type PostFormData = z.infer<typeof postSchema>;
