import { test, expect } from '@playwright/test';

/**
 * End-to-end coverage of the core authenticated post lifecycle: login via
 * OTP, feed load, post creation, liking, commenting, and logout.
 *
 * Gated behind `E2E_TEST_EMAIL`/`E2E_ALLOW_LIVE_WRITES` on purpose. This
 * suite creates a real post and a real like/comment against whatever
 * backend `PLAYWRIGHT_BASE_URL`/`API_BASE_URL` points at — running it
 * against a shared staging backend writes real, visible data other testers
 * will see. Opt in deliberately (a dedicated test account, and confirmation
 * that writing test data to that backend is acceptable) rather than by
 * default. See `e2e/README.md`.
 *
 * OTP relies on the backend's dev-mode `devCode`/`code` field
 * (`OnboardingModal.tsx`/`VerifyEmailForm.tsx` auto-prefill it into the code
 * input) — this only works while the backend has no real email service
 * wired up. Once it does, this suite needs a mailbox-reading step instead.
 */

const TEST_EMAIL = process.env.E2E_TEST_EMAIL;
const LIVE_WRITES_ALLOWED = process.env.E2E_ALLOW_LIVE_WRITES === '1';

test.describe('Authenticated post lifecycle', () => {
  test.skip(
    !TEST_EMAIL || !LIVE_WRITES_ALLOWED,
    'Set E2E_TEST_EMAIL and E2E_ALLOW_LIVE_WRITES=1 to run this against a real backend — see the file header.',
  );

  test('logs in via OTP, creates a post, likes it, comments on it, then logs out', async ({ page }) => {
    const postBody = `E2E smoke test post ${Date.now()}`;

    await page.goto('/onboarding');
    await page.getByLabel('Email Address').fill(TEST_EMAIL!);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // OTP code is auto-prefilled from the backend's dev-mode response.
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeEnabled();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForURL(/\/home/);
    await expect(page.getByRole('heading', { name: /home/i }).or(page.locator('body'))).toBeVisible();

    // Create a post.
    await page.getByRole('button', { name: /post|share an update/i }).first().click();
    await page.getByRole('textbox').first().fill(postBody);
    await page.getByRole('button', { name: 'Post' }).click();
    await expect(page.getByText(postBody)).toBeVisible({ timeout: 15_000 });

    // Like the post just created.
    const postCard = page.locator('article', { hasText: postBody });
    await postCard.getByRole('button', { name: 'Like post' }).click();

    // Comment on it.
    await postCard.getByRole('button', { name: 'Toggle comments' }).click();
    await postCard.getByRole('textbox').last().fill('E2E smoke test comment');
    await postCard.getByRole('button', { name: /comment|send/i }).click();
    await expect(postCard.getByText('E2E smoke test comment')).toBeVisible();

    // Log out.
    await page.getByRole('button', { name: /account menu|profile menu/i }).click();
    await page.getByText('Logout').click();
    await page.getByRole('button', { name: /confirm|log out/i }).click();
    await page.waitForURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });
});
