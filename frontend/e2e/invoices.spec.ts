import { test, expect } from '@playwright/test';
import { fakeLogin } from './helpers/auth';

test.describe('Invoice List', () => {
  test.beforeEach(async ({ page }) => {
    await fakeLogin(page);
    await page.goto('/invoices');
  });

  test('renders invoice list page with tabs', async ({ page }) => {
    await expect(page.getByText('Invoices').first()).toBeVisible();
    await expect(page.getByText('All')).toBeVisible();
    await expect(page.getByText('Issued')).toBeVisible();
    await expect(page.getByText('Draft')).toBeVisible();
    await expect(page.getByText('Cancelled')).toBeVisible();
  });

  test('shows search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by invoice/i)).toBeVisible();
  });

  test('"New Invoice" button is present and navigates', async ({ page }) => {
    // The page-level "New Invoice" button is inside main content
    await page.locator('main').getByRole('button', { name: 'New Invoice' }).click();
    await page.waitForURL('/invoices/new');
    await expect(page).toHaveURL('/invoices/new');
  });
});

test.describe('Invoice Detail Form', () => {
  test.beforeEach(async ({ page }) => {
    await fakeLogin(page);
    await page.goto('/invoices/new');
  });

  test('renders new invoice form', async ({ page }) => {
    await expect(page.getByText('New Invoice').first()).toBeVisible();
    await expect(page.getByText('Invoice Details')).toBeVisible();
    await expect(page.getByText('Line Items')).toBeVisible();
    await expect(page.getByText('Notes')).toBeVisible();
  });

  test('shows invoice summary panel', async ({ page }) => {
    await expect(page.getByText('Invoice Summary')).toBeVisible();
    await expect(page.getByText('INV-NEW')).toBeVisible();
  });

  test('shows validation error when submitting without customer', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Invoice' }).click();
    await expect(page.getByText(/select a customer/i)).toBeVisible();
  });

  test('can add a line item', async ({ page }) => {
    await page.getByText('Add line item').click();
    const items = page.getByLabel('Remove item');
    await expect(items).toHaveCount(2);
  });

  test('cancel navigates back to invoice list', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForURL('/invoices');
    await expect(page).toHaveURL('/invoices');
  });
});
