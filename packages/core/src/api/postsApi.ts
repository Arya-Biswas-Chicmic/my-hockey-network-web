import { apiFetch } from './client';
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
  };
  reactionsCount?: number;
  commentsCount?: number;
  userReaction?: string | null;
}

export interface FeedResponse {
  items: PostItem[];
  nextCursor?: string | null;
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
    return await apiFetch<FeedResponse>(`${API_ENDPOINTS.POSTS.FEED_HOME}?${queryParams.toString()}`, { method: 'GET' }, clientType);
  } catch (err: any) {
    if (err?.statusCode === 404) {
      return await apiFetch<FeedResponse>(`/posts/feed?${queryParams.toString()}`, { method: 'GET' }, clientType);
    }
    throw err;
  }
}

/**
 * Fetch Posts authored by a specific user profile (GET /v1/posts?authorProfileId=...)
 */
export async function getUserPosts(authorProfileId: string, limit = 20, clientType: 'web' | 'mobile' = 'web'): Promise<FeedResponse> {
  const query = new URLSearchParams({ authorProfileId, limit: String(limit) });
  try {
    const res = await apiFetch<any>(`${API_ENDPOINTS.POSTS.BASE}?${query.toString()}`, { method: 'GET' }, clientType);
    const payload = res?.data || res;
    const items = payload?.items || (Array.isArray(payload) ? payload : []);
    return {
      items,
      nextCursor: payload?.nextCursor || null,
    };
  } catch (err: any) {
    console.warn('[getUserPosts] API Warning:', err.message || err);
    return { items: [] };
  }
}

export interface CreatePostApiResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  pendingGuardianApproval?: boolean;
  post?: PostItem;
  id?: string;
  data?: any;
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
export async function likePost(postId: string, reactionType = 'LIKE', clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(API_ENDPOINTS.POSTS.REACTIONS(postId), {
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
export async function getComments(postId: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ items: any[] }> {
  try {
    const res = await apiFetch<any>(API_ENDPOINTS.POSTS.COMMENTS(postId), { method: 'GET' }, clientType);
    const payload = res?.data || res;
    const items = payload?.items || (Array.isArray(payload) ? payload : []);
    return { items };
  } catch (err: any) {
    console.warn(`[getComments] API Warning for post ${postId}:`, err.message || err);
    return { items: [] };
  }
}

/**
 * Add comment to a Post
 */
export async function addComment(postId: string, text: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ comment: any; message?: string }> {
  const res = await apiFetch<any>(API_ENDPOINTS.POSTS.COMMENTS(postId), {
    method: 'POST',
    body: JSON.stringify({ body: text }),
  }, clientType);
  const comment = res?.data?.comment || res?.data || res?.comment || res;
  return { comment, message: res?.message };
}

export interface RepostDTO {
  commentary?: string;
  audience?: 'PUBLIC' | 'CONNECTIONS' | 'GROUP' | 'CUSTOM';
}

/**
 * Repost / Share a Post (POST /v1/posts/{postId}/repost)
 */
export async function repostPost(postId: string, dto: RepostDTO = {}, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean; post: any }> {
  return apiFetch<{ success: boolean; post: any }>(API_ENDPOINTS.POSTS.REPOST(postId), {
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
export async function updatePost(postId: string, dto: UpdatePostDTO, clientType: 'web' | 'mobile' = 'web'): Promise<{ success: boolean; data?: any; message?: string }> {
  const payload = {
    ...dto,
    body: dto.body ?? dto.content,
  };
  return apiFetch<{ success: boolean; data?: any; message?: string }>(API_ENDPOINTS.POSTS.GET_POST(postId), {
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
