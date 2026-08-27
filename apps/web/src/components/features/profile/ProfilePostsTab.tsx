'use client';

import { Button } from '@/components/common/Button';
import { NoDataFound } from '@/components/common/no-data-found';
import { FeedPostCard } from '@/components/features/home/FeedPostCard';
import type { PostItem } from '@my-hockey-network/core';

export interface ProfilePostsTabProps {
  posts: PostItem[];
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  jerseyText: string;
  onNavigate?: (screen: string, extraData?: Record<string, unknown>) => void;
  onOpenCreatePost: () => void;
  onPostDeleted: (deletedId: string) => void;
  onPostUpdated: (updatedId: string, newContent: string) => void;
}

/** Profile > Posts tab. Extracted from `screens/profile-page.tsx`. */
export function ProfilePostsTab({
  posts,
  authorName,
  authorAvatar,
  authorRole,
  jerseyText,
  onNavigate,
  onOpenCreatePost,
  onPostDeleted,
  onPostUpdated,
}: Readonly<ProfilePostsTabProps>) {
  return (
    <div className="mhn-posts-container-card">
      <div className="mhn-posts-header-bar">
        <h3 className="mhn-posts-title">Posts</h3>
        <Button className="mhn-btn-create-post" onClick={onOpenCreatePost}>Create Post</Button>
      </div>

      {posts.length === 0 ? (
        <NoDataFound
          title="No Posts Found"
          description="There are no posts in your feed right now. Be the first to share an update with your network!"
          actionLabel="Create Post"
          onAction={onOpenCreatePost}
        />
      ) : (
        <>
          <div className="mhn-posts-grid-wrapper">
            {posts.map((post) => {
              const author: NonNullable<PostItem['author']> = post.authorProfile || post.author || { id: '', displayName: '' };
              const postName = author.displayName || authorName;
              const postAvatar = author.avatarUrl || authorAvatar;
              const postRole = author.position && author.jerseyNumber ? `${author.position} • #${author.jerseyNumber}` : `${authorRole} • #${jerseyText}`;
              const mediaUrl = post.media && post.media.length > 0 ? post.media[0].url : null;
              const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

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
                  isSelf={true}
                  onNavigate={onNavigate}
                  onDeleteSuccess={onPostDeleted}
                  onUpdateSuccess={onPostUpdated}
                />
              );
            })}
          </div>

          <div className="mhn-posts-show-all-divider">
            <Button className="mhn-btn-show-all">Show All</Button>
          </div>
        </>
      )}
    </div>
  );
}
