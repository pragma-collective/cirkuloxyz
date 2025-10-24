import type { User } from "app/context/auth-context";

// Circle categories
export type CircleCategory =
  | "vacation"
  | "home"
  | "technology"
  | "education"
  | "events"
  | "healthcare"
  | "community"
  | "emergency"
  | "other";

// Circle information
export interface Circle {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  circleType: "rotating" | "contribution" | "fundraising";
  currency?: "cusd" | "cbtc";
  poolAddress?: string; // Smart contract address for the pool
  contributionSchedule: "weekly" | "bi-weekly" | "monthly";
  endDate?: string | null; // Optional for open-ended contribution circles
  goalName: string;
  goalAmount: number;
  currentAmount: number;
  memberCount: number;
  progress: number; // 0-100
  members: User[];
  isPublic?: boolean;
  categories?: string[]; // Array of category strings
  createdAt?: string;
  isActive?: boolean;
}

// Feed item types
export type FeedItemType =
  | "contribution"
  | "milestone"
  | "member-joined"
  | "goal-completed"
  | "celebration"
  | "comment";

// Base feed item structure
export interface BaseFeedItem {
  id: string;
  type: FeedItemType;
  timestamp: string;
  actor: User;
  circle: Circle;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

// Contribution feed item
export interface ContributionFeedItem extends BaseFeedItem {
  type: "contribution";
  amount: number;
  currency: string;
  message?: string;
  circleProgress: {
    current: number;
    goal: number;
    percentage: number;
  };
}

// Milestone feed item
export interface MilestoneFeedItem extends BaseFeedItem {
  type: "milestone";
  percentage: number; // 25, 50, 75, 100
  amount: number;
  goalAmount: number;
  reactions: Reaction[];
}

// Member joined feed item
export interface MemberJoinedFeedItem extends BaseFeedItem {
  type: "member-joined";
  welcomeMessage?: string;
}

// Goal completed feed item
export interface GoalCompletedFeedItem extends BaseFeedItem {
  type: "goal-completed";
  totalSaved: number;
  daysToComplete: number;
}

// Celebration post feed item
export interface CelebrationFeedItem extends BaseFeedItem {
  type: "celebration";
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  tags?: string[];
}

// Comment activity feed item
export interface CommentFeedItem extends BaseFeedItem {
  type: "comment";
  originalActivity: BaseFeedItem;
  comments: Comment[];
}

// Union type for all feed items
export type FeedItem =
  | ContributionFeedItem
  | MilestoneFeedItem
  | MemberJoinedFeedItem
  | GoalCompletedFeedItem
  | CelebrationFeedItem
  | CommentFeedItem;

// Reaction type
export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

// Comment type
export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likeCount: number;
  isLiked: boolean;
}

// Feed filter options
export type FeedFilter = "all" | "contributions" | "milestones" | "social" | "my-circles";

// Stats data
export interface UserStats {
  totalSaved: number;
  activeCircles: number;
  goalsCompleted: number;
  totalGoals: number;
  monthlyTrend: number; // percentage
}
