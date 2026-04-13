import { Page, expect } from '@playwright/test';

/**
 * Navigates from the dashboard to the Add New Product page.
 * Call this at the start of any test that needs the product creation form.
 */
export async function navigateToCreateProduct(page: Page) {
  // ── Step 1: Open Product Management menu ──────────────────────────────────
  await page.getByRole('button', { name: 'Product Management' }).click();
  await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();

  // ── Step 2: Go to In-house Products list ──────────────────────────────────
  await page.getByRole('link', { name: 'In-house Products' }).click();
  await expect(
    page.getByRole('row', { name: '1 PR02330886 Inez Greene Inez' })
  ).toBeVisible();

  // ── Step 3: Click Add New Product ─────────────────────────────────────────
  await page.getByRole('button', { name: 'Add New Product' }).click();

  // ── Step 4: Confirm we are on the create page ──────────────────────────────
  await expect(page.getByText('General Setup')).toBeVisible();
}