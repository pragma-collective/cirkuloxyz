import { formatDistanceToNow } from "date-fns";
import { Copy, RotateCw, Trash2, Clock } from "lucide-react";
import type { Invite } from "~/hooks/use-fetch-invites";
import { InviteCard } from "./invite-card";

export interface InvitesTableProps {
	invites: Invite[];
	onCopyLink: (inviteCode: string) => void;
	onResend: (inviteId: string) => void;
	onCancel: (inviteId: string) => void;
}

/**
 * Responsive invitations list with table (desktop) and cards (mobile)
 * Features: Mobile-first design, large touch targets, accessibility
 */
export function InvitesTable({
	invites,
	onCopyLink,
	onResend,
	onCancel,
}: InvitesTableProps) {
	if (invites.length === 0) {
		return (
			<div className="p-8 sm:p-12 text-center">
				<div className="text-5xl sm:text-6xl mb-4" aria-hidden="true">
					📭
				</div>
				<h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
					No Pending Invitations
				</h3>
				<p className="text-sm sm:text-base text-neutral-600">
					Send your first invitation using the form above
				</p>
			</div>
		);
	}

	return (
		<>
			{/* Mobile Card Layout (< md breakpoint) */}
			<div className="md:hidden space-y-3 p-4">
				{invites.map((invite) => (
					<InviteCard
						key={invite.id}
						invite={invite}
						onCopyLink={onCopyLink}
						onResend={onResend}
						onCancel={onCancel}
					/>
				))}
			</div>

			{/* Desktop Table Layout (>= md breakpoint) */}
			<div className="hidden md:block overflow-x-auto">
			<table className="w-full">
				<thead className="bg-neutral-50 border-b border-neutral-200">
					<tr>
						<th
							scope="col"
							className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
						>
							Email
						</th>
						<th
							scope="col"
							className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
						>
							Status
						</th>
						<th
							scope="col"
							className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
						>
							Sent
						</th>
						<th
							scope="col"
							className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
						>
							Expires
						</th>
						<th
							scope="col"
							className="px-6 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-neutral-200">
					{invites.map((invite) => {
						// Parse ISO 8601 strings to Date objects
						const expiresAt = new Date(invite.expiresAt);
						const createdAt = new Date(invite.createdAt);
						
						const isExpiringSoon =
							expiresAt.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000; // Less than 2 days

						return (
							<tr
								key={invite.id}
								className="hover:bg-neutral-50 transition-colors"
							>
								{/* Email */}
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-neutral-900">
											{invite.recipientEmail}
										</span>
									</div>
								</td>

								{/* Status */}
								<td className="px-6 py-4">
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
										<Clock className="size-3" />
										Pending
									</span>
								</td>

								{/* Sent */}
								<td className="px-6 py-4">
									<span className="text-sm text-neutral-600">
										{formatDistanceToNow(createdAt, { addSuffix: true })}
									</span>
								</td>

								{/* Expires */}
								<td className="px-6 py-4">
									<div className="flex items-center gap-1.5">
										<span
											className={`text-sm ${
												isExpiringSoon
													? "text-orange-600 font-semibold"
													: "text-neutral-600"
											}`}
										>
											{formatDistanceToNow(expiresAt, {
												addSuffix: true,
											})}
										</span>
										{isExpiringSoon && (
											<span
												className="text-orange-500"
												aria-label="Expiring soon"
											>
												⚠️
											</span>
										)}
									</div>
								</td>

								{/* Actions */}
								<td className="px-6 py-4">
									<div className="flex items-center justify-end gap-2">
										{/* Copy Link */}
										<button
											onClick={() => onCopyLink(invite.code)}
											className="p-3 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
											aria-label="Copy invite link"
											title="Copy invite link"
										>
											<Copy className="size-5" />
										</button>

										{/* Resend */}
										<button
											onClick={() => onResend(invite.id)}
											className="p-3 text-neutral-600 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors touch-manipulation"
											aria-label="Resend invitation"
											title="Resend invitation"
										>
											<RotateCw className="size-5" />
										</button>

										{/* Cancel */}
										<button
											onClick={() => {
												if (
													confirm(
														`Cancel invitation for ${invite.recipientEmail}?`
													)
												) {
													onCancel(invite.id);
												}
											}}
											className="p-3 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
											aria-label="Cancel invitation"
											title="Cancel invitation"
										>
											<Trash2 className="size-5" />
										</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			</div>
		</>
	);
}
