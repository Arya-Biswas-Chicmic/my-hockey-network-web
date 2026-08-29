import React from 'react';
import { FeedPostCard, FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FeedPostSkeleton } from '@/components/features/home/HomeSkeletonLoader';
import { NoDataFound, ServerDown } from '@/components/common';
import { Spinner } from '@/components/common/Spinner';
import { useInfiniteScrollSentinel } from '@/hooks/use-infinite-scroll-sentinel';
import { HomeFeedTab } from '@/types/home.types';
import { FeedErrorState } from '@/hooks/useHomeFeed';

export interface FeedProps {
  activeTab: HomeFeedTab;
  posts: FeedPostProps[];
  isLoading: boolean;
  error: FeedErrorState | null;
  searchQuery?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onOpenCreatePost?: () => void;
  onNavigate?: (screen: string) => void;
  onFollowChange?: (authorKey: string, isFollowing: boolean) => void;
  onDeleteSuccess?: (id: string) => void;
  onUpdateSuccess?: (id: string, newContent: string) => void;
  onRepostComplete?: () => void;
}

export const Feed: React.FC<FeedProps> = ({
  activeTab,
  posts,
  isLoading,
  error,
  searchQuery = '',
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onRetry,
  onOpenCreatePost,
  onNavigate,
  onFollowChange,
  onDeleteSuccess,
  onUpdateSuccess,
  onRepostComplete,
}) => {
  const sentinelRef = useInfiniteScrollSentinel({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: onLoadMore ?? (() => {}),
  });

  if (isLoading) {
    return (
      <div className="mhn-col-flex-gap-16">
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </div>
    );
  }

  if (error?.isServerError && posts.length === 0) {
    return (
      <ServerDown
        title="We’re having trouble loading your feed"
        description={error.message || 'Something went wrong while connecting to the server. Please try again.'}
        statusCode={error.statusCode || 502}
        onRetry={onRetry}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <NoDataFound
        title="No Posts Found"
        description={
          searchQuery
            ? `No posts match your search "${searchQuery}".`
            : 'There are no posts in your feed right now. Be the first to share an update with your network!'
        }
        actionLabel="Create Post"
        onAction={onOpenCreatePost}
      />
    );
  }

  return (
    <div className="mhn-feed-posts-stack">
      {error?.isServerError ? (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground" role="status">
          Live posts could not be loaded. Showing preview posts.
        </div>
      ) : null}
      {posts.map((post) => (
        <FeedPostCard
          key={post.id}
          {...post}
          onNavigate={onNavigate}
          onFollowChange={onFollowChange}
          onDeleteSuccess={onDeleteSuccess}
          onUpdateSuccess={onUpdateSuccess}
          onRepostComplete={onRepostComplete}
        />
      ))}

      {hasNextPage ? (
        <div ref={sentinelRef} className="flex min-h-12 items-center justify-center" aria-label="Loading more posts">
          {isFetchingNextPage && <Spinner size="sm" />}
        </div>
      ) : null}
    </div>
  );
};
