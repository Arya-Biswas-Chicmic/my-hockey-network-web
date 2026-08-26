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
}

export interface FeedResponse {
  items: PostItem[];
  nextCursor?: string | null;
}

type FeedApiResponse = FeedResponse | PostItem[] | { data: FeedResponse | PostItem[] };

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
    return await apiFetch<FeedResponse>(`${API_ENDPOINTS.POSTS.FEED_HOME}?${queryParams.toString()}`, { method: 'GET' }, clientType);
  } catch (error: unknown) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return await apiFetch<FeedResponse>(`/posts/feed?${queryParams.toString()}`, { method: 'GET' }, clientType);
    }
    throw error;
  }
}

/**
 * Fetch Posts authored by a specific user profile (GET /v1/posts?authorProfileId=...)
 */
export async function getUserPosts(authorProfileId: string, limit = 20, clientType: 'web' | 'mobile' = 'web'): Promise<FeedResponse> {
  const query = new URLSearchParams({ authorProfileId, limit: String(limit) });
  try {
    const response = await apiFetch<FeedApiResponse>(`${API_ENDPOINTS.POSTS.BASE}?${query.toString()}`, { method: 'GET' }, clientType);
    let payload: FeedResponse | PostItem[];
    if (Array.isArray(response)) {
      payload = response;
    } else if ('data' in response) {
      payload = response.data;
    } else {
      payload = response;
    }
    const items = Array.isArray(payload) ? payload : payload.items;
    return {
      items,
      nextCursor: Array.isArray(payload) ? null : payload.nextCursor || null,
    };
  } catch {
    return { items: [] };
  }
}

/** Fetch posts published to a group. */
export async function getGroupPosts(groupId: string, limit = 20, clientType: 'web' | 'mobile' = 'web'): Promise<FeedResponse> {
  const query = new URLSearchParams({ groupId, limit: String(limit) });
  const response = await apiFetch<FeedResponse | { data?: FeedResponse }>(
    `${API_ENDPOINTS.POSTS.BASE}?${query.toString()}`,
    { method: 'GET' },
    clientType,
  );
  return 'data' in response && response.data ? response.data : response as FeedResponse;
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
  return apiFetch<{ success: boolean; pendingGuardianApproval?: boolean; message?: string }>(API_ENDPOINTS.POSTS.REACTIONS(postId), {
    method: 'POST',
    body: JSON.stringify({ type: reactionType }),
  }, clientType);
}

/**
 * Remove reaction from a Post (Unlike)
 */
export async function unlikePost(postId: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(API_ENDPOINTS.POSTS.REACTIONS(postId), {
    method: 'DELETE',
  }, clientType);
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
  try {
    const response = await apiFetch<CommentsResponse | PostCommentItem[]>(API_ENDPOINTS.POSTS.COMMENTS(postId), { method: 'GET' }, clientType);
    const payload = Array.isArray(response) ? response : response.data ?? response;
    const items = Array.isArray(payload) ? payload : payload.items ?? [];
    return { items };
  } catch {
    return { items: [] };
  }
}

/**
 * Add comment to a Post
 */
export async function addComment(postId: string, text: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ comment: PostCommentItem; message?: string }> {
  const response = await apiFetch<{
    data?: { comment?: PostCommentItem } | PostCommentItem;
    comment?: PostCommentItem;
    message?: string;
  } & Partial<PostCommentItem>>(API_ENDPOINTS.POSTS.COMMENTS(postId), {
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
  return apiFetch<{ success: boolean; post: PostItem }>(API_ENDPOINTS.POSTS.REPOST(postId), {
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
  const payload = {
    ...dto,
    body: dto.body ?? dto.content,
  };
  return apiFetch<{ success: boolean; data?: unknown; message?: string }>(API_ENDPOINTS.POSTS.GET_POST(postId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, clientType);
}

/**
 * Delete a Post (DELETE /v1/posts/:id)
 */
export async function deletePost(postId: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean; message?: string }> {
  return apiFetch<{ success: boolean; message?: string }>(API_ENDPOINTS.POSTS.DELETE_POST(postId), {
    method: 'DELETE',
  }, clientType);
}
