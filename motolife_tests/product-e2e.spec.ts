import { test, expect, Page } from '@playwright/test';
import { navigateToCreateProduct } from './navigation.helper';

const SEL = {
  name:           'input[name="name"]',
  sku:            'input[name="sku"]',
  sellingPrice:   'input[name="sellingPrice"]',
  buyingPrice:    'input[name="buyingPrice"]',
  stockQuantity:  'input[name="stockQuantity"]',
  discountValue:  'input[name="discountValue"]',
  discountPrice: 'input[name="discountPrice"]',
};

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

async function selectOption(page: Page, selector: string, optionText: string) {
  if (selector.startsWith('text=')) {
    const text = selector.replace('text=', '');
    await page.getByRole('combobox', { name: text }).click();
  } else {
    await page.locator(selector).click();
  }
  await page.getByRole('option', { name: optionText }).click();
}

async function fillBasicProductDetails(page: Page, productName: string) {
  await page.setInputFiles('input[type="file"]', {
    mimeType: 'image/png',
    name: 'product.png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
  });

  await page.fill(SEL.name, productName);
  await page.locator(SEL.name).blur();
  await page.waitForTimeout(500);

  await page.getByRole('combobox', { name: 'Category', exact: true }).click();
  await page.getByRole('option', { name: 'Helmet' }).click();

  await page.waitForTimeout(400);
  await page.getByRole('combobox', { name: 'Subcategory' }).click();
  await page.getByRole('option', { name: 'Full Face' }).click();

  await page.getByRole('combobox', { name: 'Brand', exact: true }).click();
  await page.getByRole('option', { name: 'SteelBird' }).click();

  await page.getByRole('combobox', { name: 'Unit', exact: true }).click();
  await page.getByRole('option', { name: 'pc' }).click();

  const descEditor = page.locator('[contenteditable="true"]').first();
  await descEditor.click();
  await descEditor.fill('Premium quality product');
}

async function submitProduct(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Add New Product' }).click();
  await expect(page).toHaveURL(/in-house-product/, { timeout: 15000 });
}

const timestamp = Date.now();
const baseName = 'Honda Helmet';
const productWithBenefit = `${baseName} Benefit ${timestamp}`;
const productNoBenefit = `${baseName} NoBenefit ${timestamp}`;
const productWithStock = `${baseName} Stock ${timestamp}`;
const productZeroStock = `${baseName} ZeroStock ${timestamp}`;
const productWithDiscount = `${baseName} Discount ${timestamp}`;

test.describe('Product E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const url = page.url();
    if (!url.includes('in-house-product/create')) {
      await page.goto('/admin/product-management/in-house-product/create');
    }
  });

