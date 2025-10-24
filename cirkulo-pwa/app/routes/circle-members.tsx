import { useMemo, useCallback } from "react";
import type { Route } from "./+types/circle-members";
import { useNavigate, useParams } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { CircleMembers } from "app/components/circle/circle-members";
import { Home, Compass, PlusCircle, Bell, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "app/components/ui/button";
import { useAuth } from "app/context/auth-context";
import { useFetchCircle } from "~/hooks/use-fetch-circle";
import { useFetchGroupMembers } from "~/hooks/use-fetch-group-members";
import { mapGroupToCircle } from "app/lib/map-group-to-circle";
import { fetchGroup } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { lensClient } from "app/lib/lens";

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
	const groupDescription = loaderData?.group?.metadata?.description;

	return [
		{
			title: groupName
				? `${groupName} Members - Xersha`
				: "Circle Members - Xersha",
		},
		{
			name: "description",
			content: groupDescription || "View circle members",
		},
	];
}

export default function CircleMembersPage({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const params = useParams();
	const circleId = params.id;
	const { user } = useAuth();

	// Use group data from loader (already fetched during route load)
	const group = loaderData?.group;
	const loaderError = loaderData?.error;

	// Fetch circle data from API (only if group exists)
	const { data: circleData, isLoading: isLoadingCircle, error: circleError } = useFetchCircle(group ? circleId : undefined);

	// Fetch group members from Lens Protocol (only if group exists)
	const { members, memberCount, loading: isLoadingMembers, error: membersError } = useFetchGroupMembers({
		groupAddress: group ? circleId : undefined
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

	// Handle invite action
	const handleInvite = useCallback(() => {
		console.log("Invite friends to circle:", circleId);
		// TODO: Implement invite modal/flow
	}, [circleId]);

	// Handle member click
	const handleMemberClick = useCallback((userId: string) => {
		console.log("View member profile:", userId);
		// TODO: Navigate to member profile
	}, []);

	// Loading state - only show loading if members are still loading
	// Circle API is optional, so don't block on it
	if (isLoadingMembers && !loaderError) {
		return (
			<AuthenticatedLayout
				notificationCount={3}
				onNotificationClick={() => console.log("Notifications clicked")}
				onProfileClick={() => navigate("/profile")}
				onNewContribution={() => console.log("New contribution clicked")}
				navItems={[
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
				]}
			>
				<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[60vh]">
					<Loader2 className="size-12 text-primary-600 animate-spin" />
				</div>
			</AuthenticatedLayout>
		);
	}

	// Error state
	if (loaderError || circleError || membersError || !circle) {
		return (
			<AuthenticatedLayout
				notificationCount={3}
				onNotificationClick={() => console.log("Notifications clicked")}
				onProfileClick={() => navigate("/profile")}
				onNewContribution={() => console.log("New contribution clicked")}
				navItems={[
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
				]}
			>
				<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="max-w-2xl mx-auto text-center space-y-4">
						<div className="text-6xl mb-4">🔍</div>
						<h1 className="text-3xl font-bold text-neutral-900">
							Circle Not Found
						</h1>
						<p className="text-neutral-600">
							{loaderError || membersError?.message || "The circle you're looking for doesn't exist or has been removed."}
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
			navItems={[
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
			]}
		>
			{/* Header */}
			<div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-b border-neutral-200">
				<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="max-w-6xl mx-auto">
						<Button
							variant="ghost"
							onClick={() => navigate(`/circle/${circleId}`)}
							className="mb-4"
						>
							<ArrowLeft className="size-4" />
							Back to Circle
						</Button>
						<div className="flex items-center gap-4">
							<div className="text-4xl">{circle.emoji || "🎯"}</div>
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
									{circle.name} Members
								</h1>
								<p className="text-neutral-600 mt-1">
									{circle.memberCount}{" "}
									{circle.memberCount === 1 ? "member" : "members"}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Members List */}
			<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				<div className="max-w-6xl mx-auto">
					<CircleMembers
						circle={circle}
						members={members}
						onInvite={handleInvite}
						onMemberClick={handleMemberClick}
					/>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
