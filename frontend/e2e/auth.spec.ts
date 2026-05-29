import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('renders login page with correct elements', async ({ page }) => {
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('shows error for empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel('Email').fill('not-valid');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('shows password required error', async ({ page }) => {
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected invoices route redirects to login', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page).toHaveURL(/\/login/);
  });
});
