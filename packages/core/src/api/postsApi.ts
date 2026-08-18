import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export interface CreatePostDTO {
  body?: string;
  audience?: 'PUBLIC' | 'CONNECTIONS' | 'GROUP' | 'CUSTOM';
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

/**
 * Fetch Home Feed Posts
 */
export async function getFeed(cursor?: string, limit = 20, clientType: 'web' | 'mobile' = 'web'): Promise<FeedResponse> {
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) query.set('cursor', cursor);

  try {
    return await apiFetch<FeedResponse>(`${API_ENDPOINTS.POSTS.FEED_HOME}?${query.toString()}`, { method: 'GET' }, clientType);
  } catch (err: any) {
    try {
      return await apiFetch<FeedResponse>(`/posts/feed?${query.toString()}`, { method: 'GET' }, clientType);
    } catch {
      return { items: [] };
    }
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
  return apiFetch<{ items: any[] }>(API_ENDPOINTS.POSTS.COMMENTS(postId), { method: 'GET' }, clientType);
}

/**
 * Add comment to a Post
 */
export async function addComment(postId: string, text: string, clientType: 'web' | 'mobile' = 'web'): Promise<{ comment: any }> {
  return apiFetch<{ comment: any }>(API_ENDPOINTS.POSTS.COMMENTS(postId), {
    method: 'POST',
    body: JSON.stringify({ body: text }),
  }, clientType);
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
