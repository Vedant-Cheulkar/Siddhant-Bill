import { type Page } from '@playwright/test';

/** Inject a fake token so ProtectedRoute passes without a real backend */
export async function fakeLogin(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'e2e-test-token');
    localStorage.setItem('refresh_token', 'e2e-refresh-token');
  });
}
