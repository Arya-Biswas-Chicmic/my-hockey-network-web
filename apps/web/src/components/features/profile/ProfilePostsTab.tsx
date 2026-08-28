'use client';

import { FeedPostCard } from '@/components/features/home/FeedPostCard';
import { Spinner } from '@/components/common/Spinner';
import { useInfiniteScrollSentinel } from '@/hooks/use-infinite-scroll-sentinel';
import type { PostItem } from '@my-hockey-network/core';

export interface ProfilePostsTabProps {
  posts: PostItem[];
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  jerseyText: string;
  onNavigate?: (screen: string, extraData?: Record<string, unknown>) => void;
  onPostDeleted: (deletedId: string) => void;
  onPostUpdated: (updatedId: string, newContent: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/** Profile > Posts tab. Extracted from `screens/profile-page.tsx`. Paginated
 * via `useInfiniteListQuery` (owned by the parent, cursor comes from
 * `getUserPosts`) — `sentinelRef` sits after the last card and fires
 * `onLoadMore` once it scrolls into view (feedback 2026-08-28: "make sure
 * where we will have list we have to add pagination and on scroll fetch"). */
export function ProfilePostsTab({
  posts,
  authorName,
  authorAvatar,
  authorRole,
  jerseyText,
  onNavigate,
  onPostDeleted,
  onPostUpdated,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Readonly<ProfilePostsTabProps>) {
  const sentinelRef = useInfiniteScrollSentinel({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });
  return (
    <section aria-label="Profile posts" className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {posts.map((post) => {
              const author: NonNullable<PostItem['author']> = post.authorProfile || post.author || { id: '', displayName: '' };
              const postName = author.displayName || authorName;
              const postAvatar = author.avatarUrl || authorAvatar;
              const postRole = author.position
                ? `${author.position}${author.jerseyNumber ? ` • #${author.jerseyNumber}` : ''}`
                : author.roleTag || author.primaryRole || `${authorRole}${jerseyText ? ` • #${jerseyText}` : ''}`;
              const mediaUrl = post.media && post.media.length > 0 ? post.media[0].url : null;
              const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';
              // API posts on a profile are owned by that profile. Demo records may
              // intentionally represent a team/person post so the Figma follow state
              // remains visible without pretending the signed-in user authored it.
              const isSelfPost = !post.id.startsWith('demo-') || author.id.startsWith('demo-profile-');

              return (
                <FeedPostCard
                  key={post.id}
                  id={post.id}
                  authorName={postName}
                  authorRole={postRole}
                  authorTime={formattedDate}
                  authorAvatar={postAvatar}
                  content={post.body || ''}
                  postImage={mediaUrl || undefined}
                  likesCount={post.likeCount ?? post.reactionsCount ?? 0}
                  commentsCount={post.commentCount ?? post.commentsCount ?? 0}
                  repostCount={post.repostCount ?? post.repostsCount ?? 0}
                  userReaction={post.userReaction}
                  isSelf={isSelfPost}
                  demoMode={post.id.startsWith('demo-')}
                  onNavigate={onNavigate}
                  onDeleteSuccess={onPostDeleted}
                  onUpdateSuccess={onPostUpdated}
                />
              );
        })}
      </div>

      {hasNextPage ? (
        <div ref={sentinelRef} className="flex min-h-12 items-center justify-center" aria-label="Loading more posts">
          {isFetchingNextPage && <Spinner size="sm" />}
        </div>
      ) : null}
    </section>
  );
}
