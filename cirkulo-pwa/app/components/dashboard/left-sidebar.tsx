import { Card, CardContent, CardTitle } from "app/components/ui/card";
import { Button } from "app/components/ui/button";
import {
  PiggyBank,
  Users,
  Target,
  PlusCircle,
  Settings,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "app/lib/utils";
import type { UserStats } from "app/types/feed";

export interface LeftSidebarProps {
  stats: UserStats;
  onNewContribution?: () => void;
  onCreateCircle?: () => void;
  onSettings?: () => void;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  progress?: number;
}

function StatItem({
  icon,
  label,
  value,
  trend,
  trendPositive,
  progress,
}: StatItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-white shadow-sm flex-shrink-0">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-600 mb-0.5">{label}</p>
        <p className="text-lg font-bold text-neutral-900">{value}</p>

        {trend && (
          <p
            className={cn(
              "text-xs font-medium flex items-center gap-1 mt-1",
              trendPositive ? "text-success-600" : "text-error-600"
            )}
          >
            {trendPositive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trend}
          </p>
        )}

        {progress !== undefined && (
          <div className="mt-2 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function LeftSidebar({
  stats,
  onNewContribution,
  onCreateCircle,
  onSettings,
}: LeftSidebarProps) {
  const goalsProgress = (stats.goalsCompleted / stats.totalGoals) * 100;

  return (
    <aside className="hidden lg:block lg:w-64 xl:w-72 space-y-4">
      {/* Quick Stats Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-primary-50/30">
        <CardContent className="!p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-4">Your Stats</h2>

          <div className="space-y-4">
            {/* Total Saved */}
            <StatItem
              icon={<PiggyBank className="size-5 text-warning-600" />}
              label="Total Saved"
              value={`$${stats.totalSaved.toLocaleString()}`}
              trend={`${stats.monthlyTrend > 0 ? "+" : ""}${stats.monthlyTrend}% this month`}
              trendPositive={stats.monthlyTrend > 0}
            />

            {/* Active Circles */}
            <StatItem
              icon={<Users className="size-5 text-secondary-600" />}
              label="Active Circles"
              value={stats.activeCircles.toString()}
            />

            {/* Goals Progress */}
            <StatItem
              icon={<Target className="size-5 text-success-600" />}
              label="Goals Completed"
              value={`${stats.goalsCompleted}/${stats.totalGoals}`}
              progress={goalsProgress}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="!p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">
            Quick Actions
          </h2>

          <div className="space-y-2">
            <Button
              variant="default"
              size="sm"
              className="w-full justify-start"
              onClick={onNewContribution}
            >
              <PlusCircle className="size-4" />
              New Contribution
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={onCreateCircle}
            >
              <Users className="size-4" />
              Create Circle
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onSettings}
            >
              <Settings className="size-4" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
