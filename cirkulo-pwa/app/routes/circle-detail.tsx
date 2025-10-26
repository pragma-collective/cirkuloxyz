import { useState, useMemo, useCallback, useEffect } from "react";
import type { Route } from "./+types/circle-detail";
import { useNavigate, useParams } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { CircleHeaderCompact } from "app/components/circle/circle-header-compact";
import { CircleStatsDrawer } from "app/components/circle/circle-stats-drawer";
import { CircleActionsBar } from "app/components/circle/circle-actions-bar";
import { CircleMembersBar } from "app/components/circle/circle-members-bar";
import { CircleFAB } from "app/components/circle/circle-fab";
import { PostComposerSheet } from "app/components/circle/post-composer-sheet";
import { CircleActivityFeed } from "app/components/circle/circle-activity-feed";
import { CommentModal } from "app/components/circle/comment-modal";
import { UserAvatar } from "app/components/ui/user-avatar";
import { Button } from "app/components/ui/button";
import { mockCircles, mockCircleActivity } from "app/lib/mock-data";
import type { FeedItem } from "app/types/feed";
import { Home, Compass, PlusCircle, Wallet, User, Loader2, AlertCircle } from "lucide-react";
import { mapGroupToCircle } from "app/lib/map-group-to-circle";
import { useFetchCircle } from "~/hooks/use-fetch-circle";
import { useFetchGroupMembers } from "~/hooks/use-fetch-group-members";
import { useFetchGroupPosts } from "~/hooks/use-fetch-group-posts";
import { useCreatePost } from "~/hooks/use-create-post";
import { usePostReactions } from "~/hooks/use-post-reactions";
import { fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";
import { useReadContract } from "wagmi";
import { formatEther, type Address } from "viem";
import { savingsPoolAbi, donationPoolAbi, roscaPoolAbi, erc20Abi } from "app/lib/pool-abis";
import { citreaTestnet } from "app/lib/wagmi";
import { useAuth } from "~/context/auth-context";
import { useLensSession } from "~/context/lens-context";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { PostFormData } from "~/schemas/post-schema";

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
	const auth = useAuth();
	const circleId = params.id;

	// Use group data from loader (already fetched during route load)
	const group = loaderData?.group;
	const loaderError = loaderData?.error;

	// Fetch circle data from API
	const { data: circleData, isLoading: isLoadingCircle, error: circleError } = useFetchCircle(circleId);

	// Fetch group members from Lens Protocol
	const { members, memberCount, loading: isLoadingMembers } = useFetchGroupMembers({ groupAddress: circleId });

	// Lens session and wallet for post creation and reactions
	const { sessionClient, selectedAccount } = useLensSession();
	const { primaryWallet } = useDynamicContext();

	// Fetch group posts from Lens Protocol
	const { posts: fetchedPosts, loading: isLoadingPosts, error: postsError, refetch: refetchPosts } = useFetchGroupPosts({
		groupAddress: circleId,
		currentUserAddress: selectedAccount?.address // Use Lens account address, not wallet address
	});

	// State management
	const [isStatsOpen, setIsStatsOpen] = useState(false);
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [commentModalState, setCommentModalState] = useState<{
		isOpen: boolean;
		postId: string | null;
		postContent: string;
		postAuthor: { name: string };
		commentCount: number;
	}>({
		isOpen: false,
		postId: null,
		postContent: "",
		postAuthor: { name: "" },
		commentCount: 0,
	});

	// Local state for optimistic updates (so we can update UI immediately)
	const [localPosts, setLocalPosts] = useState(fetchedPosts);

	// Sync local posts with fetched posts when they change
	useEffect(() => {
		setLocalPosts(fetchedPosts);
	}, [fetchedPosts]);

	// Post creation hook
	const { createPost, isCreating } = useCreatePost();

	// Post reactions hook
	const { addLike, removeLike, isLoading: isReactionLoading } = usePostReactions({
		sessionClient,
		onSuccess: () => {
			// Success! The optimistic update already handled the UI.
			// Schedule a background sync after 10 seconds to ensure eventual consistency
			// This is long enough that the user won't notice any disruption
			setTimeout(() => {
				console.log("[CircleDetail] Background sync: silently refetching posts");
				refetchPosts();
			}, 10000); // 10 seconds - enough time for Lens to index and user to move on
		},
		onError: (error) => {
			console.error("[CircleDetail] Reaction error:", error);
			// Error is handled in handleLike by reverting the optimistic update
			// TODO: Show error toast to user
		},
	});

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

	// Read receipt token address from pool contract
	const { data: receiptTokenAddress } = useReadContract({
		address: circle?.poolAddress as Address,
		abi: savingsPoolAbi,
		functionName: "receiptToken",
		query: {
			enabled: !!circle && circle.circleType === "contribution",
		},
		chainId: citreaTestnet.id,
	});

	// Read user's receipt token balance (xshCUSD or xshCBTC)
	const { data: receiptTokenBalance } = useReadContract({
		address: receiptTokenAddress as Address,
		abi: erc20Abi,
		functionName: "balanceOf",
		args: auth.user?.walletAddress ? [auth.user.walletAddress as Address] : undefined,
		query: {
			enabled: !!receiptTokenAddress && !!auth.user?.walletAddress,
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

	// Handle like action with optimistic updates
	const handleLike = useCallback(async (itemId: string) => {
		console.log("[CircleDetail] Like button clicked for post:", itemId);

		// Find the post to check current like status
		const post = localPosts.find((p) => p.id === itemId);
		if (!post) {
			console.error("[CircleDetail] Post not found:", itemId);
			return;
		}

		// Optimistic UI update - toggle like state immediately
		const optimisticPosts = localPosts.map((p) => {
			if (p.id === itemId) {
				return {
					...p,
					isLiked: !p.isLiked,
					likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
				};
			}
			return p;
		});

		// Update UI immediately (optimistic update)
		setLocalPosts(optimisticPosts);
		console.log("[CircleDetail] Optimistic update applied");

		try {
			// Call appropriate reaction function based on current like status
			if (post.isLiked) {
				console.log("[CircleDetail] Removing like from post:", itemId);
				const success = await removeLike(itemId);
				if (!success) {
					// Revert optimistic update on failure
					setLocalPosts(localPosts);
					console.error("[CircleDetail] Failed to remove like, reverted");
				}
			} else {
				console.log("[CircleDetail] Adding like to post:", itemId);
				const success = await addLike(itemId);
				if (!success) {
					// Revert optimistic update on failure
					setLocalPosts(localPosts);
					console.error("[CircleDetail] Failed to add like, reverted");
				}
			}

			// Success case is handled by the refetch in usePostReactions onSuccess callback
		} catch (error) {
			console.error("[CircleDetail] Error toggling like:", error);
			// Revert optimistic update on error
			setLocalPosts(localPosts);
		}
	}, [localPosts, addLike, removeLike]);

	// Handle comment action - open comment modal
	const handleComment = useCallback((itemId: string) => {
		console.log("[CircleDetail] Comment button clicked for post:", itemId);

		// Find the post to get its details
		const post = localPosts.find((p) => p.id === itemId);
		if (!post) {
			console.error("[CircleDetail] Post not found:", itemId);
			return;
		}

		// Open comment modal with post details
		setCommentModalState({
			isOpen: true,
			postId: itemId,
			postContent: post.type === "post" ? post.content : "",
			postAuthor: { name: post.actor.name },
			commentCount: post.commentCount || 0,
		});
	}, [localPosts]);

	// Handle contribute action
	const handleContribute = useCallback(() => {
		navigate(`/circle/${circleId}/contribute`);
	}, [navigate, circleId]);

	// Handle invite action - navigate to invites page
	const handleInvite = useCallback(() => {
		navigate(`/circle/${circleId}/invites`);
	}, [navigate, circleId]);

	// Handle members action - navigate to members page
	const handleMembers = useCallback(() => {
		navigate(`/circle/${circleId}/members`);
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

	// Handle create post action
	const handleCreatePost = useCallback(() => {
		setIsComposerOpen(true);
	}, []);

	// Handle post submission
	const handlePostSubmit = useCallback(
		async (data: PostFormData) => {
			if (!sessionClient || !primaryWallet || !circleId) {
				console.error("[CircleDetail] Missing required clients for post creation");
				return;
			}

			try {
				// @ts-expect-error - getWalletClient exists at runtime but not in type definition
				const walletClient = await primaryWallet.getWalletClient();

				const result = await createPost({
					content: data.content,
					image: data.image || undefined,
					groupAddress: circleId,
					sessionClient,
					walletClient,
				});

				if (result.success) {
					console.log("[CircleDetail] Post created successfully:", result);

					// Close composer
					setIsComposerOpen(false);

					// Refetch feed after a short delay to allow Lens Protocol to index the new post
					setTimeout(() => {
						console.log("[CircleDetail] Refetching feed to show new post");
						refetchPosts();
					}, 1500); // 1.5 second delay for indexing
				} else {
					console.error("[CircleDetail] Post creation failed:", result.error);
					// TODO: Show error toast
				}
			} catch (error) {
				console.error("[CircleDetail] Error submitting post:", error);
				// TODO: Show error toast
			}
		},
		[createPost, sessionClient, primaryWallet, circleId, auth.user, circleWithBalance, refetchPosts]
	);

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
			icon: <Wallet className="size-6" />,
			label: "Wallet",
			to: "/wallet",
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

	// Check if user is owner
	const isOwner = auth.user?.walletAddress && group?.owner
		? auth.user.walletAddress.toLowerCase() === group.owner.toLowerCase()
		: false;

	return (
		<AuthenticatedLayout
			notificationCount={3}
			onNotificationClick={() => console.log("Notifications clicked")}
			onProfileClick={() => navigate("/profile")}
			onNewContribution={handleContribute}
			navItems={navItems}
		>
			{/* Compact Header - Sticky */}
			<CircleHeaderCompact
				circle={circleWithBalance}
				onExpand={() => setIsStatsOpen(true)}
			/>

			{/* Stats Drawer - Expandable */}
			<CircleStatsDrawer
				circle={circleWithBalance}
				memberAddress={auth.user?.walletAddress as `0x${string}` | undefined}
				isOpen={isStatsOpen}
				onClose={() => setIsStatsOpen(false)}
			/>

			{/* Members Bar - Avatar Stack */}
			<CircleMembersBar
				circle={circleWithBalance}
				members={members}
				loading={isLoadingMembers}
				onMembersClick={handleMembers}
			/>

			{/* Quick Actions Bar */}
			<CircleActionsBar
				circle={circleWithBalance}
				onInvite={handleInvite}
				onShare={handleShare}
				isOwner={isOwner}
			/>

			{/* Activity Feed - Starts Immediately */}
			<CircleActivityFeed
				items={localPosts}
				isLoading={isLoadingPosts}
				onLike={handleLike}
				onComment={handleComment}
			/>

			{/* Multi-Action Floating Action Button */}
			<CircleFAB
				circle={circleWithBalance}
				onContribute={handleContribute}
				onCreatePost={handleCreatePost}
			/>

			{/* Post Composer Modal */}
			<PostComposerSheet
				isOpen={isComposerOpen}
				onClose={() => setIsComposerOpen(false)}
				onSubmit={handlePostSubmit}
				isSubmitting={isCreating}
				circleName={circleWithBalance.name}
			/>

			{/* Comment Modal */}
			<CommentModal
				isOpen={commentModalState.isOpen}
				onClose={() => setCommentModalState((prev) => ({ ...prev, isOpen: false }))}
				postId={commentModalState.postId || ""}
				postContent={commentModalState.postContent}
				postAuthor={commentModalState.postAuthor}
				initialCommentCount={commentModalState.commentCount}
			/>
		</AuthenticatedLayout>
	);
}
