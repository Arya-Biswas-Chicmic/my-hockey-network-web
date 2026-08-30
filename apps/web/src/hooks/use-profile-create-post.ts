'use client';

import { useState } from 'react';
import { QueryKeys, PostAudienceEnum } from '@my-hockey-network/contracts';
import { isEmailValid } from '@my-hockey-network/validation';
import { globalQueryClient, invalidateQueryPrefix } from '@/query';
import { useCreatePostMutation } from '@/hooks/use-post-mutations';

import { showSuccessToast } from '@/utils/toast';
import { SUCCESS_MESSAGES } from '@my-hockey-network/constants';

interface UseProfileCreatePostOptions {
  onPostCreated?: () => void | Promise<void>;
}

/** Profile screen's "create post" flow (the composer opened from the Posts
 * tab). Extracted from `screens/profile-page.tsx`. */
export function useProfileCreatePost(options?: UseProfileCreatePostOptions) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const createPostMutation = useCreatePostMutation();

  const handleCreatePost = async (
    content: string,
    _postImage?: string,
    privacySettings?: { audience: string; shareWith?: string; dontShareWith?: string; locationTag?: string },
    imageFile?: File,
  ) => {
    let audienceEnum: PostAudienceEnum = PostAudienceEnum.PUBLIC;
    if (privacySettings?.audience === 'Connections') audienceEnum = PostAudienceEnum.CONNECTIONS;
    if (privacySettings?.audience === 'Groups') audienceEnum = PostAudienceEnum.GROUP;
    if (privacySettings?.audience === 'Custom') audienceEnum = PostAudienceEnum.PRIVATE;

    const parseEmails = (str?: string) => {
      if (!str || !str.trim()) return undefined;
      const emails = str
        .split(/[, \n;]+/)
        .map((e) => e.trim())
        .filter((e) => isEmailValid(e));
      return emails.length > 0 ? emails : undefined;
    };

    const dto = {
      body: content,
      audience: audienceEnum,
      placeName: privacySettings?.locationTag || undefined,
      shareWithEmails: parseEmails(privacySettings?.shareWith),
      hideFromEmails: parseEmails(privacySettings?.dontShareWith),
    };

    try {
      // imageFile (not the postImage preview string, which is a local blob: URL the backend
      // can't resolve) is what actually gets uploaded — see useCreatePostMutation.
      await createPostMutation.mutateAsync({ dto, imageFile });
      globalQueryClient.removeQueries({
        predicate: (query) =>
          String(query.queryKey[0] ?? '').startsWith(QueryKeys.FEED_POSTS) ||
          String(query.queryKey[0] ?? '').startsWith(QueryKeys.USER_POSTS),
      });
      await Promise.all([
        invalidateQueryPrefix(globalQueryClient, QueryKeys.FEED_POSTS),
        invalidateQueryPrefix(globalQueryClient, QueryKeys.USER_POSTS),
      ]);
      await options?.onPostCreated?.();
      showSuccessToast(SUCCESS_MESSAGES.POST_CREATED);
      setIsCreatePostOpen(false);
    } catch (err: unknown) {
      console.error('❌ [ProfilePage] Create Post Error:', err);
      setIsCreatePostOpen(false);
    }
  };

  return {
    isCreatePostOpen,
    openCreatePostModal: () => setIsCreatePostOpen(true),
    closeCreatePostModal: () => setIsCreatePostOpen(false),
    handleCreatePost,
    isCreatingPost: createPostMutation.isPending,
  };
}
