/**
 * Profile photo save — DUMMY implementation until the real backend endpoint
 * is ready. Feedback 2026-08-29: "currently API is not working... create a
 * dummy save profile photo API end point... keep the skeleton same so that
 * we can easily replace the same." `use-profile-image-uploads.ts` only
 * depends on this function's name and `Promise<SaveProfilePhotoResult>`
 * shape, not on what happens inside it — swapping the body below for a real
 * call is the entire migration needed later, e.g.:
 *
 *   const uploadRes = await uploadMediaFile(file, 'AVATAR');
 *   const updated = await updateAuthProfile({ avatarKey: uploadRes.storageKey });
 *   return { success: true, avatarUrl: updated.profile?.avatarUrl ?? undefined };
 *
 * (`uploadMediaFile`/`updateAuthProfile` already exist in
 * `@my-hockey-network/core` and are the real, working multi-step upload —
 * this dummy exists because that pipeline is the thing "not working" right
 * now, not because it doesn't exist.)
 *
 * DO NOT delete this file or the local-avatar-cache mechanism it backs
 * (`@/utils/local-avatar-storage`) once a real API lands — see
 * docs/DEMO_DATA_POLICY.md. The local cache is the permanent display
 * source everywhere a profile photo renders, by design, not a stand-in for
 * this dummy.
 */
export interface SaveProfilePhotoResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

export async function saveProfilePhotoDummy(dataUrl: string): Promise<SaveProfilePhotoResult> {
  // No network call — nothing to await for real yet. Returns the same data
  // URL back as `avatarUrl` so a future real implementation's response
  // shape (a URL string) is already what every caller expects.
  return { success: true, avatarUrl: dataUrl };
}
