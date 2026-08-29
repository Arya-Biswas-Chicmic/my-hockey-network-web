/**
 * Local-first profile photo cache. Product direction 2026-08-29: "whenever I
 * will update the profile photo... it will save to locally and keep this in
 * implementation also even after implementing the API... everywhere we will
 * fetch from the local profile photo." This is a permanent display layer,
 * not a temporary workaround for the upload API being unavailable — see
 * `docs/DEMO_DATA_POLICY.md` for why it must not be removed without asking
 * first, and `@/services/profile-photo.service` for the (currently dummy)
 * save call this backs.
 *
 * Keyed per profile id in `localStorage` so switching accounts in the same
 * browser never shows the wrong person's cached photo, and so it survives a
 * refresh/reopen the way an in-memory cache wouldn't.
 */
const STORAGE_KEY_PREFIX = 'mhn:local-avatar:';

export function getLocalAvatar(profileId: string | null | undefined): string | null {
  if (!profileId || typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY_PREFIX + profileId);
  } catch {
    // localStorage can throw (private browsing, quota exceeded) — callers
    // already have a real `avatarUrl` fallback for this case.
    return null;
  }
}

export function setLocalAvatar(profileId: string, dataUrl: string): void {
  if (!profileId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + profileId, dataUrl);
  } catch {
    // Quota exceeded or private-mode storage disabled — the newly picked
    // photo just won't persist locally this time; not fatal.
  }
}

export function clearLocalAvatar(profileId: string | null | undefined): void {
  if (!profileId || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_PREFIX + profileId);
  } catch {
    // ignore
  }
}

/** Reads a `File`/`Blob` into a base64 data URL for local storage + display. */
export function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
