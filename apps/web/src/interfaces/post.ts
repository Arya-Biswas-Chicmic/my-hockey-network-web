export type PostAudience = 'PUBLIC' | 'CONNECTIONS' | 'GROUP' | 'CUSTOM';
export type ReactionType = 'LIKE' | 'CELEBRATE' | 'SUPPORT' | 'LOVE' | 'INSIGHTFUL';

export interface AuthorProfile {
  id: string;
  userId?: string;
  displayName: string;
  avatarUrl?: string | null;
  type?: string;
  primaryRole?: string;
  roleTag?: string;
  teamName?: string;
  position?: string;
  jerseyNumber?: string;
  isFollowing?: boolean;
}

export interface PostMediaItem {
  id: string;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO';
  thumbnailUrl?: string;
}

export interface PostItem {
  id: string;
  authorProfileId: string;
  authorProfile?: AuthorProfile;
  body: string;
  audience: PostAudience;
  placeName?: string;
  publishedAt?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  isFollowing?: boolean;
  isSelf?: boolean;
  userReaction?: ReactionType | null;
  media?: PostMediaItem[];
  pendingGuardianApproval?: boolean;
}

export interface FeedItemWrapper {
  reason?: string;
  postReason?: string;
  post: PostItem;
}

export interface FeedResponse {
  items: FeedItemWrapper[];
  nextCursor?: string;
  hasMore?: boolean;
}

export interface CreatePostDTO {
  body: string;
  audience?: PostAudience;
  placeName?: string;
  shareWithEmails?: string[];
  hideFromEmails?: string[];
  mediaIds?: string[];
}

export interface CommentItem {
  id: string;
  postId: string;
  authorProfileId: string;
  authorProfile?: AuthorProfile;
  content: string;
  createdAt: string;
}

export interface AddCommentDTO {
  postId: string;
  content: string;
}
