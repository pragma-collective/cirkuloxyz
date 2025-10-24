import { useState, useMemo, useCallback } from "react";
import type { Route } from "./+types/circle-detail";
import { useNavigate, useParams } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { CircleHero } from "app/components/circle/circle-hero";
import { CircleProgress } from "app/components/circle/circle-progress";
import { CircleActivityFeed } from "app/components/circle/circle-activity-feed";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Button } from "app/components/ui/button";
import { mockCircles, mockCircleActivity } from "app/lib/mock-data";
import type { FeedItem } from "app/types/feed";
import { Home, Compass, PlusCircle, Bell, User, Loader2, AlertCircle } from "lucide-react";
import { mapGroupToCircle } from "app/lib/map-group-to-circle";
import { useFetchCircle } from "~/hooks/use-fetch-circle";
import { useFetchGroupMembers } from "~/hooks/use-fetch-group-members";
import { fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";
import { useReadContract } from "wagmi";
import { formatEther, type Address } from "viem";
import { savingsPoolAbi, donationPoolAbi, roscaPoolAbi } from "app/lib/pool-abis";
import { citreaTestnet } from "app/lib/wagmi";

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

	// Fetch circle data from API
	const { data: circleData, isLoading: isLoadingCircle, error: circleError } = useFetchCircle(circleId);

	// Fetch group members from Lens Protocol
	const { memberCount, loading: isLoadingMembers } = useFetchGroupMembers({ groupAddress: circleId });

	// State management
	const [activityItems, setActivityItems] =
		useState<FeedItem[]>(mockCircleActivity);

	// Convert Lens group to Circle format, merging with API data and member count
	const circle = useMemo(() => {
		if (group) {
			const mappedCircle = mapGroupToCircle(group, circleData?.data);
			// Override member count with real data from Lens Protocol if available
			if (memberCount > 0) {
				return { ...mappedCircle, memberCount };
			}
			return mappedCircle;
		}
		return null;
	}, [group, circleData, memberCount]);

	// Read pool balance from contract
	const { data: totalSaved } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: savingsPoolAbi,
		functionName: "totalSaved",
		query: {
			enabled: !!circle && circle.circleType === "contribution",
		},
		chainId: citreaTestnet.id,
	});

	const { data: totalRaised } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: donationPoolAbi,
		functionName: "totalRaised",
		query: {
			enabled: !!circle && circle.circleType === "fundraising",
		},
		chainId: citreaTestnet.id,
	});

	const { data: currentRound } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: roscaPoolAbi,
		functionName: "currentRound",
		query: {
			enabled: !!circle && circle.circleType === "rotating",
		},
		chainId: citreaTestnet.id,
	});

	// Helper to convert contract balance based on token decimals
	const formatTokenAmount = (amount: bigint, currency: "cusd" | "cbtc"): number => {
		// Both cBTC and CUSD use 18 decimals (standard ERC20 format)
		return Number(formatEther(amount));
	};

	// Read additional contract data for accurate display
	const { data: targetAmount } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: savingsPoolAbi,
		functionName: "targetAmount",
		query: {
			enabled: !!circle && circle.circleType === "contribution",
		},
		chainId: citreaTestnet.id,
	});

	const { data: targetDate } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: savingsPoolAbi,
		functionName: "targetDate",
		query: {
			enabled: !!circle && circle.circleType === "contribution",
		},
		chainId: citreaTestnet.id,
	});

	const { data: fundraisingGoal } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: donationPoolAbi,
		functionName: "goalAmount",
		query: {
			enabled: !!circle && circle.circleType === "fundraising",
		},
		chainId: citreaTestnet.id,
	});

	const { data: fundraisingDeadline } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: donationPoolAbi,
		functionName: "deadline",
		query: {
			enabled: !!circle && circle.circleType === "fundraising",
		},
		chainId: citreaTestnet.id,
	});

	const { data: roscaContributionAmount } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: roscaPoolAbi,
		functionName: "contributionAmount",
		query: {
			enabled: !!circle && circle.circleType === "rotating",
		},
		chainId: citreaTestnet.id,
	});

	// Update circle with on-chain balance data
	const circleWithBalance = useMemo(() => {
		if (!circle) return null;

		let currentAmount = 0;
		let progress = 0;
		let goalAmount = circle.goalAmount || 0;
		let endDate = circle.endDate;

		if (circle.circleType === "contribution") {
			// Contribution: Open-ended savings
			const currency = circle.currency || "cusd";
			currentAmount = totalSaved ? formatTokenAmount(totalSaved as bigint, currency) : 0;

			// Check if contract has optional goal/deadline
			if (targetAmount && Number(targetAmount) > 0) {
				goalAmount = formatTokenAmount(targetAmount as bigint, currency);
			} else {
				goalAmount = 0; // No goal = open-ended
			}

			if (targetDate && Number(targetDate) > 0) {
				endDate = new Date(Number(targetDate) * 1000).toISOString();
			} else {
				endDate = null; // No deadline
			}

			// Only calculate progress if goal exists
			if (goalAmount > 0) {
				progress = Math.min((currentAmount / goalAmount) * 100, 100);
			} else {
				progress = 0; // No progress for open-ended
			}
		}

		else if (circle.circleType === "fundraising") {
			// Fundraising: Goal-based campaign
			const currency = circle.currency || "cusd";
			currentAmount = totalRaised ? formatTokenAmount(totalRaised as bigint, currency) : 0;

			if (fundraisingGoal) {
				goalAmount = formatTokenAmount(fundraisingGoal as bigint, currency);
			}

			if (fundraisingDeadline) {
				endDate = new Date(Number(fundraisingDeadline) * 1000).toISOString();
			}

			if (goalAmount > 0) {
				progress = Math.min((currentAmount / goalAmount) * 100, 100);
			}
		}

		else if (circle.circleType === "rotating") {
			// ROSCA: Round-based progress
			const currency = circle.currency || "cusd";
			const roundsCompleted = currentRound ? Number(currentRound) - 1 : 0;
			const totalRounds = circle.memberCount || 12;
			progress = Math.min((roundsCompleted / totalRounds) * 100, 100);

			if (roscaContributionAmount) {
				const perRoundAmount = formatTokenAmount(roscaContributionAmount as bigint, currency);
				goalAmount = perRoundAmount * totalRounds;
				currentAmount = perRoundAmount * roundsCompleted;
			}
		}

		return {
			...circle,
			currentAmount,
			progress,
			goalAmount: goalAmount || 0,
			endDate
		};
	}, [
		circle,
		totalSaved,
		totalRaised,
		currentRound,
		targetAmount,
		targetDate,
		fundraisingGoal,
		fundraisingDeadline,
		roscaContributionAmount
	]);

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
		navigate(`/circle/${circleId}/contribute`);
	}, [navigate, circleId]);

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

	// Show loading state while fetching circle data from API
	if (isLoadingCircle) {
		return (
			<AuthenticatedLayout
				notificationCount={3}
				onNotificationClick={() => console.log("Notifications clicked")}
				onProfileClick={() => navigate("/profile")}
				onNewContribution={() => console.log("New contribution clicked")}
				navItems={navItems}
			>
				<div className="flex flex-col items-center justify-center py-16 px-4">
					<Loader2 className="size-12 text-primary-600 animate-spin mb-6" />
					<h2 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
						Loading Circle Details
					</h2>
					<p className="text-neutral-600 text-center max-w-md">
						Fetching circle configuration from database...
					</p>
				</div>
			</AuthenticatedLayout>
		);
	}

	// Show error state if API fetch failed
	if (circleError) {
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
						<div className="flex justify-center mb-4">
							<AlertCircle className="size-16 text-error-500" />
						</div>
						<h1 className="text-3xl font-bold text-neutral-900">
							Error Loading Circle Configuration
						</h1>
						<p className="text-neutral-600">
							Failed to load circle details from database. The circle may not have been configured yet.
						</p>
						<div className="pt-4 space-x-4">
							<Button
								onClick={() => window.location.reload()}
								className="bg-linear-to-r from-primary-500 to-secondary-500 text-white"
							>
								Try Again
							</Button>
							<Button
								onClick={() => navigate("/dashboard")}
								variant="outline"
							>
								Back to Dashboard
							</Button>
						</div>
					</div>
				</div>
			</AuthenticatedLayout>
		);
	}

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
								className="px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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

	// Safety check - should never happen since we check !circle earlier
	if (!circleWithBalance) {
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
							Error Loading Circle Data
						</h1>
						<p className="text-neutral-600">
							Failed to process circle data. Please try again.
						</p>
						<div className="pt-4">
							<button
								onClick={() => window.location.reload()}
								className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
							>
								Try Again
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
			onNewContribution={handleContribute}
			navItems={navItems}
		>
			{/* Hero Section */}
			<CircleHero
				circle={circleWithBalance}
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
						<CircleProgress circle={circleWithBalance} />
					</div>

					{/* Members Preview */}
					<button
						onClick={() => navigate(`/circle/${circleId}/members`)}
						className="flex items-center gap-3 p-4 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all"
					>
						<div className="flex -space-x-2">
							{circleWithBalance.members.slice(0, 4).map((member) => (
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
								{circleWithBalance.memberCount} Members
							</p>
							{circleWithBalance.memberCount > 4 && (
								<p className="text-xs text-neutral-600">
									and {circleWithBalance.memberCount - 4} others
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
