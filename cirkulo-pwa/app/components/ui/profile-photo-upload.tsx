import * as React from "react";
import { Camera, Pencil, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "app/lib/utils";

export interface ProfilePhotoUploadProps {
	value: File | null;
	onChange: (file: File | null) => void;
	error?: string;
	disabled?: boolean;
	className?: string;
}

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MIN_DIMENSIONS = 200;

export function ProfilePhotoUpload({
	value,
	onChange,
	error,
	disabled = false,
	className,
}: ProfilePhotoUploadProps) {
	const [preview, setPreview] = React.useState<string | null>(null);
	const [isValidating, setIsValidating] = React.useState(false);
	const [internalError, setInternalError] = React.useState<string | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// Combine external and internal errors
	const displayError = error || internalError;

	// Cleanup preview URL on unmount
	React.useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	// Validate file
	const validateFile = async (file: File): Promise<string | null> => {
		// Check file type
		if (!ACCEPTED_TYPES.includes(file.type)) {
			return "Invalid file type. Use JPG, PNG, or WebP";
		}

		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			return "File too large. Maximum size is 5MB";
		}

		// Check image dimensions
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				URL.revokeObjectURL(img.src);
				if (img.width < MIN_DIMENSIONS || img.height < MIN_DIMENSIONS) {
					resolve(
						`Image too small. Minimum ${MIN_DIMENSIONS}×${MIN_DIMENSIONS} pixels`,
					);
				} else {
					resolve(null);
				}
			};
			img.onerror = () => {
				URL.revokeObjectURL(img.src);
				resolve("Failed to load image. Please try another file");
			};
			img.src = URL.createObjectURL(file);
		});
	};

	// Handle file selection
	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsValidating(true);
		setInternalError(null);

		// Validate file
		const validationError = await validateFile(file);
		if (validationError) {
			setInternalError(validationError);
			setIsValidating(false);
			setPreview(null);
			onChange(null);
			return;
		}

		// Create preview
		const previewUrl = URL.createObjectURL(file);
		setPreview(previewUrl);
		onChange(file);
		setIsValidating(false);
	};

	// Handle click to open file picker
	const handleClick = () => {
		if (!disabled) {
			fileInputRef.current?.click();
		}
	};

	// Handle remove
	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (preview) URL.revokeObjectURL(preview);
		setPreview(null);
		setInternalError(null);
		onChange(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Handle keyboard interaction
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleClick();
		}
	};

	return (
		<div className={cn("flex flex-col items-center space-y-3", className)}>
			{/* Avatar container */}
			<button
				type="button"
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				disabled={disabled || isValidating}
				className={cn(
					"relative size-24 rounded-full transition-all duration-200 outline-none",
					"focus-visible:ring-[3px] focus-visible:ring-primary-500/30",
					!preview &&
						!displayError &&
						"border-[3px] border-dashed border-neutral-300",
					!preview &&
						!displayError &&
						"hover:border-primary-500 hover:scale-[1.02]",
					preview && "border-[3px] border-solid border-primary-500 shadow-lg",
					displayError && "border-[3px] border-solid border-error-500",
					disabled && "opacity-60 cursor-not-allowed",
					!disabled && "cursor-pointer",
				)}
				aria-label={
					preview ? "Change profile photo" : "Add profile photo (optional)"
				}
				aria-describedby="photo-helper-text"
				aria-invalid={!!displayError}
			>
				{/* Empty state */}
				{!preview && !isValidating && !displayError && (
					<div className="size-full flex flex-col items-center justify-center bg-neutral-50 rounded-full">
						<Camera className="size-10 text-neutral-400 mb-1" aria-hidden="true" />
						<span className="text-sm font-medium text-neutral-600">Add</span>
						<span className="text-sm font-medium text-neutral-600">Photo</span>
					</div>
				)}

				{/* Preview state */}
				{preview && !isValidating && (
					<img
						src={preview}
						alt=""
						className="size-full rounded-full object-cover"
						role="presentation"
					/>
				)}

				{/* Loading state */}
				{isValidating && (
					<div className="size-full flex flex-col items-center justify-center bg-neutral-50 rounded-full">
						<Loader2
							className="size-8 text-primary-500 animate-spin"
							aria-hidden="true"
						/>
						<span className="text-xs text-neutral-600 mt-2">Validating...</span>
					</div>
				)}

				{/* Error state */}
				{displayError && !preview && (
					<div className="size-full flex flex-col items-center justify-center bg-error-50 rounded-full">
						<AlertCircle
							className="size-10 text-error-500 mb-1"
							aria-hidden="true"
						/>
						<span className="text-xs font-medium text-error-600">Error</span>
					</div>
				)}
			</button>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				onChange={handleFileChange}
				className="sr-only"
				disabled={disabled}
				aria-hidden="true"
			/>

			{/* Helper text or error message */}
			{!displayError && (
				<p
					id="photo-helper-text"
					className="text-xs text-neutral-500 text-center"
				>
					Tap to add photo (optional)
				</p>
			)}

			{displayError && (
				<div
					role="alert"
					className="flex items-center gap-1.5 text-sm text-error-600"
				>
					<AlertCircle className="size-4 shrink-0" aria-hidden="true" />
					<span>{displayError}</span>
				</div>
			)}

			{/* Action buttons (edit/remove) - only show when preview exists */}
			{preview && !isValidating && (
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleClick}
						disabled={disabled}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
							"text-primary-600 hover:bg-primary-50 active:bg-primary-100",
							"transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30",
							disabled && "opacity-60 cursor-not-allowed",
						)}
						aria-label="Edit profile photo"
					>
						<Pencil className="size-3.5" aria-hidden="true" />
						Edit
					</button>

					<button
						type="button"
						onClick={handleRemove}
						disabled={disabled}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
							"text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200",
							"transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/30",
							disabled && "opacity-60 cursor-not-allowed",
						)}
						aria-label="Remove profile photo"
					>
						<Trash2 className="size-3.5" aria-hidden="true" />
						Remove
					</button>
				</div>
			)}
		</div>
	);
}
