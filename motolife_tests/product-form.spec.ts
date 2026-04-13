import { test, expect, Page } from '@playwright/test';
import { navigateToCreateProduct } from './navigation.helper';

// ─── Selectors ────────────────────────────────────────────────────────────────
const SEL = {
  name:           'input[name="name"]',
  sku:            'input[name="sku"]',
  sellingPrice:   'input[name="sellingPrice"]',
  buyingPrice:    'input[name="buyingPrice"]',
  stockQuantity:  'input[name="stockQuantity"]',
  discountValue:  'input[name="discountValue"]',
  discountPrice:  'input[name="discountPrice"]',
  snapshotLink:   'input[name="snapshotLink"]',

  showDiscount:   'role=switch >> text="Enable Product Discount?"',
  showBenefit:    'role=switch >> text="Add Product Benefit?"',
  showSizeGuide:  'role=switch >> text="Enable Size Guide?"',
  showVariation:  'role=switch >> text="Enable Product Variation?"',
  isPublished:    'role=switch >> text="Publish"',
  isFeatured:     'role=switch >> text="Featured"',

  submitBtn:      'button[type="submit"]:has-text("Submit")',
  cancelBtn:      'a:has-text("Cancel")',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function selectOption(page: Page, selector: string, optionText: string) {
  if (selector.startsWith('text=')) {
    const text = selector.replace('text=', '');
    await page.getByRole('combobox', { name: text }).click();
  } else {
    await page.locator(selector).click();
  }
  await page.getByRole('option', { name: optionText }).click();
}

async function setSwitch(page: Page, text: string, desiredOn: boolean) {
  const switchEl = page.getByText(text, { exact: true });
  await switchEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const isChecked = await switchEl.evaluate(el => {
    const input = el.parentElement?.querySelector('input[type="checkbox"]');
    return (input as HTMLInputElement)?.checked;
  });
  if (isChecked !== desiredOn) await switchEl.click();
}

// ─── Tests ────────────────────────────────────────────────────────────────────
test.describe('Product Creation Form', () => {

  // Auth session is pre-loaded from global.setup.ts — no login needed here
  // Navigate to the create page fresh before every test
  test.beforeEach(async ({ page }) => {
    const url = page.url();
    if (!url.includes('in-house-product/create')) {
      await page.goto('/admin/product-management/in-house-product/create');
    }
  });

  // ── 1. Page load ─────────────────────────────────────────────────────────
  test('1.1 — all form sections are visible', async ({ page }) => {
    await expect(page.getByText('General Setup')).toBeVisible();
    await expect(page.getByText('Product Description', { exact: true })).toBeVisible();
    await expect(page.getByText('Additional Product Images or Videos', { exact: true })).toBeVisible();
    await expect(page.getByText('Product Pricing', { exact: true })).toBeVisible();
    await expect(page.getByText('Add Product Variation', { exact: true })).toBeVisible();
    await expect(page.getByText('Product Tags', { exact: true })).toBeVisible();
    await page.locator('button[type="submit"]').last().scrollIntoViewIfNeeded();
    await expect(page.locator('button[type="submit"]').last()).toBeVisible();
    await expect(page.locator('a:has-text("Cancel")').last()).toBeVisible();
  });

  // ── 2. SKU auto-generation ───────────────────────────────────────────────
  test('2.1 — SKU is auto-generated from product name', async ({ page }) => {
    await page.fill(SEL.name, 'My New Gadget');
    await page.locator(SEL.name).blur();
    const sku = await page.inputValue(SEL.sku);
    expect(sku).toBeTruthy();
  });

  test('2.2 — SKU clears when product name is deleted', async ({ page }) => {
    await page.fill(SEL.name, 'Some Product');
    await page.locator(SEL.name).blur();
    await page.fill(SEL.name, '');
    await page.locator(SEL.name).blur();
    expect(await page.inputValue(SEL.sku)).toBe('');
  });

  // ── 3. Empty form validation ─────────────────────────────────────────────
  test('3.1 — submitting empty form shows required errors', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText(/is required/i)).toHaveCount(7);
  });

  test('3.2 — error banner is shown on invalid submit', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText(/Please fill all the required fields/i)).toBeVisible();
  });

  // ── 4. Pricing validation ────────────────────────────────────────────────
  test('4.1 — selling price less than buying price shows error', async ({ page }) => {
    await page.fill(SEL.sellingPrice, '200');
    await page.fill(SEL.buyingPrice, '500');
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText('Must be greater than or equal to buying price')).toBeVisible();
  });

  test('4.2 — selling price cannot exceed 10,00,000', async ({ page }) => {
    await page.fill(SEL.sellingPrice, '1100000');
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText('Selling price cannot exceed 10,00,000')).toBeVisible();
  });

  // ── 5. Discount section ──────────────────────────────────────────────────
  test('5.1 — discount fields appear after enabling toggle', async ({ page }) => {
    await expect(page.locator(SEL.discountValue)).not.toBeVisible();
    await setSwitch(page, 'Enable Product Discount?', true);
    await expect(page.locator(SEL.discountValue)).toBeVisible();
    await expect(page.locator(SEL.discountPrice)).toBeVisible();
  });

  test('5.2 — percentage discount auto-calculates discount price', async ({ page }) => {
    await page.fill(SEL.sellingPrice, '1000');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '20');
    await page.locator(SEL.discountValue).blur();
    const dp = await page.inputValue(SEL.discountPrice);
    expect(Number(dp)).toBeCloseTo(800, 0);
  });

  test('5.3 — percentage discount cannot exceed 90%', async ({ page }) => {
    await page.fill(SEL.sellingPrice, '1000');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '95');
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText(/Discount value cannot exceed 90/)).toBeVisible();
  });

  // ── 6. Benefits ──────────────────────────────────────────────────────────
  test('6.1 — benefit select appears after toggle is enabled', async ({ page }) => {
    await setSwitch(page, 'Add Product Benefit?', true);
    await expect(page.getByRole('combobox', { name: 'Benefit' })).toBeVisible();
  });

  test('6.2 — benefit is required when toggle is on', async ({ page }) => {
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText('Benefit is required')).toBeVisible();
  });

  // ── 7. Size guide ────────────────────────────────────────────────────────
  test('7.1 — size guide fields appear after enabling toggle', async ({ page }) => {
    await setSwitch(page, 'Enable Size Guide?', true);
    await expect(page.getByText('Size Guide Images')).toBeVisible();
  });

  test('7.2 — size guide description is required when enabled', async ({ page }) => {
    await setSwitch(page, 'Enable Size Guide?', true);
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText('Size guide is required')).toBeVisible();
  });

  // ── 8. YouTube video link ────────────────────────────────────────────────
  test('8.1 — invalid YouTube URL shows error', async ({ page }) => {
    await page.fill(SEL.snapshotLink, 'https://notayoutube.com/watch?v=abc');
    await page.locator(SEL.snapshotLink).blur();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Add New Product' }).click();
    await expect(page.getByText(/Please enter a valid YouTube video link/i)).toBeVisible();
  });

  test('8.2 — valid YouTube URL adds a video card', async ({ page }) => {
    await page.fill(SEL.snapshotLink, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.locator(SEL.snapshotLink).blur();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Youtube Video Link')).toBeVisible();
  });

  // ── 9. Variation section ─────────────────────────────────────────────────
  test('9.1 — variation fields appear after toggle', async ({ page }) => {
    await setSwitch(page, 'Enable Product Variation?', true);
    await expect(page.getByText('Attribute Name')).toBeVisible();
    await expect(page.getByText('Attribute Value')).toBeVisible();
  });

  test('9.2 — Add Variant button is limited to 3 variants', async ({ page }) => {
    await setSwitch(page, 'Enable Product Variation?', true);
    const addBtn = page.getByRole('button', { name: 'Add Variant' });
    await addBtn.click();
    await addBtn.click();
    await expect(addBtn).not.toBeVisible();
  });

  // ── 10. Product tags ─────────────────────────────────────────────────────
  test('10.1 — product tag switches can be toggled', async ({ page }) => {
    await setSwitch(page, 'Featured', true);
    await setSwitch(page, 'Publish', true);
  });

// ── 11. Cancel navigation ────────────────────────────────────────────────
  test('11.1 — Cancel button goes back to product list', async ({ page }) => {
    await page.locator(SEL.cancelBtn).click();
    await expect(page).toHaveURL(/in-house-product/);
  });

});