import { test, expect, Page } from '@playwright/test';
import { navigateToCreateProduct } from './navigation.helper';
import fs from 'fs';
import path from 'path';

const SEL = {
  name:           'input[name="name"]',
  sku:            'input[name="sku"]',
  sellingPrice:   'input[name="sellingPrice"]',
  buyingPrice:    'input[name="buyingPrice"]',
  stockQuantity:  'input[name="stockQuantity"]',
  discountValue:  'input[name="discountValue"]',
  discountPrice: 'input[name="discountPrice"]',
};

const IMAGES_DIR = path.join(__dirname, '..', 'images');

const BIKE_PRODUCTS = [
  'Honda Activa Front Guard',
  'Honda Shine LED Headlight',
  'Honda Dio Mirror Set',
  'Honda Accessory Kit',
  'Honda Horn 12V',
  'Honda Brake Shoe Set',
  'Honda Chain Set',
  'Honda Spark Plug',
  'Honda Oil Filter',
  'Honda Air Filter',
  'Honda Clutch Cable',
  'Honda Throttle Cable',
  'Honda Tail Light',
  'Honda Indicator Set',
  'Honda Seat Cover',
  'Honda Floor Mat',
];

function getRandomImage(): { name: string; mimeType: string; buffer: Buffer }[] {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => 
    /\.(jpg|jpeg|png|webp|avif)$/i.test(f)
  );
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const ext = path.extname(randomFile).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' 
    : ext === '.webp' ? 'image/webp'
    : ext === '.avif' ? 'image/avif'
    : 'image/jpeg';
  return [{
    name: randomFile,
    mimeType,
    buffer: fs.readFileSync(path.join(IMAGES_DIR, randomFile)),
  }];
}

