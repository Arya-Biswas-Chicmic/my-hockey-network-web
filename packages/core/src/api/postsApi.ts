import { apiFetch, ApiError } from './client';
import { API_ENDPOINTS } from './urls';
import { PostAudienceEnum, type PostAudience } from '@my-hockey-network/contracts';

export interface CreatePostDTO {
  body?: string;
  audience?: PostAudienceEnum | PostAudience;
  groupId?: string | null;
  mediaIds?: string[];
  placeName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mentionedProfileIds?: string[];
  shareWithEmails?: string[];
  hideFromEmails?: string[];
}

export interface PostItem {
  id: string;
  body: string;
  audience: string;
  createdAt: string;
  placeName?: string | null;
  media?: Array<{ id: string; url: string }>;
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    primaryRole?: string;
    profileId?: string;
    userId?: string;
    roleTag?: string;
    teamName?: string;
    position?: string;
    jerseyNumber?: number | string;
    type?: string;
    isFollowing?: boolean;
  };
  authorProfile?: PostItem['author'];
  authorProfileId?: string;
  publishedAt?: string;
  likeCount?: number;
  commentCount?: number;
  repostCount?: number;
  repostsCount?: number;
  sharesCount?: number;
  isFollowing?: boolean;
  post?: { userReaction?: string | null };
  reactionsCount?: number;
  commentsCount?: number;
  userReaction?: string | null;
  isDraft?: boolean;
  pendingGuardianApproval?: boolean;
  feedReason?: string;
}

export interface FeedResponse {
  items: PostItem[];
  nextCursor?: string | null;
}

export interface FeedItemWrapper {
  reason?: string;
  postReason?: string;
  post: PostItem;
}

interface RawFeedPage {
  items?: Array<PostItem | FeedItemWrapper>;
  nextCursor?: string | null;
}

type FeedPayload = RawFeedPage | Array<PostItem | FeedItemWrapper>;
type FeedApiResponse = FeedPayload | { data?: FeedPayload };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPostItem(value: unknown): value is PostItem {
  return isRecord(value) && typeof value.id === 'string' && value.id.trim().length > 0;
}

function normalizePostId(postId: string): string {
  if (typeof postId !== 'string') {
    throw new ApiError(400, 'Post identifier is missing. Refresh the feed and try again.');
  }
  const normalizedId = postId.trim();
  if (!normalizedId || normalizedId === 'undefined' || normalizedId === 'null') {
    throw new ApiError(400, 'Post identifier is missing. Refresh the feed and try again.');
  }
  return normalizedId;
}

export function normalizeFeedResponse(response: FeedApiResponse): FeedResponse {
  const payload = (!Array.isArray(response) && isRecord(response) && 'data' in response && response.data
    ? response.data
    : response) as unknown as Record<string, unknown>;

  const rawItems = Array.isArray(payload) ? payload : (Array.isArray(payload.items) ? payload.items : []);
  const items = rawItems.flatMap((item: unknown): PostItem[] => {
    if (isRecord(item) && isPostItem(item.post)) {
      const reason = typeof item.reason === 'string'
        ? item.reason
        : typeof item.postReason === 'string'
          ? item.postReason
          : undefined;
      return [{ ...item.post, feedReason: reason }];
    }
    return isPostItem(item) ? [item] : [];
  });

  return {
    items,
    nextCursor: Array.isArray(payload) ? null : ((payload.nextCursor as string | null) ?? null),
  };
}

export interface GetFeedParams {
  query?: string;
  sortBy?: 'RECENT' | 'POPULAR' | 'TRENDING';
  cursor?: string;
  limit?: number;
}

/**
 * Fetch Home Feed Posts
 */
export async function getFeed(
  paramsOrCursor?: GetFeedParams | string,
  limit = 20,
  clientType: 'web' | 'mobile' = 'web'
): Promise<FeedResponse> {
  let opts: GetFeedParams = {};
  if (typeof paramsOrCursor === 'string') {
    opts = { cursor: paramsOrCursor, limit };
  } else if (paramsOrCursor && typeof paramsOrCursor === 'object') {
    opts = paramsOrCursor;
  }

  const queryParams = new URLSearchParams();
  queryParams.set('limit', String(opts.limit || limit));
  if (opts.cursor) queryParams.set('cursor', opts.cursor);
  if (opts.sortBy) queryParams.set('sortBy', opts.sortBy);
  if (opts.query && opts.query.trim().length >= 2) {
    queryParams.set('query', opts.query.trim());
  }

  try {
    const response = await apiFetch<FeedApiResponse>(`${API_ENDPOINTS.POSTS.FEED_HOME}?${queryParams.toString()}`, { method: 'GET' }, clientType);
    return normalizeFeedResponse(response);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.statusCode === 404) {
      const response = await apiFetch<FeedApiResponse>(`/posts/feed?${queryParams.toString()}`, { method: 'GET' }, clientType);
      return normalizeFeedResponse(response);
    }
    throw error;
  }
}

/**
 * Fetch Posts authored by a specific user profile (GET /v1/posts?authorProfileId=...)
 */
export async function getUserPosts(authorProfileId: string, limit = 20, clientType: 'web' | 'mobile' = 'web'): Promise<FeedResponse> {
  const query = new URLSearchParams({ authorProfileId, limit: String(limit) });
  const response = await apiFetch<FeedApiResponse>(`${API_ENDPOINTS.POSTS.BASE}?${query.toString()}`, { method: 'GET' }, clientType);
  return normalizeFeedResponse(response);
}

