'use client';

import { useMutation } from '@tanstack/react-query';
import { updateAuthProfile, type UpdateProfileDTO } from '@my-hockey-network/core';

/**
 * `updateAuthProfile` (`PATCH /v1/auth/profile`) as a mutation — shared by
 * Profile's Intro save, Personal Details save, and the standalone Edit
 * Profile modal, all of which previously called `updateAuthProfile`
 * directly and inline. Does not invalidate `QueryKeys.AUTH_ME` itself:
 * callers already follow the successful response with `setUserProfile` +
 * `loadAuthMe(true, true)`, which is the real refresh path.
 */
export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (dto: UpdateProfileDTO) => updateAuthProfile(dto),
  });
}
