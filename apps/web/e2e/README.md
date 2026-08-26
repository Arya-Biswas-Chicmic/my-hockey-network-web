# End-to-end tests

Playwright specs live here. Config: `apps/web/playwright.config.ts`.

## Running

```bash
pnpm --filter @my-hockey-network/web test:e2e
```

The config starts `next dev` for you and waits for `http://localhost:3000` unless
`PLAYWRIGHT_BASE_URL` is already set (point it at a running server — e.g. a deployed preview —
to skip spawning one locally).

## Suites

- **`public.spec.ts`** — guest-only smoke coverage: root-to-sign-in redirect, `robots.txt`,
  `sitemap.xml`, the 404 page, the onboarding sign-in form rendering, and a protected route
  redirecting a guest to onboarding. No login, no form submission — safe to run against the live
  backend in any environment, including CI, with no extra setup.
- **`authenticated-flow.spec.ts`** — the full login → feed → post → like → comment → logout
  lifecycle. **Skipped by default.** It writes real data (a post, a like, a comment) to whatever
  backend the run targets, so it only runs when both `E2E_TEST_EMAIL` (a real mailbox the OTP
  auto-prefill flow can sign in as) and `E2E_ALLOW_LIVE_WRITES=1` are set:

  ```bash
  E2E_TEST_EMAIL=your-test-account@example.com E2E_ALLOW_LIVE_WRITES=1 \
    pnpm --filter @my-hockey-network/web test:e2e authenticated-flow
  ```

  Relies on the backend's dev-mode OTP `devCode`/`code` field (see
  `components/features/auth/verify-email/VerifyEmailForm.tsx`); once a real email service is wired
  up, this suite needs a mailbox-reading step instead of relying on auto-prefill.

## CI

`.github/workflows/ci.yml` runs `public.spec.ts` on every push/PR, after the production build, using
a fake `API_BASE_URL` — that's fine, since these specs never need a real backend response (a failed
`/auth/me` call is treated as "not authenticated," which is exactly the guest state they exercise).
`authenticated-flow.spec.ts` is **not** wired into CI — it needs a CI-owned test account and secret
(`E2E_TEST_EMAIL`) plus a real reachable backend before it's safe to add there.
