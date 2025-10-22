import { useState, useMemo, useCallback } from "react";
import type { Route } from "./+types/circle-detail";
import { useNavigate, useParams } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { CircleHero } from "app/components/circle/circle-hero";
import { CircleProgress } from "app/components/circle/circle-progress";
import { CircleActivityFeed } from "app/components/circle/circle-activity-feed";
import { UserAvatar } from "app/components/ui/user-avatar";
import { mockCircles, mockCircleActivity } from "app/lib/mock-data";
import type { FeedItem } from "app/types/feed";
import { Home, Compass, PlusCircle, Bell, User } from "lucide-react";
import { mapGroupToCircle } from "app/lib/map-group-to-circle";
import { fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";

// Client-side loader to fetch group data (runs in browser, SPA-compatible)
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
	const groupDescription = loaderData?.group?.metadata?.description;

	return [
		{ title: groupName ? `${groupName} - Xersha` : "Circle - Xersha" },
		{
			name: "description",
			content: groupDescription || "View circle details and activity",
		},
	];
}

export default function CircleDetail({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const params = useParams();
	const circleId = params.id;

	// Use group data from loader (already fetched during route load)
	const group = loaderData?.group;
	const loaderError = loaderData?.error;

	// State management
	const [activityItems, setActivityItems] =
		useState<FeedItem[]>(mockCircleActivity);

	// Convert Lens group to Circle format
	const circle = useMemo(() => {
		if (group) {
			return mapGroupToCircle(group);
		}
		return null;
	}, [group]);

	// Handle like action
	const handleLike = useCallback((itemId: string) => {
		setActivityItems((items) =>
			items.map((item) =>
				item.id === itemId
					? {
							...item,
							isLiked: !item.isLiked,
							likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1,
						}
					: item,
			),
		);
	}, []);

	// Handle comment action (placeholder)
	const handleComment = useCallback((itemId: string) => {
		console.log("Comment on item:", itemId);
		// TODO: Implement comment functionality
	}, []);

	// Handle contribute action
	const handleContribute = useCallback(() => {
		console.log("Contribute to circle:", circleId);
		// TODO: Implement contribution modal/flow
	}, [circleId]);

	// Handle invite action - navigate to invites page
	const handleInvite = useCallback(() => {
		navigate(`/circle/${circleId}/invites`);
	}, [navigate, circleId]);

	// Handle share action
	const handleShare = useCallback(() => {
		console.log("Share circle:", circleId);
		// TODO: Implement share functionality
	}, [circleId]);

	// Handle join action (for non-members)
	const handleJoin = useCallback(() => {
		console.log("Join circle:", circleId);
		// TODO: Implement join functionality
	}, [circleId]);

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
								className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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

	// If circle not found, show 404
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

	// Check if user is a member (mock: always true for circles in mockCircles)
	const isMember = true;// mockCircles.some((c) => c.id === circleId);

	return (
		<AuthenticatedLayout
			notificationCount={3}
			onNotificationClick={() => console.log("Notifications clicked")}
			onProfileClick={() => navigate("/profile")}
			onNewContribution={handleContribute}
			navItems={navItems}
		>
			{/* Hero Section */}
			<CircleHero
				circle={circle}
				onContribute={handleContribute}
				onInvite={handleInvite}
				onShare={handleShare}
				onJoin={handleJoin}
				isMember={isMember}
			/>

			{/* Main Content */}
			<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				<div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
					{/* Progress Section */}
					<div className="card-enter">
						<CircleProgress circle={circle} />
					</div>

					{/* Members Preview */}
					<button
						onClick={() => navigate(`/circle/${circleId}/members`)}
						className="flex items-center gap-3 p-4 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
					>
						<div className="flex -space-x-2">
							{circle.members.slice(0, 4).map((member) => (
								<UserAvatar
									key={member.id}
									user={member}
									size="md"
									className="size-10 ring-2 ring-white"
								/>
							))}
						</div>
						<div className="flex-1 text-left">
							<p className="text-sm font-semibold text-neutral-900">
								{circle.memberCount} Members
							</p>
							{circle.memberCount > 4 && (
								<p className="text-xs text-neutral-600">
									and {circle.memberCount - 4} others
								</p>
							)}
						</div>
						<svg
							className="size-5 text-neutral-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					{/* Activity Feed */}
					<CircleActivityFeed
						items={activityItems}
						onLike={handleLike}
						onComment={handleComment}
					/>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
