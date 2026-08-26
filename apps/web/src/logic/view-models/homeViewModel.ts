import { formatDisplayName, formatUserAvatar, formatRoleTag } from '../formatters/userFormatters';
import { formatTimeAgo } from '../formatters/dateFormatters';
import { selectVisiblePosts, FeedPostItem } from '../selectors/feedSelectors';

export interface FormattedFeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  timeAgo: string;
  content: string;
  mediaUrl?: string;
  likeCount: number;
  commentCount: number;
}

export interface HomeViewModel {
  userDisplayName: string;
  userAvatarUrl: string;
  userCoverUrl: string;
  userRoleTag: string;
  visiblePosts: FormattedFeedPost[];
  hasPosts: boolean;
}

export function createHomeViewModel(user: any, posts: FeedPostItem[], searchQuery?: string): HomeViewModel {
  const prof = user?.profile || user;
  const userDisplayName = formatDisplayName(prof?.displayName, prof?.firstName, prof?.lastName);
  const userAvatarUrl = formatUserAvatar(prof?.avatarUrl);
  const userCoverUrl = formatUserAvatar(prof?.coverUrl, '/cover.png');
  const userRoleTag = formatRoleTag(user?.primaryRole || prof?.type, prof?.position, prof?.jerseyNumber);

  const rawVisiblePosts = selectVisiblePosts(posts, searchQuery);
  const visiblePosts: FormattedFeedPost[] = rawVisiblePosts.map((post) => {
    const authorName = formatDisplayName(post.author?.displayName);
    const authorAvatar = formatUserAvatar(post.author?.avatarUrl);
    const authorRole = formatRoleTag(post.author?.roleTag);
    const timeAgo = formatTimeAgo(post.createdAt);

    return {
      id: post.id,
      authorName,
      authorAvatar,
      authorRole,
      timeAgo,
      content: post.content || post.body || '',
      mediaUrl: post.mediaUrl ? formatUserAvatar(post.mediaUrl, '') : undefined,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
    };
  });

  return {
    userDisplayName,
    userAvatarUrl,
    userCoverUrl,
    userRoleTag,
    visiblePosts,
    hasPosts: visiblePosts.length > 0,
  };
}
