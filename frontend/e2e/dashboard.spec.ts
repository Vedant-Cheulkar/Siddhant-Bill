import { test, expect } from '@playwright/test';
import { fakeLogin } from './helpers/auth';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await fakeLogin(page);
    await page.goto('/');
  });

  test('renders dashboard page', async ({ page }) => {
    await expect(page.getByText('Overview').first()).toBeVisible();
  });

  test('shows Summary widget', async ({ page }) => {
    await expect(page.getByText('Summary')).toBeVisible();
  });

  test('shows Earnings Overview chart', async ({ page }) => {
    await expect(page.getByText('Earnings Overview')).toBeVisible();
  });

  test('shows Invoice Breakdown panel', async ({ page }) => {
    await expect(page.getByText('Invoice Breakdown')).toBeVisible();
  });

  test('shows mini calendar with current month', async ({ page }) => {
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const currentMonth = months[new Date().getMonth()];
    await expect(page.getByText(new RegExp(currentMonth))).toBeVisible();
  });

  test('command palette opens with button click', async ({ page }) => {
    await page.getByLabel('Open search').click();
    await expect(page.getByPlaceholder('Search or navigate…')).toBeVisible();
  });

  test('command palette closes with Escape key', async ({ page }) => {
    await page.getByLabel('Open search').click();
    // Wait for palette to be visible first
    const input = page.getByPlaceholder('Search or navigate…');
    await expect(input).toBeVisible();
    await input.press('Escape');
    await expect(input).not.toBeVisible();
  });
});