function getRandomBikeProduct(): string {
  return BIKE_PRODUCTS[Math.floor(Math.random() * BIKE_PRODUCTS.length)];
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

async function selectOption(page: Page, selector: string, optionText: string) {
  if (selector.startsWith('text=')) {
    const text = selector.replace('text=', '');
    await page.getByRole('combobox', { name: text }).click();
  } else {
    await page.locator(selector).click();
  }
  await page.getByRole('option', { name: optionText }).click();
}

async function fillBasicProductDetails(page: Page, productName: string, description: string) {
  const image = getRandomImage();
  await page.setInputFiles('input[type="file"]', image);

  await page.fill(SEL.name, productName);
  await page.locator(SEL.name).blur();
  await page.waitForTimeout(500);

  await page.getByRole('combobox', { name: 'Category', exact: true }).click();
  const categoryOptions = await page.locator('[role="option"]').all();
  if (categoryOptions.length > 0) {
    const randomCategory = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
    await randomCategory.click();
  }

  await page.waitForTimeout(400);
  await page.getByRole('combobox', { name: 'Subcategory' }).click();
  await page.waitForTimeout(300);
  const subcategoryOptions = await page.locator('[role="option"]').all();
  if (subcategoryOptions.length > 0) {
    const randomSubcategory = subcategoryOptions[Math.floor(Math.random() * subcategoryOptions.length)];
    await randomSubcategory.click();
  }

  await page.getByRole('combobox', { name: 'Brand', exact: true }).click();
  await page.waitForTimeout(300);
  const brandOptions = await page.locator('[role="option"]').all();
  if (brandOptions.length > 0) {
    const randomBrand = brandOptions[Math.floor(Math.random() * brandOptions.length)];
    await randomBrand.click();
  }

  await page.getByRole('combobox', { name: 'Unit', exact: true }).click();
  const unitOptions = await page.locator('[role="option"]').all();
  if (unitOptions.length > 0) {
    const randomUnit = unitOptions[Math.floor(Math.random() * unitOptions.length)];
    await randomUnit.click();
  }

  const descEditor = page.locator('[contenteditable="true"]').first();
  await descEditor.click();
  await descEditor.fill(description);
}

async function submitProduct(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Add New Product' }).click();
  await expect(page).toHaveURL(/in-house-product/, { timeout: 15000 });
}

test.describe('Product E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const url = page.url();
    if (!url.includes('in-house-product/create')) {
      await page.goto('/admin/product-management/in-house-product/create');
    }
  });

  test('12.1 — Create product with all fields filled', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.1: Full valid form submission - All fields filled including category, brand, subcategory, pricing, and published status.';
      
    await page.setInputFiles('input[type="file"]', getRandomImage());
    
    await page.fill(SEL.name, productName);
    await page.locator(SEL.name).blur();
    await page.waitForTimeout(500);
    const sku = await page.inputValue(SEL.sku);
    expect(sku).toBeTruthy();
    
    await page.getByRole('combobox', { name: 'Category', exact: true }).click();
    await page.waitForTimeout(300);
    const catOptions = await page.locator('[role="option"]').all();
    if (catOptions.length > 0) await catOptions[Math.floor(Math.random() * catOptions.length)].click();
    
    await page.waitForTimeout(400);
    await page.getByRole('combobox', { name: 'Subcategory' }).click();
    await page.waitForTimeout(300);
    const subcatOptions = await page.locator('[role="option"]').all();
    if (subcatOptions.length > 0) await subcatOptions[Math.floor(Math.random() * subcatOptions.length)].click();
    
    await page.getByRole('combobox', { name: 'Brand', exact: true }).click();
    await page.waitForTimeout(300);
    const brandOptions = await page.locator('[role="option"]').all();
    if (brandOptions.length > 0) await brandOptions[Math.floor(Math.random() * brandOptions.length)].click();
    
    await page.getByRole('combobox', { name: 'Unit', exact: true }).click();
    await page.waitForTimeout(300);
    const unitOptions = await page.locator('[role="option"]').all();
    if (unitOptions.length > 0) await unitOptions[Math.floor(Math.random() * unitOptions.length)].click();
    
    const descEditor = page.locator('[contenteditable="true"]').first();
    await descEditor.click();
    await descEditor.fill(description);
    
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    
    await setSwitch(page, 'Publish', true);
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Add New Product' }).click();

    await expect(page).toHaveURL(/in-house-product/, { timeout: 15000 });
    console.log(`✅ TEST 12.1 PASSED: ${productName}`);
  });

  test('12.2 — Verify product appears in product list', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.2: Verify created product appears in the product list after submission.';
      
    await page.setInputFiles('input[type="file"]', getRandomImage());
    
    await page.fill(SEL.name, productName);
    await page.locator(SEL.name).blur();
    await page.waitForTimeout(500);
    
    await page.getByRole('combobox', { name: 'Category', exact: true }).click();
    await page.waitForTimeout(300);
    const catOptions = await page.locator('[role="option"]').all();
    if (catOptions.length > 0) await catOptions[Math.floor(Math.random() * catOptions.length)].click();
    
    await page.waitForTimeout(400);
    await page.getByRole('combobox', { name: 'Subcategory' }).click();
    await page.waitForTimeout(300);
    const subcatOptions = await page.locator('[role="option"]').all();
    if (subcatOptions.length > 0) await subcatOptions[Math.floor(Math.random() * subcatOptions.length)].click();
    
    await page.getByRole('combobox', { name: 'Brand', exact: true }).click();
    await page.waitForTimeout(300);
    const brandOptions = await page.locator('[role="option"]').all();
    if (brandOptions.length > 0) await brandOptions[Math.floor(Math.random() * brandOptions.length)].click();
    
    await page.getByRole('combobox', { name: 'Unit', exact: true }).click();
    await page.waitForTimeout(300);
    const unitOptions = await page.locator('[role="option"]').all();
    if (unitOptions.length > 0) await unitOptions[Math.floor(Math.random() * unitOptions.length)].click();
    
    const descEditor = page.locator('[contenteditable="true"]').first();
    await descEditor.click();
    await descEditor.fill(description);
    
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Add New Product' }).click();
    
    await expect(page).toHaveURL(/in-house-product/, { timeout: 15000 });
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ TEST 12.2 PASSED: ${productName}`);
  });

  test('12.3 — Create product with product benefit enabled', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.3: Create product with Product Benefit toggle enabled and select a benefit from dropdown.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');

    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.waitForTimeout(200);
    const benefitOptions = await page.locator('[role="option"]').all();
    if (benefitOptions.length > 0) await benefitOptions[0].click();

    await submitProduct(page);
    console.log(`✅ TEST 12.3 PASSED: ${productName}`);
  });

  test('12.4 — Create product without benefit', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.4: Create product with Product Benefit toggle disabled (default state).';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');

    await submitProduct(page);
    console.log(`✅ TEST 12.4 PASSED: ${productName}`);
  });

  test('12.5 — Create product with stock quantity 50', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.5: Create product with stock quantity set to 50 units.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '50');

    await submitProduct(page);
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ TEST 12.5 PASSED: ${productName}`);
  });

  test('12.6 — Create product with zero stock', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.6: Create product with stock quantity set to 0 (out of stock).';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');

    await submitProduct(page);
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ TEST 12.6 PASSED: ${productName}`);
  });

  test('12.7 — Create product with percentage discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.7: Create product with Product Discount enabled, type set to Percentage, discount value 15%.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');

    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '15');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);
    await expect(page.getByText(productName, { exact: false }).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ TEST 12.7 PASSED: ${productName}`);
  });

  test('12.8 — Product with benefit + stock + percentage discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.8: Create product with benefit enabled, stock 25 units, and 10% percentage discount.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.8 PASSED: ${productName}`);
  });

  test('12.9 — Product with benefit + stock + fixed discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.9: Create product with benefit enabled, stock 25 units, and fixed discount of 200 Tk.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.9 PASSED: ${productName}`);
  });

  test('12.10 — Product with benefit + stock + no discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.10: Create product with benefit enabled, stock 25 units, and discount disabled.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();
    await setSwitch(page, 'Enable Product Discount?', false);
    await submitProduct(page);
    console.log(`✅ TEST 12.10 PASSED: ${productName}`);
  });

  test('12.11 — Product without benefit + stock + percentage discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.11: Create product without benefit, stock 25 units, and 10% percentage discount.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.11 PASSED: ${productName}`);
  });

  test('12.12 — Product without benefit + stock + fixed discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.12: Create product without benefit, stock 25 units, and fixed discount of 200 Tk.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.12 PASSED: ${productName}`);
  });

  test('12.13 — Product without benefit + stock + no discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.13: Create product without benefit, stock 25 units, and discount disabled.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '25');
    await submitProduct(page);
    console.log(`✅ TEST 12.13 PASSED: ${productName}`);
  });

  test('12.14 — Product with benefit + zero stock + no discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.14: Create product with benefit enabled, zero stock (0), and discount disabled.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();
    await setSwitch(page, 'Enable Product Discount?', false);
    await submitProduct(page);
    console.log(`✅ TEST 12.14 PASSED: ${productName}`);
  });

  test('12.15 — Product with benefit + zero stock + percentage discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.15: Create product with benefit enabled, zero stock, and 10% percentage discount.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.15 PASSED: ${productName}`);
  });

  test('12.16 — Product with benefit + zero stock + fixed discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.16: Create product with benefit enabled, zero stock, and fixed discount of 200 Tk.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.16 PASSED: ${productName}`);
  });

  test('12.17 — Product without benefit + zero stock + percentage discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.17: Create product without benefit, zero stock, and 10% percentage discount.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.17 PASSED: ${productName}`);
  });

  test('12.18 — Product without benefit + zero stock + fixed discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 12.18: Create product without benefit, zero stock, and fixed discount of 200 Tk.';
      
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '3500');
    await page.fill(SEL.buyingPrice, '2800');
    await page.fill(SEL.stockQuantity, '0');
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '200');
    await page.locator(SEL.discountValue).blur();
    await submitProduct(page);
    console.log(`✅ TEST 12.18 PASSED: ${productName}`);
  });
});