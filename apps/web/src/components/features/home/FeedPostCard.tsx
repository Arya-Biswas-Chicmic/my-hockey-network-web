import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { useFeedPostCard } from '@/hooks/use-feed-post-card';
import { PostCardHeader } from '@/components/features/home/PostCardHeader';
import { PostCardContent } from '@/components/features/home/PostCardContent';
import { PostCardActions } from '@/components/features/home/PostCardActions';
import { PostEditModal } from '@/components/features/home/PostEditModal';
import { PostDeleteModal } from '@/components/features/home/PostDeleteModal';

export interface FeedPostProps {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole?: string;
  authorTime?: string;
  authorAvatar?: string;
  content: string;
  postImage?: string;
  likesCount: number;
  commentsCount: number;
  repostCount?: number;
  isFollowing?: boolean;
  isSelf?: boolean;
  userReaction?: string | null;

  // Repost specific properties
  isRepost?: boolean;
  repostedByName?: string;
  isSelfRepost?: boolean;
  hasThirdPartyReposts?: boolean;
  repostCommentary?: string;
  originalPost?: {
    id: string;
    authorName: string;
    authorRole?: string;
    authorAvatar?: string;
    authorTime?: string;
    content: string;
    postImage?: string;
  };

  onFollowChange?: (authorKey: string, isFollowing: boolean) => void;
  onShareSuccess?: (message: string) => void;
  onRepostComplete?: () => void;
  onDeleteSuccess?: (id: string, message?: string) => void;
  onUpdateSuccess?: (id: string, newContent: string) => void;
  onNavigate?: (screen: string) => void;
}

/**
 * A single feed post card: header (author/follow/menu), content (text +
 * image), and actions (like/comment/share) plus its edit/delete modals.
 * This component owns permission gating (`useAuth`) and layout only — all
 * mutation state and handlers live in `useFeedPostCard`, and each visual
 * section is its own component (`PostCardHeader`/`PostCardContent`/
 * `PostCardActions`/`PostEditModal`/`PostDeleteModal`).
 */
export const FeedPostCard: React.FC<FeedPostProps> = ({
  id,
  authorId,
  authorName,
  authorRole = 'Official Team',
  authorTime = '1d',
  authorAvatar = '/CoachTeam.png',
  content: initialContent,
  postImage,
  likesCount: initialLikes,
  commentsCount,
  repostCount: initialReposts = 0,
  isFollowing: initialFollowing = false,
  isSelf = false,
  isSelfRepost = false,
  userReaction = null,
  onFollowChange,
  onShareSuccess,
  onRepostComplete,
  onDeleteSuccess,
  onUpdateSuccess,
  onNavigate,
}) => {
  const { checkSupervisionPermission, assertSupervisionPermission } = useAuth();
  const canReact = checkSupervisionPermission('react_to_posts');
  const canComment = checkSupervisionPermission('comment_on_posts');
  const canShare = checkSupervisionPermission('share_posts');
  const canFollow = checkSupervisionPermission('follow_others');

  const { requirePermission } = useFeedPermissions(onNavigate);

  const card = useFeedPostCard({
    id,
    authorId,
    authorName,
    initialContent,
    initialLikes,
    initialReposts,
    initialFollowing,
    commentsCount,
    isSelfRepost,
    userReaction,
    requirePermission,
    onFollowChange,
    onShareSuccess,
    onRepostComplete,
    onDeleteSuccess,
    onUpdateSuccess,
  });

  if (card.isDeleted) {
    return null;
  }

  return (
    <article className="mhn-feed-post-card">
      <PostCardHeader
        authorName={authorName}
        authorRole={authorRole}
        authorTime={authorTime}
        authorAvatar={authorAvatar}
        isSelf={isSelf}
        canFollow={canFollow}
        isFollowing={card.isFollowing}
        isFollowingLoading={card.isFollowingLoading}
        onToggleFollow={() => assertSupervisionPermission('follow_others', card.toggleFollow)}
        isMenuOpen={card.isMenuOpen}
        onToggleMenu={() => card.setIsMenuOpen((prev) => !prev)}
        onEditClick={card.openEditModal}
        onDeleteClick={card.openDeleteModal}
      />

      <PostCardContent
        content={card.postContent}
        isExpanded={card.isExpanded}
        onToggleExpand={() => card.setIsExpanded(!card.isExpanded)}
        postImage={postImage}
      />

      <PostCardActions
        postId={id}
        isSelf={isSelf}
        canReact={canReact}
        canComment={canComment}
        canShare={canShare}
        isLiked={card.isLiked}
        likes={card.likes}
        isLiking={card.isLiking}
        onLike={() => assertSupervisionPermission('react_to_posts', card.handleLike)}
        showComments={card.showComments}
        onToggleComments={() =>
          assertSupervisionPermission('comment_on_posts', () => {
            if (requirePermission()) {
              card.setShowComments((prev) => !prev);
            }
          })
        }
        currentCommentsCount={card.currentCommentsCount}
        onCommentAdded={(newCount) => card.setCurrentCommentsCount(newCount)}
        hasReposted={card.hasReposted}
        reposts={card.reposts}
        isSharing={card.isSharing}
        onShare={() => assertSupervisionPermission('share_posts', card.handleShare)}
      />

      {card.isEditModalOpen && (
        <PostEditModal
          value={card.editContentInput}
          onChange={card.setEditContentInput}
          onClose={card.closeEditModal}
          onSave={card.handleSaveEdit}
          isSaving={card.isUpdating}
        />
      )}

      {card.isDeleteModalOpen && (
        <PostDeleteModal
          onClose={card.closeDeleteModal}
          onConfirm={card.handleConfirmDelete}
          isDeleting={card.isDeleting}
        />
      )}
    </article>
  );
};
