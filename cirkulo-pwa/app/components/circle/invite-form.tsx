import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteSchema, type InviteFormData } from "~/schemas/invite-schema";
import { useSendInvite } from "~/hooks/use-send-invite";
import { Send } from "lucide-react";

export interface InviteFormProps {
	circleName: string;
	circleId: string;
	onSuccess?: (inviteCode: string) => void; // Optional callback after successful invite
}

/**
 * Form for inviting users to a private circle via email
 * Features: react-hook-form validation, accessibility, loading states, API integration
 */
export function InviteForm({ circleName, circleId, onSuccess }: InviteFormProps) {
	const [success, setSuccess] = useState(false);

	// Setup TanStack Query mutation for sending invites
	const { mutateAsync: sendInviteMutation, isPending } = useSendInvite();

	// Setup react-hook-form with Zod validation
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<InviteFormData>({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			email: "",
		},
	});

	// Handle form submission
	const onSubmitForm = useCallback(
		async (data: InviteFormData) => {
			try {
				// Send invite via API
				const response = await sendInviteMutation({
					recipientEmail: data.email,
					groupAddress: circleId,
				});

				setSuccess(true);
				reset();

				// Call optional success callback
				if (onSuccess) {
					onSuccess(response.inviteCode);
				}

				// Clear success message after 3 seconds
				setTimeout(() => {
					setSuccess(false);
				}, 3000);
			} catch (err) {
				// Set server-side error on email field
				setError("email", {
					type: "manual",
					message:
						err instanceof Error
							? err.message
							: "Failed to send invitation. Please try again.",
				});
			}
		},
		[sendInviteMutation, circleId, onSuccess, reset, setError]
	);

	return (
		<div className="space-y-5">
			{/* Success Message */}
			{success && (
				<div
					className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
					role="alert"
					aria-live="polite"
				>
					<div className="text-2xl" aria-hidden="true">
						✅
					</div>
					<div>
						<p className="font-semibold text-green-900">Invitation Sent!</p>
						<p className="text-sm text-green-700">
							Your invite has been sent successfully.
						</p>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
				{/* Email Input */}
				<div>
					<label
						htmlFor="invite-email"
						className="block text-sm font-semibold text-neutral-900 mb-2"
					>
						Email Address
						<span className="text-red-500 ml-1" aria-label="required">
							*
						</span>
					</label>
					<div className="relative">
						<input
							id="invite-email"
							type="email"
							{...register("email")}
							disabled={isSubmitting}
							placeholder="friend@example.com"
							autoComplete="email"
							inputMode="email"
							enterKeyHint="send"
							className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed transition-shadow text-base"
							aria-describedby="email-help email-error"
							aria-invalid={errors.email ? "true" : "false"}
						/>
						<div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
							<Send className="size-5" />
						</div>
					</div>
					<p id="email-help" className="text-xs text-neutral-600 mt-2">
						Enter the email address of the person you want to invite
					</p>
					{errors.email && (
						<p
							id="email-error"
							className="text-sm text-red-600 mt-2 flex items-center gap-1"
							role="alert"
						>
							<span aria-hidden="true">⚠️</span>
							{errors.email.message}
						</p>
					)}
				</div>

				{/* Submit Button */}
				<button
					type="submit"
					disabled={isSubmitting || isPending}
					className="w-full px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none touch-manipulation min-h-[44px]"
				>
					{(isSubmitting || isPending) ? (
						<span className="flex items-center justify-center gap-2">
							<span
								className="inline-block size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
								aria-hidden="true"
							/>
							Sending Invitation...
						</span>
					) : (
						<span className="flex items-center justify-center gap-2">
							<Send className="size-5" />
							Send Invitation
						</span>
					)}
				</button>
			</form>

			{/* Info Box */}
			<div className="p-3 sm:p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
				<p className="text-xs sm:text-sm text-neutral-700">
					<span className="font-semibold">💡 Note:</span> Invited members will
					receive an email with a unique invitation link to join{" "}
					<span className="font-semibold">{circleName}</span>. Invitations
					expire after 7 days.
				</p>
			</div>
		</div>
	);
}
