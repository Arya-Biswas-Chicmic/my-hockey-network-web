import { test, expect } from '@playwright/test';

// Guest-only smoke coverage: no login, no form submission, safe to run
// against the live backend in any environment. See `e2e/README.md`.

test.describe('Public entry and SEO routes', () => {
  test('redirects the root URL directly to sign in', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('robots.txt is served and points at the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('Sitemap:');
  });

  test('sitemap.xml is served as valid XML', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('xml');
  });

  test('unknown routes render the not-found page instead of crashing', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Onboarding (guest guard)', () => {
  test('renders a real sign-in form for a guest visitor', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});

test.describe('Route guards fail closed for guests', () => {
  test('visiting a protected route while unauthenticated redirects to onboarding', async ({ page }) => {
    await page.goto('/home');
    await page.waitForURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });
});
