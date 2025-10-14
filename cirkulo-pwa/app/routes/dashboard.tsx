import type { Route } from "./+types/dashboard";
import { useAuth } from "app/context/auth-context";
import { XershaLogo } from "app/components/xersha-logo";
import { Button } from "app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import { CheckCircle2, User } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Xersha" },
    {
      name: "description",
      content: "Your Xersha dashboard",
    },
  ];
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <XershaLogo size="sm" />
            <Button variant="outline" size="sm">
              <User className="size-4" />
              Profile
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome message */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="size-20 rounded-full bg-success-100 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-success-600" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Welcome to Xersha, {user?.name || "Friend"}!
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Your profile has been created successfully. You're ready to start saving
              with your circles.
            </p>
          </div>

          {/* Profile card */}
          {user?.hasProfile && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Name</p>
                  <p className="text-base text-neutral-900">{user.name}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">
                    Lens Username
                  </p>
                  <p className="text-base text-neutral-900">@{user.lensUsername}</p>
                </div>

                {user.bio && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-700">Bio</p>
                    <p className="text-base text-neutral-900">{user.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Coming soon section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-neutral-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Create and join savings circles</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Set and track savings goals</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Earn yields on your contributions</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Celebrate milestones with your circle</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