test('12.1 — full valid form submission shows success toast', async ({ page }) => {
    const productName = `${baseName} Full ${timestamp}`;
     
    // ── Thumbnail image ──────────────────────────────────────────────────────
    await page.setInputFiles('input[type="file"]', {
      mimeType: 'image/png',
      name: 'helmet.png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    
    // ── General setup ──────────────────────────────────────────────────────
    await page.fill(SEL.name, productName);
    await page.locator(SEL.name).blur();
    
    // Wait for SKU to auto-generate from the name
    await page.waitForTimeout(500);
    const sku = await page.inputValue(SEL.sku);
    expect(sku).toBeTruthy();
    
    // Category → Helmet
    await page.getByRole('combobox', { name: 'Category', exact: true }).click();
    await page.getByRole('option', { name: 'Helmet' }).click();
    
    // Subcategory → Full Face (appears after category is selected)
    await page.waitForTimeout(400);
    await page.getByRole('combobox', { name: 'Subcategory' }).click();
    await page.getByRole('option', { name: 'Full Face' }).click();
    
    // Brand → SteelBird (helmet brand)
    await page.getByRole('combobox', { name: 'Brand', exact: true }).click();
    await page.getByRole('option', { name: 'SteelBird' }).click();
    
    // Unit → pc
    await page.getByRole('combobox', { name: 'Unit', exact: true }).click();
    await page.getByRole('option', { name: 'pc' }).click();
    
    // ── Description ────────────────────────────────────────────────────────
    const descEditor = page.locator('[contenteditable="true"]').first();
    await descEditor.click();
    await descEditor.fill('Honda Full Face Helmet - Premium quality helmet designed for Honda bike riders. Provides full face protection with ventilation system.');
    
    // ── Pricing ───────────────────────────────────────────────────────────��
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice,  '2800');
    await page.fill(SEL.stockQuantity, '25');
    
    // ── Publish ────────────────────────────────────────────────────────────
    await setSwitch(page, 'Publish', true);
    
    // ── Submit ─────────────────────────────────────────────────────────────
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Add New Product' }).click();

    // Wait for redirect to product list
    await expect(page).toHaveURL(/in-house-product/, { timeout: 15000 });
  });

test('12.2 — created product appears in the product list', async ({ page }) => {
    const productName = `${baseName} List ${timestamp}`;
     
    // ── Thumbnail image ──────────────────────────────────────────────────────
    await page.setInputFiles('input[type="file"]', {
      mimeType: 'image/png',
      name: 'helmet.png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    
    // ── General setup ──────────────────────────────────────────────────────
    await page.fill(SEL.name, productName);
    await page.locator(SEL.name).blur();
    await page.waitForTimeout(500);
    
    await page.getByRole('combobox', { name: 'Category', exact: true }).click();
    await page.getByRole('option', { name: 'Helmet' }).click();
    
    await page.waitForTimeout(400);
    await page.getByRole('combobox', { name: 'Subcategory' }).click();
    await page.getByRole('option', { name: 'Full Face' }).click();
    
    await page.getByRole('combobox', { name: 'Brand', exact: true }).click();
    await page.getByRole('option', { name: 'SteelBird' }).click();
    
    await page.getByRole('combobox', { name: 'Unit', exact: true }).click();
    await page.getByRole('option', { name: 'pc' }).click();
    
    const descEditor = page.locator('[contenteditable="true"]').first();
    await descEditor.click();
    await descEditor.fill('Honda Full Face Helmet - Premium quality helmet designed for Honda bike riders.');
    
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice,  '2800');
    await page.fill(SEL.stockQuantity, '25');
    
    // ── Submit ─────────────────────────────────────────────────────────────
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Add New Product' }).click();
    
    // Wait for redirect to product list ─────────────────────────────────
    await expect(page).toHaveURL(/in-house-product/, { timeout: 15000 });
    
    // ── Assert product appears in the list ────────────────────────────────
    await expect(
      page.getByText(productName, { exact: false }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW E2E TEST CASES
  // ═══════════════════════════════════════════════════════════════════════════

  test('12.3 — create product with a product benefit', async ({ page }) => {
    await fillBasicProductDetails(page, productWithBenefit);

    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');

    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.waitForTimeout(200);
    await page.locator('role=option').first().click();

    await submitProduct(page);

    await page.waitForTimeout(2000);
  });

  test('12.4 — create product without a benefit', async ({ page }) => {
    await fillBasicProductDetails(page, productNoBenefit);

    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');

    await submitProduct(page);

    await page.waitForTimeout(2000);
  });

  test('12.5 — create product with stock', async ({ page }) => {
    await fillBasicProductDetails(page, productWithStock);

    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '50');

    await submitProduct(page);

    await expect(page.getByText(productWithStock, { exact: false }).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.6 — create product with zero stock', async ({ page }) => {
    await fillBasicProductDetails(page, productZeroStock);

    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');

    await submitProduct(page);

    await expect(page.getByText(productZeroStock, { exact: false }).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.7 — create product with a discount as percentage', async ({ page }) => {
    await fillBasicProductDetails(page, productWithDiscount);

    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');

    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '15');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);

    await expect(page.getByText(productWithDiscount, { exact: false }).first()).toBeVisible({ timeout: 10000 });
  });

  test('12.8 — product with benefit + stock + % discount', async ({ page }) => {
    const name = `BenefitStockPct ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.9 — product with benefit + stock + fixed discount', async ({ page }) => {
    const name = `BenefitStockFixed ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.10 — product with benefit + stock + no discount', async ({ page }) => {
    const name = `BenefitStockNoDisc ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();
    await setSwitch(page, 'Enable Product Discount?', false);
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.11 — product without benefit + stock + % discount', async ({ page }) => {
    const name = `NoBenefitStockPct ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.12 — product without benefit + stock + fixed discount', async ({ page }) => {
    const name = `NoBenefitStockFixed ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.13 — product without benefit + stock + no discount', async ({ page }) => {
    const name = `NoBenefitStockNoDisc ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.14 — product with benefit + zero stock + no discount', async ({ page }) => {
    const name = `BenefitZeroNoDisc ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();
    await setSwitch(page, 'Enable Product Discount?', false);
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.15 — product with benefit + zero stock + % discount', async ({ page }) => {
    const name = `BenefitZeroPct ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.16 — product with benefit + zero stock + fixed discount', async ({ page }) => {
    const name = `BenefitZeroFixed ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.17 — product without benefit + zero stock + % discount', async ({ page }) => {
    const name = `NoBenefitZeroPct ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('12.18 — product without benefit + zero stock + fixed discount', async ({ page }) => {
    const name = `NoBenefitZeroFixed ${timestamp}`;
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    await page.waitForTimeout(2000);
  });
});