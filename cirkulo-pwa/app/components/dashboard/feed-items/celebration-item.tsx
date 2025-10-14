import { FeedCard } from "../feed-card";
import type { CelebrationFeedItem } from "app/types/feed";

export interface CelebrationItemProps {
  item: CelebrationFeedItem;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onTagClick?: (tag: string) => void;
}

export function CelebrationItem({
  item,
  onLike,
  onComment,
  onShare,
  onTagClick,
}: CelebrationItemProps) {
  return (
    <FeedCard
      item={item}
      accentColor="primary"
      onLike={onLike}
      onComment={onComment}
      onShare={onShare}
    >
      {/* Circle Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-700">
          {item.circle.emoji && (
            <span className="text-sm" role="img" aria-label={item.circle.name}>
              {item.circle.emoji}
            </span>
          )}
          <span className="text-xs font-semibold">{item.circle.name}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <p className="text-sm text-neutral-900 leading-relaxed whitespace-pre-wrap">
          {item.content}
        </p>

        {/* Optional: Image */}
        {item.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-neutral-200">
            <img
              src={item.imageUrl}
              alt={item.imageAlt || "Post image"}
              className="w-full h-auto object-cover max-h-80"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {item.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="px-2.5 py-1 rounded-full bg-primary-100 text-xs text-primary-700 font-medium hover:bg-primary-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
                aria-label={`View posts tagged with ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </FeedCard>
  );
}
