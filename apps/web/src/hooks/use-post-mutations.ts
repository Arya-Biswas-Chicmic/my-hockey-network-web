'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPost,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
  uploadMediaFile,
  completeMediaUpload,
  type CreatePostDTO,
  type CreatePostApiResponse,
  type UpdatePostDTO,
} from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';

import { invalidateQueryPrefix } from '@/query';

/**
 * Feed/post mutation hooks — the "query/mutation hooks" tier of the
 * `Endpoints → API services → query/mutation hooks → components` hierarchy
 * (see docs/COMPONENT_CATALOG.md "Feed/post query and mutation hooks").
 * Each hook owns only the HTTP call; response-driven UI behavior (toasts,
 * local state resets, re-fetch scheduling) stays in the calling
 * component's `onSuccess`/`onError` callbacks — this mirrors exactly what
 * `home-page.tsx` already did inline, just moved into a reusable hook
 * rather than changing what happens on success/failure.
 */

interface CreatePostVariables {
  dto: Omit<CreatePostDTO, 'mediaIds'>;
  imageFile?: File;
}

/**
 * Uploads the attached image (if any) and creates the post.
 * Automatically invalidates both the Home feed (QueryKeys.FEED_POSTS)
 * and Profile posts listings (QueryKeys.USER_POSTS) on success.
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation<CreatePostApiResponse, unknown, CreatePostVariables>({
    mutationFn: async ({ dto, imageFile }) => {
      let mediaIds: string[] | undefined;

      if (imageFile) {
        const uploadRes = await uploadMediaFile(imageFile, 'POST_IMAGE');
        const mediaId = uploadRes.mediaId || uploadRes.storageKey;
        if (mediaId) {
          mediaIds = [mediaId];
          try {
            await completeMediaUpload(mediaId);
          } catch (completeError) {
            console.warn('Media complete notice:', completeError);
          }
        }
      }

      return createPost({ ...dto, mediaIds });
    },
    onSuccess: () => {
      void invalidateQueryPrefix(queryClient, QueryKeys.FEED_POSTS);
      void invalidateQueryPrefix(queryClient, QueryKeys.USER_POSTS);
    },
  });
}

/** Invalidates the feed and profile posts listings after a successful like/unlike, comment, edit, or delete. */
function useInvalidateFeed() {
  const queryClient = useQueryClient();
  return () => {
    void invalidateQueryPrefix(queryClient, QueryKeys.FEED_POSTS);
    void invalidateQueryPrefix(queryClient, QueryKeys.USER_POSTS);
  };
}

export function useLikePostMutation() {
  const invalidateFeed = useInvalidateFeed();
  return useMutation({
    mutationFn: ({ postId }: { postId: string }) => likePost(postId, 'LIKE'),
    onSuccess: () => {
      void invalidateFeed();
    },
  });
}

export function useUnlikePostMutation() {
  const invalidateFeed = useInvalidateFeed();
  return useMutation({
    mutationFn: ({ postId }: { postId: string }) => unlikePost(postId),
    onSuccess: () => {
      void invalidateFeed();
    },
  });
}

export function useUpdatePostMutation() {
  const invalidateFeed = useInvalidateFeed();
  return useMutation({
    mutationFn: ({ postId, dto }: { postId: string; dto: UpdatePostDTO }) => updatePost(postId, dto),
    onSuccess: () => {
      void invalidateFeed();
    },
  });
}

export function useDeletePostMutation() {
  const invalidateFeed = useInvalidateFeed();
  return useMutation({
    mutationFn: ({ postId }: { postId: string }) => deletePost(postId),
    onSuccess: () => {
      void invalidateFeed();
    },
  });
}
