export interface PostMediaItem {
  id: string;
  url: string;
  type?: 'image' | 'video';
  alt?: string;
}

export interface FeedPostAuthor {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  time?: string;
}

export interface FeedPost {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole?: string;
  authorTime?: string;
  authorAvatar?: string;
  content: string;
  postImage?: string;
  mediaItems?: PostMediaItem[];
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
}

export interface FetchFeedParams {
  profileId?: string;
  query?: string;
  sortBy?: 'RECENT' | 'POPULAR' | 'TRENDING';
  limit?: number;
}

export interface FetchFeedPageParams extends FetchFeedParams {
  cursor?: string;
}