/** Fetch posts published to a group. */
export async function getGroupPosts(groupId: string, limit = 20, clientType: 'web' | 'mobile' = 'web'): Promise<FeedResponse> {
  const query = new URLSearchParams({ groupId, limit: String(limit) });
  const response = await apiFetch<FeedApiResponse>(
    `${API_ENDPOINTS.POSTS.BASE}?${query.toString()}`,
    { method: 'GET' },
    clientType,
  );
  return normalizeFeedResponse(response);
}

export interface CreatePostApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  pendingGuardianApproval?: boolean;
  post?: PostItem;
  id?: string;
  data?: CreatePostApiResponse;
}

/**
 * Create a new Post (POST /v1/posts)
 * Returns message: 'POST_CREATED' normally, or 'POST_PENDING_APPROVAL' with pendingGuardianApproval: true if held for guardian approval
 */
export async function createPost(dto: CreatePostDTO, clientType: 'web' | 'mobile' = 'web'): Promise<CreatePostApiResponse> {
  return apiFetch<CreatePostApiResponse>(API_ENDPOINTS.POSTS.BASE, {
    method: 'POST',
    body: JSON.stringify(dto),
  }, clientType);
}

/**
 * React to a Post (Like)
 */
export async function likePost(postId: string, reactionType = 'LIKE', clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean; pendingGuardianApproval?: boolean; message?: string }> {
  const response = await apiFetch<{ success: boolean; pendingGuardianApproval?: boolean; message?: string } | undefined>(API_ENDPOINTS.POSTS.REACTIONS(normalizePostId(postId)), {
    method: 'POST',
    body: JSON.stringify({ type: reactionType }),
  }, clientType);
  return response ?? { success: true };
}

/**
 * Remove reaction from a Post (Unlike)
 */
export async function unlikePost(postId: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean }> {
  const response = await apiFetch<{ success: boolean } | undefined>(API_ENDPOINTS.POSTS.REACTIONS(normalizePostId(postId)), {
    method: 'DELETE',
  }, clientType);
  return response ?? { success: true };
}

/**
 * Get comments for a Post
 */
export interface PostCommentItem {
  id: string;
  body: string;
  text?: string;
  content?: string;
  createdAt: string;
  likeCount?: number;
  pendingGuardianApproval?: boolean;
  status?: string;
  authorProfileId?: string;
  authorProfile?: PostItem['author'] & { position?: string | null; jerseyNumber?: number | null; type?: string | null };
  author?: PostItem['author'] & { position?: string | null; jerseyNumber?: number | null; type?: string | null };
}

interface CommentsResponse {
  items?: PostCommentItem[];
  data?: { items?: PostCommentItem[] } | PostCommentItem[];
}

export async function getComments(postId: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ items: PostCommentItem[] }> {
  const response = await apiFetch<CommentsResponse | PostCommentItem[]>(API_ENDPOINTS.POSTS.COMMENTS(normalizePostId(postId)), { method: 'GET' }, clientType);
  const payload = Array.isArray(response) ? response : response.data ?? response;
  const items = Array.isArray(payload) ? payload : payload.items ?? [];
  return { items };
}

/**
 * Add comment to a Post
 */
export async function addComment(postId: string, text: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ comment: PostCommentItem; message?: string }> {
  const response = await apiFetch<{
    data?: { comment?: PostCommentItem } | PostCommentItem;
    comment?: PostCommentItem;
    message?: string;
  } & Partial<PostCommentItem>>(API_ENDPOINTS.POSTS.COMMENTS(normalizePostId(postId)), {
    method: 'POST',
    body: JSON.stringify({ body: text }),
  }, clientType);
  const data = response.data;
  const comment = data && 'comment' in data && data.comment
    ? data.comment
    : data && 'id' in data
      ? data
      : response.comment ?? response as PostCommentItem;
  return { comment, message: response.message };
}

export interface RepostDTO {
  commentary?: string;
  audience?: 'PUBLIC' | 'CONNECTIONS' | 'GROUP' | 'CUSTOM';
}

/**
 * Repost / Share a Post (POST /v1/posts/{postId}/repost)
 */
export async function repostPost(postId: string, dto: RepostDTO = {}, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean; post: PostItem; data?: { post?: PostItem; id?: string } }> {
  return apiFetch<{ success: boolean; post: PostItem }>(API_ENDPOINTS.POSTS.REPOST(normalizePostId(postId)), {
    method: 'POST',
    body: JSON.stringify(dto || {}),
  }, clientType);
}

export interface UpdatePostDTO {
  body?: string;
  content?: string;
  mediaUrls?: string[];
  audience?: 'PUBLIC' | 'CONNECTIONS' | 'GROUP' | 'CUSTOM';
  placeName?: string;
}

/**
 * Update / Edit a Post (PATCH /v1/posts/:id)
 */
export async function updatePost(postId: string, dto: UpdatePostDTO, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean; data?: unknown; message?: string }> {
  const { content, ...fields } = dto;
  const payload = {
    ...fields,
    body: dto.body ?? content,
  };
  return apiFetch<{ success: boolean; data?: unknown; message?: string }>(API_ENDPOINTS.POSTS.GET_POST(normalizePostId(postId)), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, clientType);
}

/**
 * Delete a Post (DELETE /v1/posts/:id)
 */
export async function deletePost(postId: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean; message?: string }> {
  return apiFetch<{ success: boolean; message?: string }>(API_ENDPOINTS.POSTS.DELETE_POST(normalizePostId(postId)), {
    method: 'DELETE',
  }, clientType);
}
