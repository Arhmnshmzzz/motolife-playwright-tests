import { test, expect, Page } from '@playwright/test';
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
  await page.setInputFiles('input[type="file"]', getRandomImage());

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

test.describe('Product E2E Advanced Tests - Variants', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/product-management/in-house-product/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('13.1 — Product with benefit + size guide + 3 variations + stock + % discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 13.1: Create product with benefit enabled, size guide with images and description, 3 variations (Size S/M/L, Gender Male/Female, Color Red/Blue), stock 30 units, and 10% percentage discount.';
    
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '4000');
    await page.fill(SEL.buyingPrice, '3000');
    await page.fill(SEL.stockQuantity, '30');

    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();

    await setSwitch(page, 'Enable Size Guide?', true);
    await page.waitForTimeout(500);
    
    await page.locator('text=Size Guide Images').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.last().setInputFiles(getRandomImage());
    
    await page.getByText('Size Guide Description').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const richTextInputs = page.locator('[contenteditable="true"]');
    await richTextInputs.last().click();
    await page.waitForTimeout(200);
    await page.keyboard.type('Size guide for helmet - S/M/L/XL');

    await page.getByRole('switch', { name: 'Enable Product Variation?' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('combobox', { name: 'Attribute Name (optional)' }).click();
    await page.waitForTimeout(300);
    const attrOptions = await page.locator('[role="option"]').all();
    if (attrOptions.length > 0) await attrOptions[0].click();
    await page.waitForTimeout(500);
    
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(300);
    const valOpts1 = await page.locator('[role="option"]').all();
    if (valOpts1.length > 0) await valOpts1[0].click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(300);
    const valOpts2 = await page.locator('[role="option"]').all();
    if (valOpts2.length > 1) await valOpts2[1].click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(300);
    const valOpts3 = await page.locator('[role="option"]').all();
    if (valOpts3.length > 2) await valOpts3[2].click();
    
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);
    console.log(`✅ TEST 13.1 PASSED: ${productName}`);
  });

  test('13.2 — Product no benefit + no size guide + 1 variation + zero stock + fixed discount', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 13.2: Create product without benefit, without size guide, with 1 variation, zero stock (0), and fixed discount of 150 Tk.';
    
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '2500');
    await page.fill(SEL.buyingPrice, '1800');
    await page.fill(SEL.stockQuantity, '0');

    await setSwitch(page, 'Add Product Benefit?', false);
    await setSwitch(page, 'Enable Size Guide?', false);

    await setSwitch(page, 'Enable Product Variation?', true);
    await page.waitForTimeout(500);
    await page.getByRole('combobox', { name: 'Attribute Name (optional)' }).click();
    await page.waitForTimeout(300);
    const attrOptions = await page.locator('[role="option"]').all();
    if (attrOptions.length > 0) await attrOptions[0].click();
    await page.waitForTimeout(500);
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(300);
    const valOpts = await page.locator('[role="option"]').all();
    if (valOpts.length > 0) await valOpts[0].click();

    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '150');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);
    console.log(`✅ TEST 13.2 PASSED: ${productName}`);
  });

  test('13.3 — Product with youtube + 3 images + 3 variations + all features', async ({ page }) => {
    const productName = getRandomBikeProduct();
    const description = 'Test Case 13.3: Create product with YouTube video link, 3 additional product images, size guide with images and description, 3 variations, benefit enabled, and 10% percentage discount.';
    
    await fillBasicProductDetails(page, productName, description);
    await page.fill(SEL.sellingPrice, '4500');
    await page.fill(SEL.buyingPrice, '3500');
    await page.fill(SEL.stockQuantity, '30');

    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    const benefitOpts = await page.locator('[role="option"]').all();
    if (benefitOpts.length > 0) await benefitOpts[0].click();

    await page.getByRole('textbox', { name: 'Youtube Video Link (optional)' }).fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByRole('textbox', { name: 'Youtube Video Link (optional)' }).blur();
    await page.waitForTimeout(1000);

    await page.getByText('Additional Product Images or Videos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    await page.locator('input[type="file"]').nth(1).setInputFiles(getRandomImage());
    await page.waitForTimeout(500);
    
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
    await page.waitForTimeout(1000);
    await page.locator('input[type="file"]').last().setInputFiles(getRandomImage());
    await page.waitForTimeout(500);
    
    await page.getByRole('button').filter({ hasText: /^$/ }).last().click();
    await page.waitForTimeout(1000);
    await page.locator('input[type="file"]').last().setInputFiles(getRandomImage());
    await page.waitForTimeout(500);

    await setSwitch(page, 'Enable Size Guide?', true);
    await page.waitForTimeout(500);
    await page.locator('text=Size Guide Images').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.locator('input[type="file"]').last().setInputFiles(getRandomImage());
    await page.getByText('Size Guide Description').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const richTextInputs = page.locator('[contenteditable="true"]');
    await richTextInputs.last().click();
    await page.waitForTimeout(200);
    await page.keyboard.type('Size guide for helmet - S/M/L/XL');

    await page.getByRole('switch', { name: 'Enable Product Variation?' }).click();
    await page.waitForTimeout(500);
    
    // Add variation 1: Size with S, M, L values
    await page.getByRole('combobox', { name: 'Attribute Name (optional)' }).click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Size' }).click();
    await page.waitForTimeout(500);
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'S' }).click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]').filter({ hasText: 'M' }).click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'L', exact: true }).click();
    await page.waitForTimeout(800);
    
    // Add variation 2: Gender - click Add Variant button first
    await page.locator('button:has-text("Add Variant")').click();
    await page.waitForTimeout(1500);
    
    // Look for the newly added row with "Attribute Name" label
    // The new row will appear after the first variation row
    await page.locator('text=Attribute Name').nth(1).click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Gender' }).click();
    await page.waitForTimeout(500);
    
    // Select gender values - use last() for the new dropdown
    await page.waitForTimeout(500);
    await page.locator('.css-19bb58m').last().click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Male', exact: true }).click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').last().click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Female', exact: true }).click();
    await page.waitForTimeout(800);

    // Add variation 3: Color
    await page.locator('button:has-text("Add Variant")').click();
    await page.waitForTimeout(1500);
    
    // Look for the third "Attribute Name" label
    await page.locator('text=Attribute Name').nth(2).click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').filter({ hasText: 'Color' }).click();
    await page.waitForTimeout(500);
    
    await page.locator('.css-19bb58m').last().click();
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: 'Black', exact: true }).click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').last().click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: 'Red', exact: true }).click();
    await page.waitForTimeout(500);

    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);
    console.log(`✅ TEST 13.3 PASSED: ${productName}`);
  });
});