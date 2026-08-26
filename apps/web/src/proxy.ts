import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side pre-filter for `(authenticated)` routes — narrows, but does
 * not close, the gap documented in `docs/DATA_FETCHING_AND_AUTH.md` and
 * `docs/AGENTS.md` ("client redirects are not a security control").
 *
 * This is deliberately an *optimistic* check, not a full session
 * validation: Next.js's own Proxy guide (bundled at
 * `node_modules/next/dist/docs/01-app/02-guides/authentication.md`,
 * "Optimistic checks with Proxy") explicitly warns against a real
 * backend/database call here, because Proxy runs on every navigation —
 * including prefetches — so a network round-trip per run is a real
 * performance problem, not just a style preference. Their recommended
 * pattern is to decrypt a local session cookie; that requires a
 * self-contained (e.g. JWT) session token this backend doesn't issue — its
 * httpOnly cookie is opaque, only the backend can validate it (that's why
 * `/auth/me` exists as a real endpoint at all).
 *
 * Given that constraint, the check that's actually safe to do here is
 * presence, not validity: no cookie header at all on a protected route
 * means "definitely not logged in" with zero backend cost, so redirect
 * immediately, before the authenticated shell ever renders. A cookie being
 * present does NOT mean the session is still valid — that determination
 * stays with `AuthenticatedGuard` (`components/routing/authenticated-guard.tsx`),
 * which makes the real `/auth/me` call client-side and is still the
 * authoritative, final check either way.
 */
export default function proxy(request: NextRequest) {
  if (!request.headers.get('cookie')) {
    const url = request.nextUrl.clone();
    const returnTo = url.pathname;
    url.pathname = '/onboarding';
    url.search = `?returnTo=${encodeURIComponent(returnTo)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/network/:path*',
    '/events/:path*',
    '/messaging/:path*',
    '/notifications/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/supervision/:path*',
    '/event-detail/:path*',
    '/help/:path*',
  ],
};
