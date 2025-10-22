import { useState, useCallback, useMemo } from "react";
import type { Route } from "./+types/circle-invites";
import { useNavigate, useParams } from "react-router";
import { AuthenticatedLayout } from "~/components/layouts/authenticated-layout";
import { InviteForm } from "~/components/circle/invite-form";
import { InvitesTable } from "~/components/circle/invites-table";
import { fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { lensClient } from "~/lib/lens";
import { mapGroupToCircle } from "~/lib/map-group-to-circle";
import { Home, Compass, PlusCircle, Bell, User, ArrowLeft } from "lucide-react";

// Mock invites data matching the DB schema
const mockInvites = [
	{
		id: "1",
		code: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
		recipientEmail: "alice@example.com",
		groupAddress: "0x123...",
		senderAddress: "0xabc...",
		status: "pending" as const,
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
		createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
	},
	{
		id: "2",
		code: "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
		recipientEmail: "bob@example.com",
		groupAddress: "0x123...",
		senderAddress: "0xabc...",
		status: "pending" as const,
		expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
		createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
	},
	{
		id: "3",
		code: "c3d4e5f6-a7b8-9012-3456-7890abcdef12",
		recipientEmail: "charlie@example.com",
		groupAddress: "0x123...",
		senderAddress: "0xabc...",
		status: "pending" as const,
		expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
		createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
	},
];

export type Invite = typeof mockInvites[number];

// Client-side loader to fetch group data
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const groupAddress = params.id;
	
	if (!groupAddress || !groupAddress.startsWith("0x") || groupAddress.length !== 42) {
		return { group: null, error: "Invalid address" };
	}

	try {
		const result = await fetchGroup(lensClient, {
			group: evmAddress(groupAddress),
		});

		if (result.isErr()) {
			return { group: null, error: result.error.message };
		}

		return { group: result.value, error: null };
	} catch (error) {
		console.error("[ClientLoader] Error fetching group:", error);
		return { group: null, error: "Failed to fetch group" };
	}
}

export function meta({ loaderData }: Route.MetaArgs) {
	const groupName = loaderData?.group?.metadata?.name;

	return [
		{ title: groupName ? `Invites - ${groupName} - Xersha` : "Invites - Xersha" },
		{
			name: "description",
			content: "Manage circle invitations and invite new members",
		},
	];
}

