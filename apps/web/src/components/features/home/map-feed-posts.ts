import type { PostItem } from '@my-hockey-network/core';

import type { FeedPostProps } from '@/components/features/home/FeedPostCard';

interface FeedIdentity {
  profileId?: string;
  userId?: string;
}

function getAuthorSubtitle(author: NonNullable<PostItem['author']>): string {
  if (author.roleTag) return author.roleTag;
  if (author.teamName && author.position) return `${author.teamName} • ${author.position}`;
  if (author.teamName) return author.teamName;
  if (author.position) {
    const jersey = author.jerseyNumber ? ` • #${author.jerseyNumber}` : '';
    return `${author.position}${jersey}`;
  }
  return author.type || author.primaryRole || 'Member';
}

function getPostId(post: PostItem): string | undefined {
  const legacyPost = post as PostItem & { _id?: string; postId?: string };
  return post.id || legacyPost._id || legacyPost.postId;
}

export function mapFeedPosts(items: unknown[], identity: FeedIdentity): FeedPostProps[] {
  return items.flatMap((rawItem) => {
    const wrapper = rawItem as { post?: PostItem } & PostItem;
    const post = wrapper.post || wrapper;
    const author = post.authorProfile || post.author || { id: '', displayName: '' };
    const postId = getPostId(post);

    if (!postId) return [];

    const authorProfileId = author.id || author.profileId || post.authorProfileId;
    const authorUserId = author.userId || author.id;
    const isSelf = post.feedReason === 'SELF'
      || Boolean(identity.profileId && (
        authorProfileId === identity.profileId
        || author.profileId === identity.profileId
        || post.authorProfileId === identity.profileId
      ))
      || Boolean(identity.userId && (
        authorUserId === identity.userId
        || authorProfileId === identity.userId
      ));

    return [{
      id: postId,
      authorId: post.authorProfileId || author.id || author.displayName,
      authorName: author.displayName || 'Member',
      authorRole: getAuthorSubtitle(author),
      authorTime: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recently',
      authorAvatar: author.avatarUrl || '/userPlaceholder.webp',
      content: post.body || '',
      postImage: post.media?.[0]?.url,
      likesCount: post.likeCount ?? post.reactionsCount ?? 0,
      commentsCount: post.commentCount ?? post.commentsCount ?? 0,
      repostCount: post.repostCount ?? post.repostsCount ?? post.sharesCount ?? 0,
      isFollowing: post.isFollowing ?? author.isFollowing ?? false,
      isSelf,
      userReaction: post.userReaction || post.post?.userReaction || null,
    }];
  });
}
