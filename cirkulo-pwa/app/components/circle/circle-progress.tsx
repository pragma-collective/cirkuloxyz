import { useMemo } from "react";
import type { Circle } from "app/types/feed";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { cn } from "app/lib/utils";

export interface CircleProgressProps {
  circle: Circle;
  className?: string;
}

export function CircleProgress({ circle, className }: CircleProgressProps) {
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate next milestone
  const nextMilestone = useMemo(() => {
    const milestones = [25, 50, 75, 100];
    const current = circle.progress;
    const next = milestones.find((m) => m > current);
    return next || 100;
  }, [circle.progress]);

  const milestones = [
    { percentage: 0, label: "Start", amount: 0 },
    { percentage: 25, label: "25%", amount: circle.goalAmount * 0.25 },
    { percentage: 50, label: "50%", amount: circle.goalAmount * 0.5 },
    { percentage: 75, label: "75%", amount: circle.goalAmount * 0.75 },
    { percentage: 100, label: "Goal", amount: circle.goalAmount },
  ];

  return (
    <Card className={cn("bg-white/90 backdrop-blur-sm border-0 shadow-lg", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl">Progress Tracker</CardTitle>
          {circle.progress === 100 && (
            <div className="flex items-center gap-2 text-success-600">
              <Trophy className="size-5" />
              <span className="text-sm font-semibold">Goal Reached!</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress Display */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            {/* Circular Progress */}
            <svg className="size-40 sm:size-48 -rotate-90" viewBox="0 0 200 200">
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-neutral-200"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(circle.progress / 100) * 534.07} 534.07`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.72 0.14 45)" />
                  <stop offset="100%" stopColor="oklch(0.70 0.14 290)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl font-bold text-neutral-900">
                {circle.progress}%
              </div>
              <div className="text-sm text-neutral-600 mt-1">Complete</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {formatCurrency(circle.currentAmount)}
            </div>
            <div className="text-sm text-neutral-600">
              of {formatCurrency(circle.goalAmount)} goal
            </div>
          </div>
        </div>

        {/* Horizontal Progress Bar with Milestones */}
        <div className="space-y-4">
          <div className="relative pt-6">
            {/* Milestone Markers */}
            <div className="absolute top-0 left-0 right-0">
              {milestones.map((milestone) => {
                const reached = circle.progress >= milestone.percentage;
                const isStart = milestone.percentage === 0;
                const isGoal = milestone.percentage === 100;
                const isNearby = Math.abs(circle.progress - milestone.percentage) < 5 && !reached;

                return (
                  <div
                    key={milestone.percentage}
                    className={cn(
                      "absolute flex flex-col items-center",
                      isStart ? "left-0 translate-x-0 items-start" : isGoal ? "right-0 translate-x-0 items-end" : "-translate-x-1/2"
                    )}
                    style={!isStart && !isGoal ? { left: `${milestone.percentage}%` } : undefined}
                  >
                    <div
                      className={cn(
                        "rounded-full border-4 flex items-center justify-center transition-all duration-300",
                        // Size variations
                        isStart && "size-5 border-3",
                        isGoal && reached && "size-7 scale-110",
                        isGoal && !reached && "size-6",
                        !isStart && !isGoal && "size-6",
                        // Styling
                        reached && !isStart && "bg-gradient-to-br from-primary-500 to-secondary-500 border-white shadow-md",
                        reached && isStart && "bg-gradient-to-br from-neutral-400 to-neutral-500 border-white shadow-sm",
                        !reached && "bg-white border-neutral-300",
                        // Animation for nearby
                        isNearby && "animate-pulse"
                      )}
                    >
                      {/* Inner white dot for reached milestones (except Goal) */}
                      {reached && !isGoal && (
                        <div className="size-2 rounded-full bg-white" />
                      )}

                      {/* Trophy icon for completed goal */}
                      {isGoal && reached && (
                        <Trophy className="size-3.5 text-white" strokeWidth={2.5} />
                      )}
                    </div>
                    <div className={cn(
                      "mt-2 text-[10px] leading-tight font-medium text-center sm:text-xs whitespace-nowrap",
                      isStart && "text-neutral-500",
                      !isStart && !reached && "text-neutral-600",
                      !isStart && reached && "text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 font-semibold"
                    )}>
                      {milestone.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden mt-8">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000 shimmer-effect overflow-hidden"
                style={{ width: `${Math.min(circle.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Next Milestone Info */}
          {circle.progress < 100 && (
            <div className="bg-neutral-50 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg">
                <Target className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">
                  Next Milestone: {nextMilestone}%
                </p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {formatCurrency(circle.goalAmount * (nextMilestone / 100) - circle.currentAmount)} to go
                </p>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {circle.progress === 100 && (
            <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-4 border-2 border-success-500">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎉</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-success-900">
                    Congratulations! Goal achieved!
                  </p>
                  <p className="text-xs text-success-700 mt-0.5">
                    You saved {formatCurrency(circle.goalAmount)} together
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
