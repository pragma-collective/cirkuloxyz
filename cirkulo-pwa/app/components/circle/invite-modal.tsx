import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { inviteSchema, type InviteFormData } from "~/schemas/invite-schema";
import { useSendInvite } from "~/hooks/use-send-invite";

export interface InviteModalProps {
	isOpen: boolean;
	onClose: () => void;
	circleName: string;
	circleId: string;
}

/**
 * Modal for inviting users to a private circle via email
 * Features: Single email input, react-hook-form validation, accessibility
 */
export function InviteModal({
	isOpen,
	onClose,
	circleName,
	circleId,
}: InviteModalProps) {
	const [success, setSuccess] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	// Setup TanStack Query mutation for sending invites
	const { mutateAsync: sendInviteMutation } = useSendInvite();

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

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			// Reset form state when opening
			reset();
			setSuccess(false);
		}
	}, [isOpen, reset]);

	// Handle ESC key to close modal
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen && !isSubmitting) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, isSubmitting, onClose]);

	// Trap focus within modal
	useEffect(() => {
		if (!isOpen) return;

		const modal = modalRef.current;
		if (!modal) return;

		const focusableElements = modal.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		const handleTab = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement?.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement?.focus();
				}
			}
		};

		document.addEventListener("keydown", handleTab);
		return () => document.removeEventListener("keydown", handleTab);
	}, [isOpen]);

	// Handle form submission
	const onSubmitForm = useCallback(
		async (data: InviteFormData) => {
			try {
				// Send invite via API
				await sendInviteMutation({
					recipientEmail: data.email,
					groupAddress: circleId,
				});
				setSuccess(true);

				// Close modal after success message
				setTimeout(() => {
					onClose();
				}, 2000);
			} catch (err) {
				// Set server-side error on email field
				setError("email", {
					type: "manual",
					message:
						err instanceof Error ? err.message : "Failed to send invitation. Please try again.",
				});
			}
		},
		[sendInviteMutation, circleId, onClose, setError]
	);

	// Handle backdrop click
	const handleBackdropClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === e.currentTarget && !isSubmitting) {
				onClose();
			}
		},
		[isSubmitting, onClose]
	);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={handleBackdropClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="invite-modal-title"
			aria-describedby="invite-modal-description"
		>
			<div
				ref={modalRef}
				className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-neutral-200">
					<div>
						<h2
							id="invite-modal-title"
							className="text-2xl font-bold text-neutral-900"
						>
							Invite to Circle
						</h2>
						<p
							id="invite-modal-description"
							className="text-sm text-neutral-600 mt-1"
						>
							Invite friends to join <span className="font-semibold">{circleName}</span>
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="p-2 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Close invite modal"
					>
						<X className="size-5 text-neutral-600" />
					</button>
				</div>

				{/* Success State */}
				{success && (
					<div className="p-6 bg-green-50 border-b border-green-100">
						<div className="flex items-center gap-3">
							<div className="text-3xl">✅</div>
							<div>
								<p className="font-semibold text-green-900">Invitations Sent!</p>
								<p className="text-sm text-green-700">
									Your invites have been sent successfully.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-5">
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
						<input
							id="invite-email"
							type="email"
							{...register("email")}
							disabled={isSubmitting || success}
							placeholder="friend@example.com"
							className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed transition-shadow"
							aria-describedby="email-help email-error"
							aria-invalid={errors.email ? "true" : "false"}
						/>
						<p id="email-help" className="text-xs text-neutral-600 mt-2">
							Enter one email address per invitation
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

					{/* Actions */}
					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting || success}
							className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
						>
							{isSubmitting ? (
								<span className="flex items-center justify-center gap-2">
									<span
										className="inline-block size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
										aria-hidden="true"
									/>
									Sending...
								</span>
							) : success ? (
								"Sent!"
							) : (
								"Send Invitation"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
