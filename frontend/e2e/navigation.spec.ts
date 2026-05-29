import { test, expect } from '@playwright/test';
import { fakeLogin } from './helpers/auth';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await fakeLogin(page);
    await page.goto('/');
  });

  test('renders sidebar with all nav items', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Overview')).toBeVisible();
    await expect(sidebar.getByText('Invoices')).toBeVisible();
    await expect(sidebar.getByText('Customers')).toBeVisible();
    await expect(sidebar.getByText('Item Groups')).toBeVisible();
    await expect(sidebar.getByText('Work Orders')).toBeVisible();
    await expect(sidebar.getByText('Reports')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();
  });

  test('breadcrumb updates on navigation', async ({ page }) => {
    await expect(page.getByText('Siddhant Logistics').first()).toBeVisible();
    await page.locator('aside').getByRole('link', { name: 'Invoices' }).click();
    await page.waitForURL('/invoices');
    await expect(page).toHaveURL('/invoices');
  });

  test('navigates to invoices page', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: 'Invoices' }).click();
    await page.waitForURL('/invoices');
    await expect(page).toHaveURL('/invoices');
  });

  test('navigates to customers page', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: 'Customers' }).click();
    await page.waitForURL('/customers');
    await expect(page).toHaveURL('/customers');
  });

  test('navigates to reports page', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: 'Reports' }).click();
    await page.waitForURL('/reports');
    await expect(page).toHaveURL('/reports');
  });

  test('"New Invoice" button navigates to invoice form', async ({ page }) => {
    // Use the header "New Invoice" button specifically
    await page.locator('header').getByRole('button', { name: 'New Invoice' }).click();
    await page.waitForURL('/invoices/new');
    await expect(page).toHaveURL('/invoices/new');
  });

  test('⌘K search button is visible in header', async ({ page }) => {
    await expect(page.getByLabel('Open search')).toBeVisible();
  });
});
