import { test, expect } from '@playwright/test';
import { fakeLogin } from './helpers/auth';

test.describe('Customer List', () => {
  test.beforeEach(async ({ page }) => {
    await fakeLogin(page);
    await page.goto('/customers');
  });

  test('renders customer list page', async ({ page }) => {
    await expect(page.getByText('Customers').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Customer' })).toBeVisible();
    await expect(page.getByPlaceholder(/search by name/i)).toBeVisible();
  });

  test('navigates to new customer form', async ({ page }) => {
    await page.getByRole('button', { name: 'New Customer' }).click();
    await page.waitForURL('/customers/new');
    await expect(page).toHaveURL('/customers/new');
  });
});

test.describe('Customer Form', () => {
  test.beforeEach(async ({ page }) => {
    await fakeLogin(page);
    await page.goto('/customers/new');
  });

  test('renders new customer form', async ({ page }) => {
    await expect(page.getByText('New Customer').first()).toBeVisible();
    // Tab buttons
    await expect(page.getByRole('button', { name: 'Basic Info' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Billing$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Other' })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).click();
    const errors = page.locator('[role="alert"]');
    await expect(errors.first()).toBeVisible();
  });

  test('billing tab shows GSTIN and PAN fields', async ({ page }) => {
    // The Billing tab button — use exact button name to avoid ambiguity
    await page.getByRole('button', { name: /^Billing$/ }).click();
    await expect(page.getByLabel('GSTIN')).toBeVisible();
    await expect(page.getByLabel('PAN')).toBeVisible();
  });
});
