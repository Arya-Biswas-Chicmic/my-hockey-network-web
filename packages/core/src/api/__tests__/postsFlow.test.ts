import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../client';
import * as clientModule from '../client';
import {
  getComments,
  getFeed,
  likePost,
  normalizeFeedResponse,
  updatePost,
} from '../postsApi';

const post = {
  id: 'post-real-123',
  body: 'Championship update',
  audience: 'PUBLIC',
  createdAt: '2026-08-26T12:00:00.000Z',
  likeCount: 4,
};

describe('post API flow', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('unwraps feed items and preserves the real post identifier and feed reason', () => {
    expect(normalizeFeedResponse({
      items: [{ reason: 'SELF', post }],
      nextCursor: 'cursor-2',
    })).toEqual({
      items: [{ ...post, feedReason: 'SELF' }],
      nextCursor: 'cursor-2',
    });
  });

  it('normalizes wrapped home-feed results at the API boundary', async () => {
    const request = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({
      items: [{ postReason: 'FOLLOWING', post }],
      nextCursor: null,
    });

    await expect(getFeed({ limit: 20, sortBy: 'RECENT' })).resolves.toEqual({
      items: [{ ...post, feedReason: 'FOLLOWING' }],
      nextCursor: null,
    });
    expect(request).toHaveBeenCalledWith(
      '/feed?limit=20&sortBy=RECENT',
      { method: 'GET' },
      'web',
    );
  });

  it('sends reactions to the real post URL with the backend reaction payload', async () => {
    const request = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({ success: true });

    await expect(likePost(' post-real-123 ')).resolves.toEqual({ success: true });
    expect(request).toHaveBeenCalledWith(
      '/posts/post-real-123/reactions',
      { method: 'POST', body: JSON.stringify({ type: 'LIKE' }) },
      'web',
    );
  });

  it('rejects a missing post identifier before making a backend request', async () => {
    const request = vi.spyOn(clientModule, 'apiFetch');

    await expect(likePost('undefined')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Post identifier is missing. Refresh the feed and try again.',
    });
    expect(request).not.toHaveBeenCalled();
  });

  it('updates a post with PATCH and does not send the compatibility content field', async () => {
    const request = vi.spyOn(clientModule, 'apiFetch').mockResolvedValue({ success: true });

    await updatePost('post-real-123', { content: 'Updated text' });
    expect(request).toHaveBeenCalledWith(
      '/posts/post-real-123',
      { method: 'PATCH', body: JSON.stringify({ body: 'Updated text' }) },
      'web',
    );
  });

  it('propagates comment read failures instead of converting them to an empty state', async () => {
    vi.spyOn(clientModule, 'apiFetch').mockRejectedValue(new ApiError(502, 'Bad Gateway'));

    await expect(getComments('post-real-123')).rejects.toMatchObject({
      statusCode: 502,
      message: 'Bad Gateway',
    });
  });
});

