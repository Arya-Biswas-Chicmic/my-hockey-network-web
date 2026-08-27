import React from 'react';
import { FeedPostCard, FeedPostProps } from '@/components/features/home/FeedPostCard';
import { FeedPostSkeleton } from '@/components/features/home/HomeSkeletonLoader';
import { NoDataFound, ServerDown } from '@/components/common';
import { HomeFeedTab } from '@/types/home.types';
import { FeedErrorState } from '@/hooks/useHomeFeed';

export interface FeedProps {
  activeTab: HomeFeedTab;
  posts: FeedPostProps[];
  isLoading: boolean;
  error: FeedErrorState | null;
  searchQuery?: string;
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
  onRetry,
  onOpenCreatePost,
  onNavigate,
  onFollowChange,
  onDeleteSuccess,
  onUpdateSuccess,
  onRepostComplete,
}) => {
  if (activeTab !== HomeFeedTab.FOR_YOU) {
    return (
      <NoDataFound
        title={activeTab === HomeFeedTab.NETWORK ? 'Network Feed Coming Soon' : 'Groups Feed Coming Soon'}
        description={
          activeTab === HomeFeedTab.NETWORK
            ? "A feed of just your connections' posts isn't available yet."
            : "A feed of your groups' posts isn't available yet."
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="mhn-col-flex-gap-16">
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </div>
    );
  }

  if (error?.isServerError) {
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
    <div className="mhn-feed-posts-stack flex flex-col gap-5">
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
    </div>
  );
};