export default function CircleInvites({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const params = useParams();
	const circleId = params.id;

	const group = loaderData?.group;
	const loaderError = loaderData?.error;

	// State for invites (mock data for now)
	const [invites, setInvites] = useState<Invite[]>(mockInvites);

	// Convert Lens group to Circle format
	const circle = useMemo(() => {
		if (group) {
			return mapGroupToCircle(group);
		}
		return null;
	}, [group]);

	// Filter only pending invites
	const pendingInvites = useMemo(() => {
		return invites.filter((invite) => invite.status === "pending");
	}, [invites]);

	// Handle new invite submission
	const handleInviteSubmit = useCallback(async (email: string) => {
		// TODO: Replace with actual API call
		console.log("Sending invite to:", email, "for circle:", circleId);
		
		// Mock: Add new invite to the list
		const newInvite: Invite = {
			id: `${invites.length + 1}`,
			code: crypto.randomUUID(),
			recipientEmail: email,
			groupAddress: circleId || "0x123...",
			senderAddress: "0xabc...",
			status: "pending",
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			createdAt: new Date(),
		};

		setInvites((prev) => [newInvite, ...prev]);
	}, [circleId, invites.length]);

	// Handle copy invite link
	const handleCopyLink = useCallback(async (inviteCode: string) => {
		const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
		try {
			await navigator.clipboard.writeText(inviteUrl);
			// TODO: Show toast notification
			console.log("Invite link copied:", inviteUrl);
		} catch (error) {
			console.error("Failed to copy invite link:", error);
		}
	}, []);

	// Handle resend invite
	const handleResend = useCallback(async (inviteId: string) => {
		// TODO: Implement resend API call
		console.log("Resending invite:", inviteId);
	}, []);

	// Handle cancel invite
	const handleCancel = useCallback((inviteId: string) => {
		// TODO: Implement cancel API call
		console.log("Cancelling invite:", inviteId);
		
		// Mock: Remove from list
		setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
	}, []);

	// Navigation items for layout
	const navItems = [
		{
			icon: <Home className="size-6" />,
			label: "Home",
			to: "/dashboard",
		},
		{
			icon: <Compass className="size-6" />,
			label: "Explore",
			to: "/explore",
		},
		{
			icon: <PlusCircle className="size-6" />,
			label: "Create",
			onClick: () => navigate("/create-circle"),
		},
		{
			icon: <Bell className="size-6" />,
			label: "Alerts",
			badge: 0,
		},
		{
			icon: <User className="size-6" />,
			label: "Profile",
			onClick: () => navigate("/profile"),
		},
	];

	// Show error state if group fetch failed
	if (loaderError) {
		return (
			<AuthenticatedLayout
				notificationCount={3}
				onNotificationClick={() => console.log("Notifications clicked")}
				onProfileClick={() => navigate("/profile")}
				onNewContribution={() => console.log("New contribution clicked")}
				navItems={navItems}
			>
				<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="max-w-2xl mx-auto text-center space-y-4">
						<div className="text-6xl mb-4">⚠️</div>
						<h1 className="text-3xl font-bold text-neutral-900">
							Error Loading Circle
						</h1>
						<p className="text-neutral-600">
							{loaderError || "Failed to load circle details from Lens Protocol"}
						</p>
						<div className="pt-4 space-x-4">
							<button
								onClick={() => window.location.reload()}
								className="px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
							>
								Try Again
							</button>
							<button
								onClick={() => navigate("/dashboard")}
								className="px-6 py-3 bg-neutral-200 text-neutral-900 rounded-xl font-semibold hover:bg-neutral-300 transition-all"
							>
								Back to Dashboard
							</button>
						</div>
					</div>
				</div>
			</AuthenticatedLayout>
		);
	}

	if (!circle) {
		return (
			<AuthenticatedLayout
				notificationCount={3}
				onNotificationClick={() => console.log("Notifications clicked")}
				onProfileClick={() => navigate("/profile")}
				onNewContribution={() => console.log("New contribution clicked")}
				navItems={navItems}
			>
				<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="max-w-2xl mx-auto text-center space-y-4">
						<div className="text-6xl mb-4">🔍</div>
						<h1 className="text-3xl font-bold text-neutral-900">
							Circle Not Found
						</h1>
						<p className="text-neutral-600">
							The circle you're looking for doesn't exist or has been removed.
						</p>
						<div className="pt-4">
							<button
								onClick={() => navigate("/dashboard")}
								className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
							>
								Back to Dashboard
							</button>
						</div>
					</div>
				</div>
			</AuthenticatedLayout>
		);
	}

	return (
		<AuthenticatedLayout
			notificationCount={3}
			onNotificationClick={() => console.log("Notifications clicked")}
			onProfileClick={() => navigate("/profile")}
			onNewContribution={() => console.log("New contribution clicked")}
			navItems={navItems}
		>
			<div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
				<div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
					{/* Header with Back Navigation */}
					<div className="flex items-center gap-3 sm:gap-4">
						<button
							onClick={() => navigate(`/circle/${circleId}`)}
							className="p-2 sm:p-2.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors touch-manipulation"
							aria-label="Back to circle details"
						>
							<ArrowLeft className="size-5 sm:size-6 text-neutral-600" />
						</button>
						<div className="flex-1 min-w-0">
							<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">
								Invite Members
							</h1>
							<p className="text-sm sm:text-base text-neutral-600 mt-0.5 sm:mt-1 truncate">
								Invite people to join <span className="font-semibold">{circle.name}</span>
							</p>
						</div>
					</div>

					{/* Invite Form Card */}
					<div className="card-enter bg-white rounded-xl sm:rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-sm">
						<InviteForm
							circleName={circle.name}
							onSubmit={handleInviteSubmit}
						/>
					</div>

					{/* Pending Invites Section */}
					<div className="card-enter bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
						<div className="p-4 sm:p-6 border-b border-neutral-200">
							<div className="flex items-center justify-between gap-3">
								<div className="flex-1 min-w-0">
									<h2 className="text-lg sm:text-xl font-bold text-neutral-900">
										Pending Invitations
									</h2>
									<p className="text-xs sm:text-sm text-neutral-600 mt-0.5 sm:mt-1">
										{pendingInvites.length} {pendingInvites.length === 1 ? "invite" : "invites"} waiting for acceptance
									</p>
								</div>
								{pendingInvites.length > 0 && (
									<div className="px-2.5 sm:px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs sm:text-sm font-semibold shrink-0">
										{pendingInvites.length}
									</div>
								)}
							</div>
						</div>
						
						<InvitesTable
							invites={pendingInvites}
							onCopyLink={handleCopyLink}
							onResend={handleResend}
							onCancel={handleCancel}
						/>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
