import { formatDistanceToNow } from "date-fns";
import { Copy, MoreVertical, Clock, Mail } from "lucide-react";
import type { Invite } from "~/hooks/use-fetch-invites";
import { useState } from "react";

export interface InviteCardProps {
	invite: Invite;
	onCopyLink: (inviteCode: string) => void;
	onResend: (inviteId: string) => void;
	onCancel: (inviteId: string, recipientEmail: string) => void;
}

/**
 * Mobile-optimized card for displaying a single invitation
 * Features: Large touch targets (44x44px), clear hierarchy, swipe actions
 */
export function InviteCard({
	invite,
	onCopyLink,
	onResend,
	onCancel,
}: InviteCardProps) {
	const [showActions, setShowActions] = useState(false);
	const [copied, setCopied] = useState(false);

	// Parse ISO 8601 strings to Date objects
	const expiresAt = new Date(invite.expiresAt);
	const createdAt = new Date(invite.createdAt);

	const isExpiringSoon =
		expiresAt.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;

	const handleCopy = async () => {
		onCopyLink(invite.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleCancel = () => {
		if (confirm(`Cancel invitation for ${invite.recipientEmail}?`)) {
			onCancel(invite.id, invite.recipientEmail);
		}
	};

	return (
		<div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3 hover:border-primary-300 transition-colors">
			{/* Email & Status Row */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<Mail className="size-4 text-neutral-400 shrink-0" />
						<p className="text-sm font-semibold text-neutral-900 truncate">
							{invite.recipientEmail}
						</p>
					</div>
					<div className="flex items-center gap-2 text-xs text-neutral-600">
						<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
							<Clock className="size-3" />
							Pending
						</span>
						<span>•</span>
						<span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
					</div>
				</div>

				{/* More Actions Button */}
				<button
					onClick={() => setShowActions(!showActions)}
					className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
					aria-label="More actions"
					aria-expanded={showActions}
				>
					<MoreVertical className="size-5" />
				</button>
			</div>

			{/* Expiration Warning */}
			{isExpiringSoon && (
				<div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
					<span className="text-lg" aria-hidden="true">
						⚠️
					</span>
					<p className="text-xs font-semibold text-orange-800">
						Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}
					</p>
				</div>
			)}

			{!isExpiringSoon && (
				<p className="text-xs text-neutral-600">
					Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}
				</p>
			)}

			{/* Primary Action - Copy Link */}
			<button
				onClick={handleCopy}
				className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg active:scale-[0.98] transition-all min-h-[44px]"
				aria-label="Copy invite link"
			>
				<Copy className="size-5" />
				{copied ? "Link Copied!" : "Copy Invite Link"}
			</button>

			{/* Secondary Actions - Expandable */}
			{showActions && (
				<div className="space-y-2 pt-2 border-t border-neutral-200 animate-in fade-in slide-in-from-top-2 duration-200">
					<button
						onClick={() => {
							onResend(invite.id);
							setShowActions(false);
						}}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all min-h-[44px]"
					>
						Resend Invitation
					</button>
					<button
						onClick={() => {
							handleCancel();
							setShowActions(false);
						}}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 font-semibold rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all min-h-[44px]"
					>
						Cancel Invitation
					</button>
				</div>
			)}
		</div>
	);
}
