import 'server-only';
import type { ProfileReadResponse } from '@my-hockey-network/contracts';

import { getServerEnvironment } from '@/infrastructure/server/environment';

/**
 * Anonymous, credential-free read of a profile for the public profile page
 * (`app/(public)/players/[id]/page.tsx`). Deliberately does not forward
 * cookies — this must work for a logged-out visitor and a search crawler,
 * and must never leak one user's session into a page rendered for everyone.
 * The backend's own visibility rules (see `viewerTier` on the response)
 * decide how much of the profile an anonymous viewer receives.
 *
 * Returns `null` on any non-2xx response (private/not-found/backend error)
 * so the page can render a public-safe fallback rather than an error.
 */
export async function getPublicProfile(profileId: string): Promise<ProfileReadResponse['profile'] | null> {
  const { apiBaseUrl } = getServerEnvironment();

  try {
    const response = await fetch(`${apiBaseUrl}/profiles/${encodeURIComponent(profileId)}`, {
      method: 'GET',
      // No `credentials`/cookie forwarding — anonymous request by design.
      next: { revalidate: 300, tags: [`public-profile:${profileId}`] },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as ProfileReadResponse | { data: ProfileReadResponse };
    const payload = 'data' in data ? data.data : data;
    return payload?.profile ?? null;
  } catch {
    return null;
  }
}
