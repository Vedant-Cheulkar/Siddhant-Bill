import { test, expect } from '@playwright/test';
import { fakeLogin } from './helpers/auth';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await fakeLogin(page);
    await page.goto('/settings');
  });

  test('renders 4 settings tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Company', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Invoice', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tax',     exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Profile', exact: true })).toBeVisible();
  });

  test('Company tab shows company name input with default value', async ({ page }) => {
    const input = page.getByLabel(/Company Name/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('Siddhant Logistics');
  });

  test('can save company settings', async ({ page }) => {
    const input = page.getByLabel(/Company Name/i);
    await input.fill('Siddhant Logistics Pvt Ltd');
    await page.getByRole('button', { name: /Save Company Settings/i }).click();
    await expect(page.getByText('Company settings saved.')).toBeVisible();
  });

  test('Invoice tab shows prefix and due days fields', async ({ page }) => {
    await page.getByRole('button', { name: /^Invoice$/i }).click();
    await expect(page.getByLabel(/Invoice Prefix/i)).toBeVisible();
    await expect(page.getByLabel(/Default Due Days/i)).toBeVisible();
  });

  test('Tax tab shows GST rate selector', async ({ page }) => {
    await page.getByRole('button', { name: /^Tax$/i }).click();
    await expect(page.getByText('Default GST Rate')).toBeVisible();
    await expect(page.getByRole('button', { name: '18%' })).toBeVisible();
  });

  test('Profile tab shows read-only user info', async ({ page }) => {
    await page.getByRole('button', { name: /^Profile$/i }).click();
    await expect(page.getByText('Your Profile')).toBeVisible();
  });
});
