import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, X } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { postSchema, type PostFormData } from "~/schemas/post-schema";
import { createImagePreview, revokeImagePreview, optimizeImageForUpload } from "~/lib/image-utils";
import { cn } from "~/lib/utils";

export interface PostComposerFormProps {
  onDataChange?: (data: { isValid: boolean; data: PostFormData }) => void;
}

export function PostComposerForm({
  onDataChange,
}: PostComposerFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      image: null,
    },
  });

  const content = watch("content") || "";
  const contentLength = content.length;
  const maxLength = 400;

  // Character counter color based on proximity to limit
  const getCounterColor = () => {
    if (contentLength > maxLength) return "text-error-600";
    if (contentLength >= 391) return "text-error-600";
    if (contentLength >= 351) return "text-warning-600";
    return "text-neutral-500";
  };

  // Clean up image preview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        revokeImagePreview(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Optimize image before preview
      const optimizedFile = await optimizeImageForUpload(file);

      // Clean up previous preview
      if (imagePreview) {
        revokeImagePreview(imagePreview);
      }

      // Create new preview
      const preview = createImagePreview(optimizedFile);
      setImagePreview(preview);
      setImageFile(optimizedFile);
      setValue("image", optimizedFile);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      revokeImagePreview(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setValue("image", null);
  };

  // Check if form is valid (has content or image)
  const isFormValid = Boolean((content.trim().length > 0 || imageFile) && contentLength <= maxLength);

  // Notify parent of form data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        isValid: isFormValid,
        data: {
          content,
          image: imageFile,
        },
      });
    }
  }, [content, imageFile, isFormValid, onDataChange]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Text Input Area */}
      <div>
        <Textarea
          {...register("content")}
          placeholder="What's happening in your circle?"
          className={cn(
            "min-h-[120px] max-h-[200px] text-base border-0 focus-visible:ring-0 px-0 resize-none",
            errors.content && "border-error-500"
          )}
          autoFocus
        />

        {/* Character Counter */}
        <div className="flex justify-end mt-2">
          <span className={cn("text-sm font-medium transition-colors", getCounterColor())}>
            {contentLength}/{maxLength}
          </span>
        </div>

        {/* Validation Error */}
        {errors.content && (
          <p className="text-sm text-error-600 mt-1">{errors.content.message}</p>
        )}
        {errors.image && (
          <p className="text-sm text-error-600 mt-1">{errors.image.message}</p>
        )}
      </div>

      {/* Image Section */}
      <div className="pt-4 border-t border-neutral-100">
        {!imagePreview ? (
          <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer transition-colors">
            <ImageIcon className="size-5" />
            <span className="text-sm font-medium">Add Photo</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageSelect}
              className="sr-only"
            />
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-neutral-200">
            <img
              src={imagePreview}
              alt="Post attachment"
              className="w-full max-h-48 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-neutral-900/60 hover:bg-neutral-900/80 rounded-full text-white transition-colors"
              aria-label="Remove image"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
