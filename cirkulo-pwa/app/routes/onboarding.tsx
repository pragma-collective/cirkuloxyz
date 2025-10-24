import React, { useState, useEffect } from "react";
import type { Route } from "./+types/onboarding";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XershaLogo } from "app/components/xersha-logo";
import { Button } from "app/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "app/components/ui/card";
import { ProfilePhotoUpload } from "app/components/ui/profile-photo-upload";
import {
	CheckCircle2,
	Loader2,
	Info,
	AlertCircle,
	User,
	AtSign,
	FileText,
} from "lucide-react";
import { cn } from "app/lib/utils";
import { storageClient } from "app/lib/grove-storage";
import { account } from "@lens-protocol/metadata";
import {
	authenticateAsOnboardingUser,
	checkUsername,
	useCreateLensAccount,
} from "app/hooks/create-lens-account";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "app/context/auth-context";
import { useLensSession } from "app/context/lens-context";
import {
	onboardingSchema,
	type OnboardingFormData,
} from "app/schemas/onboarding-schema";

// Lens Protocol app address from environment variable
const APP_ADDRESS = import.meta.env.VITE_LENS_APP_ADDRESS;

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Complete Your Profile - Xersha" },
		{
			name: "description",
			content: "Create your Xersha profile to start saving with friends",
		},
	];
}

