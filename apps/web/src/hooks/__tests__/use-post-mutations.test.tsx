// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';

import { QueryKeys } from '@my-hockey-network/contracts';

import { createQueryClient } from '@/query/query-client';
import { QueryProvider } from '@/query/query-context';
import {
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/hooks/use-post-mutations';

const {
  createPost,
  likePost,
  unlikePost,
  updatePost,
  deletePost,
  uploadMediaFile,
  completeMediaUpload,
} = vi.hoisted(() => ({
  createPost: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  uploadMediaFile: vi.fn(),
  completeMediaUpload: vi.fn(),
}));

vi.mock('@my-hockey-network/core', () => ({
  createPost,
  likePost,
  unlikePost,
  updatePost,
  deletePost,
  uploadMediaFile,
  completeMediaUpload,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider client={createQueryClient()}>{children}</QueryProvider>;
}

describe('useCreatePostMutation', () => {
  it('creates a post without uploading media when no image is attached', async () => {
    createPost.mockResolvedValue({ message: 'POST_CREATED', post: { id: 'p1' } });
    const { result } = renderHook(() => useCreatePostMutation(), { wrapper });

    result.current.mutate({ dto: { body: 'hello' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(uploadMediaFile).not.toHaveBeenCalled();
    expect(createPost).toHaveBeenCalledWith({ body: 'hello', mediaIds: undefined });
  });

  it('uploads the image, completes the upload, and attaches its mediaId before creating the post', async () => {
    uploadMediaFile.mockResolvedValue({ mediaId: 'media-1' });
    completeMediaUpload.mockResolvedValue(undefined);
    createPost.mockResolvedValue({ message: 'POST_CREATED', post: { id: 'p2' } });
    const { result } = renderHook(() => useCreatePostMutation(), { wrapper });

    const imageFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    result.current.mutate({ dto: { body: 'with photo' }, imageFile });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(uploadMediaFile).toHaveBeenCalledWith(imageFile, 'POST_IMAGE');
    expect(completeMediaUpload).toHaveBeenCalledWith('media-1');
    expect(createPost).toHaveBeenCalledWith({ body: 'with photo', mediaIds: ['media-1'] });
  });

  it('invalidates both FEED_POSTS and USER_POSTS queries on success', async () => {
    createPost.mockResolvedValue({ message: 'POST_CREATED', post: { id: 'p4' } });
    const client = createQueryClient();
    client.setQueryData([QueryKeys.FEED_POSTS, 'RECENT'], { items: [] });
    client.setQueryData([`${QueryKeys.USER_POSTS}:u1`], { items: [] });
    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: ({ children }) => <QueryProvider client={client}>{children}</QueryProvider>,
    });

    result.current.mutate({ dto: { body: 'fresh post' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryState([QueryKeys.FEED_POSTS, 'RECENT'])?.isInvalidated).toBe(true);
    expect(client.getQueryState([`${QueryKeys.USER_POSTS}:u1`])?.isInvalidated).toBe(true);
  });
});

describe('feed-invalidating post mutations', () => {
  it('useLikePostMutation invalidates the feed cache on success', async () => {
    likePost.mockResolvedValue({ success: true });
    const client = createQueryClient();
    client.setQueryData([QueryKeys.FEED_POSTS, 'RECENT'], { items: [] });
    const { result } = renderHook(() => useLikePostMutation(), {
      wrapper: ({ children }) => <QueryProvider client={client}>{children}</QueryProvider>,
    });

    result.current.mutate({ postId: 'p1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(likePost).toHaveBeenCalledWith('p1', 'LIKE');
    expect(client.getQueryState([QueryKeys.FEED_POSTS, 'RECENT'])?.isInvalidated).toBe(true);
  });

  it('useUnlikePostMutation calls unlikePost and invalidates the feed cache', async () => {
    unlikePost.mockResolvedValue({ success: true });
    const client = createQueryClient();
    client.setQueryData([QueryKeys.FEED_POSTS], { items: [] });
    const { result } = renderHook(() => useUnlikePostMutation(), {
      wrapper: ({ children }) => <QueryProvider client={client}>{children}</QueryProvider>,
    });

    result.current.mutate({ postId: 'p1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(unlikePost).toHaveBeenCalledWith('p1');
    expect(client.getQueryState([QueryKeys.FEED_POSTS])?.isInvalidated).toBe(true);
  });

  it('useUpdatePostMutation forwards the postId and dto', async () => {
    updatePost.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useUpdatePostMutation(), { wrapper });

    result.current.mutate({ postId: 'p9', dto: { body: 'edited' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updatePost).toHaveBeenCalledWith('p9', { body: 'edited' });
  });

  it('useDeletePostMutation forwards the postId', async () => {
    deletePost.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDeletePostMutation(), { wrapper });

    result.current.mutate({ postId: 'p9' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deletePost).toHaveBeenCalledWith('p9');
  });

  it('surfaces a mutation error via isError instead of throwing out of the hook', async () => {
    likePost.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useLikePostMutation(), { wrapper });

    result.current.mutate({ postId: 'p1' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
