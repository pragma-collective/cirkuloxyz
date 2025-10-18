import * as React from "react";
import type { Route } from "./+types/circle-members";
import { useNavigate, useParams } from "react-router";
import { AuthenticatedLayout } from "app/components/layouts/authenticated-layout";
import { CircleMembers } from "app/components/circle/circle-members";
import { mockCircles, mockPublicCircles } from "app/lib/mock-data";
import { Home, Compass, PlusCircle, Bell, User, ArrowLeft } from "lucide-react";
import { Button } from "app/components/ui/button";

export function meta({ params }: Route.MetaArgs) {
	// Find circle for meta tags
	const allCircles = [...mockCircles, ...mockPublicCircles];
	const circle = allCircles.find((c) => c.id === params.id);

	return [
		{
			title: circle
				? `${circle.name} Members - Xersha`
				: "Circle Members - Xersha",
		},
		{
			name: "description",
			content: circle?.description || "View circle members",
		},
	];
}

export default function CircleMembersPage() {
	const navigate = useNavigate();
	const params = useParams();
	const circleId = params.id;

	// Find the circle from mock data
	const circle = React.useMemo(() => {
		const allCircles = [...mockCircles, ...mockPublicCircles];
		return allCircles.find((c) => c.id === circleId);
	}, [circleId]);

	// Handle invite action
	const handleInvite = React.useCallback(() => {
		console.log("Invite friends to circle:", circleId);
		// TODO: Implement invite modal/flow
	}, [circleId]);

	// Handle member click
	const handleMemberClick = React.useCallback((userId: string) => {
		console.log("View member profile:", userId);
		// TODO: Navigate to member profile
	}, []);

	// If circle not found, show 404
	if (!circle) {
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
						onInvite={handleInvite}
						onMemberClick={handleMemberClick}
					/>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