export default function Onboarding() {
	const navigate = useNavigate();
	const { primaryWallet } = useDynamicContext();
	const { sessionClient, setSessionClient } = useAuth();
	const { createAccount, isCreating } = useCreateLensAccount();

	// UI state
	const [isSuccess, setIsSuccess] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);

	// React Hook Form setup
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<OnboardingFormData>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			name: "",
			lensUsername: "",
			bio: "",
			profilePhoto: null,
		},
	});

	// Watch bio field for character count
	const bioValue = watch("bio") || "";
	const bioCharCount = bioValue.length;
	const bioMaxChars = 280;

	// Handle username blur for real-time availability check
	const handleUsernameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
		const username = e.target.value;

		// Only check if username passes basic validation and we have a session
		if (!username.trim() || errors.lensUsername || !sessionClient) {
			return;
		}

		setIsCheckingUsername(true);

		try {
			const availability = await checkUsername(username.trim(), sessionClient);

			if (!availability.available) {
				setError("lensUsername", {
					type: "manual",
					message: availability.reason || "Username is not available",
				});
			}
		} catch (err) {
			console.error("[Onboarding] Username check error:", err);
			// Don't show error to user for network issues during blur
		} finally {
			setIsCheckingUsername(false);
		}
	};

	// Handle form submission
	const onSubmit = async (data: OnboardingFormData) => {
		try {
			// Check if wallet is connected
			if (!primaryWallet || !APP_ADDRESS) {
				setError("lensUsername", {
					type: "manual",
					message: "Wallet not connected. Please connect your wallet.",
				});
				return;
			}

			// Authenticate as onboarding user (if not already authenticated)
			let activeSessionClient = sessionClient;

			if (!activeSessionClient) {
				console.log("[Onboarding] Authenticating as onboarding user...");

				try {
					// @ts-expect-error - getWalletClient exists at runtime but not in type definition
					const walletClient = await primaryWallet.getWalletClient();
					const authResult = await authenticateAsOnboardingUser(
						primaryWallet.address,
						APP_ADDRESS,
						walletClient,
					);

					if (authResult.sessionClient) {
						activeSessionClient = authResult.sessionClient;
						setSessionClient(authResult.sessionClient);
						console.log("[Onboarding] Successfully authenticated");
					} else {
						const errorMsg =
							authResult.error?.message || "Authentication failed";
						console.error("[Onboarding] Authentication failed:", authResult.error);
						setError("lensUsername", {
							type: "manual",
							message: errorMsg,
						});
						return;
					}
				} catch (authErr) {
					const errorMsg =
						authErr instanceof Error
							? authErr.message
							: "Authentication failed. Please try again.";
					console.error("[Onboarding] Authentication error:", authErr);
					setError("lensUsername", {
						type: "manual",
						message: errorMsg,
					});
					return;
				}
			}

			// Upload profile photo and metadata to Grove
			console.log("[Onboarding] Uploading metadata to Grove storage...");

			let profilePictureUri: string | undefined;

			// Upload profile photo if provided
			if (data.profilePhoto) {
				try {
					console.log("[Onboarding] Uploading profile photo...");
					const photoResponse = await storageClient.uploadFile(
						data.profilePhoto,
					);
					profilePictureUri = photoResponse.uri;
					console.log(
						"[Onboarding] Profile photo uploaded:",
						profilePictureUri,
					);
				} catch (uploadError) {
					console.error("[Onboarding] Photo upload failed:", uploadError);
					setError("profilePhoto", {
						type: "manual",
						message: "Photo upload failed. Continuing without photo.",
					});
					// Photo is optional, continue without it
				}
			}

			// Create account metadata and upload to Grove
			console.log("[Onboarding] Creating and uploading account metadata...");
			const metadataResponse = await storageClient.uploadAsJson(
				account({
					name: data.name,
					picture: profilePictureUri, // lens://... URI from Grove
					bio: data.bio || undefined,
				}),
			);

			console.log("[Onboarding] Metadata uploaded to:", metadataResponse.uri);

			// Create Lens account with metadata URI
			const result = await createAccount({
				username: data.lensUsername.trim(),
				metadataUri: metadataResponse.uri, // lens://... URI from Grove
				walletAddress: primaryWallet.address,
				appAddress: APP_ADDRESS,
				sessionClient: activeSessionClient, // Use authenticated session
			});

			if (result.error) {
				console.error("[Onboarding] Account creation failed:", result.error);
				setError("lensUsername", {
					type: "manual",
					message: result.error?.message || "Failed to create account",
				});
				return;
			}

			console.log("[Onboarding] Account created successfully:", {
				txHash: result.txHash,
				accountAddress: result.accountAddress,
			});

			// Show success state
			setIsSuccess(true);

			// Navigate to dashboard after 1.5 seconds
			setTimeout(() => {
				navigate("/dashboard");
			}, 1500);
		} catch (error) {
			console.error("[Onboarding] Account creation failed:", error);
			setError("lensUsername", {
				type: "manual",
				message:
					error instanceof Error ? error.message : "Failed to create account",
			});
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
			{/* Decorative background blobs */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
			</div>

			{/* Main content */}
			<div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
				<div className="w-full max-w-md space-y-6">
					{/* Logo */}
					<div className="flex flex-col items-center space-y-2">
						<XershaLogo size="md" />
					</div>

					{/* Onboarding card */}
					<Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
						<CardHeader className="space-y-2">
							<CardTitle className="text-2xl font-bold text-center text-neutral-900">
								Create Your Profile
							</CardTitle>
							<CardDescription className="text-center text-base text-neutral-600">
								Tell us about yourself to join the community
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
								{/* Profile Photo Upload */}
								<div className="flex flex-col items-center">
									<ProfilePhotoUpload
										value={watch("profilePhoto") ?? null}
										onChange={(file) => setValue("profilePhoto", file)}
										error={errors.profilePhoto?.message}
										disabled={isSubmitting || isSuccess}
									/>
								</div>

								{/* Name field */}
								<FormField
									label="Name"
									type="text"
									placeholder="Enter your full name"
									error={errors.name?.message}
									icon={<User className="size-5" />}
									required
									disabled={isSubmitting || isSuccess}
									{...register("name")}
								/>

								{/* Lens username field */}
								<FormField
									label="Lens Username"
									type="text"
									placeholder="yourname"
									error={errors.lensUsername?.message}
									icon={<AtSign className="size-5" />}
									required
									disabled={isSubmitting || isSuccess}
									onBlurCapture={handleUsernameBlur}
									helperText={
										<span className="flex items-center gap-1">
											Your unique identifier on Lens Protocol
											<button
												type="button"
												className="relative inline-flex"
												onMouseEnter={() => setShowTooltip(true)}
												onMouseLeave={() => setShowTooltip(false)}
												onClick={(e) => {
													e.preventDefault();
													setShowTooltip(!showTooltip);
												}}
											>
												<Info className="size-3.5 text-info-600 hover:text-info-700 transition-colors" />
												{showTooltip && (
													<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl z-50">
														<div className="space-y-1">
															<p className="font-semibold">
																What is Lens Protocol?
															</p>
															<p className="text-neutral-300">
																Lens is a decentralized social graph that lets
																you own your social identity and connections
																across apps.
															</p>
														</div>
														{/* Tooltip arrow */}
														<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-neutral-900" />
													</div>
												)}
											</button>
										</span>
									}
									{...register("lensUsername")}
								/>

								{/* Bio field */}
								<FormField
									label="Bio"
									type="textarea"
									placeholder="Tell us a bit about yourself... (optional)"
									error={errors.bio?.message}
									icon={<FileText className="size-5" />}
									disabled={isSubmitting || isSuccess}
									helperText={
										<span
											className={cn(
												"text-xs",
												bioCharCount > bioMaxChars
													? "text-error-600"
													: "text-neutral-500",
											)}
										>
											{bioCharCount}/{bioMaxChars} characters
										</span>
									}
									{...register("bio")}
								/>

								{/* Submit button */}
								<Button
									type="submit"
									size="lg"
									className={cn(
										"w-full text-base transition-all duration-200",
										isSuccess &&
											"bg-success-600 hover:bg-success-600 active:bg-success-600",
									)}
									disabled={isSubmitting || isSuccess}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="size-5 animate-spin" />
											Minting Profile...
										</>
									) : isSuccess ? (
										<>
											<CheckCircle2 className="size-5" />
											Profile Created!
										</>
									) : (
										"Mint Profile"
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Trust indicator */}
					<div className="flex justify-center">
						<div className="flex items-center gap-2 text-sm text-neutral-600">
							<CheckCircle2 className="size-4 text-success-600" />
							<span>Your profile is stored securely on-chain</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Form Field Component with react-hook-form support
interface FormFieldProps
	extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
	label: string;
	type: "text" | "textarea";
	error?: string;
	icon?: React.ReactNode;
	required?: boolean;
	helperText?: React.ReactNode;
}

const FormField = React.forwardRef<
	HTMLInputElement | HTMLTextAreaElement,
	FormFieldProps
>(
	(
		{
			label,
			name,
			type,
			placeholder,
			error,
			icon,
			required = false,
			disabled = false,
			helperText,
			...rest
		},
		ref,
	) => {
		const hasError = !!error;

		const inputClasses = cn(
			"w-full rounded-lg border-2 bg-white px-4 text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 outline-none",
			"focus:ring-[3px]",
			hasError
				? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
				: "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30",
			disabled && "opacity-60 cursor-not-allowed",
			type === "textarea" ? "py-3 min-h-[100px] resize-none" : "h-12",
		);

		return (
			<div className="space-y-2">
				{/* Label */}
				<label
					htmlFor={name}
					className="block text-sm font-medium text-neutral-700"
				>
					{label}
					{required && <span className="text-error-500 ml-1">*</span>}
				</label>

				{/* Input wrapper with icon */}
				<div className="relative">
					{icon && (
						<div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
							{icon}
						</div>
					)}

					{type === "textarea" ? (
						<textarea
							ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
							id={name}
							name={name}
							placeholder={placeholder}
							disabled={disabled}
							className={cn(inputClasses, icon && "pl-12")}
							aria-invalid={hasError}
							aria-describedby={
								error
									? `${name}-error`
									: helperText
										? `${name}-helper`
										: undefined
							}
							{...rest}
						/>
					) : (
						<input
							ref={ref as React.ForwardedRef<HTMLInputElement>}
							type={type}
							id={name}
							name={name}
							placeholder={placeholder}
							disabled={disabled}
							className={cn(inputClasses, icon && "pl-12")}
							aria-invalid={hasError}
							aria-describedby={
								error
									? `${name}-error`
									: helperText
										? `${name}-helper`
										: undefined
							}
							{...rest}
						/>
					)}

					{/* Error icon */}
					{hasError && (
						<div className="absolute right-4 top-1/2 -translate-y-1/2 text-error-500">
							<AlertCircle className="size-5" />
						</div>
					)}
				</div>

				{/* Error message */}
				{error && (
					<p
						id={`${name}-error`}
						className="text-sm text-error-600 flex items-center gap-1.5"
					>
						<AlertCircle className="size-4 shrink-0" />
						{error}
					</p>
				)}

				{/* Helper text */}
				{!error && helperText && (
					<p id={`${name}-helper`} className="text-xs text-neutral-500">
						{helperText}
					</p>
				)}
			</div>
		);
	},
);

FormField.displayName = "FormField";
