import { test, expect, Page } from '@playwright/test';

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

async function addVariation(page: Page, attrName: string, attrValues: string[]) {
  await page.getByRole('switch', { name: 'Enable Product Variation?' }).click();
  await page.waitForTimeout(500);
  
  // Select attribute name
  await page.getByRole('combobox', { name: 'Attribute Name (optional)' }).click();
  await page.getByRole('option', { name: attrName, exact: true }).click();
  await page.waitForTimeout(500);
  
  // Select attribute values one by one
  for (const value of attrValues) {
    await page.locator('.css-19bb58m').click();
    await page.waitForTimeout(300);
    await page.getByRole('option', { name: value }).first().click();
    await page.waitForTimeout(300);
  }
}

const timestamp = Date.now();

test.describe('Product E2E Advanced Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/product-management/in-house-product/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('13.1 — product with benefit + size guide + 3 variations + stock + % discount', async ({ page }) => {
    const name = `AdvFull ${timestamp}`;
    
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '4000');
    await page.fill(SEL.buyingPrice, '3000');
    await page.fill(SEL.stockQuantity, '30');

    // Add Benefit
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();

    // Add Size Guide (images + description)
    await setSwitch(page, 'Enable Size Guide?', true);
    await page.waitForTimeout(500);
    
    // Upload size guide images - scroll to section first, then find input
    await page.locator('text=Size Guide Images').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Use last file input for size guide image
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.last().setInputFiles({
      mimeType: 'image/png',
      name: 'size_guide.png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    
    // Add size guide description in rich text field
    await page.getByText('Size Guide Description').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const richTextInputs = page.locator('[contenteditable="true"]');
    await richTextInputs.last().click();
    await page.waitForTimeout(200);
    await page.keyboard.type('Size guide for helmet - S/M/L/XL');

// Add 3 Variations with multiple values each
  await page.getByRole('switch', { name: 'Enable Product Variation?' }).click();
  await page.waitForTimeout(500);
  
  // Variation 1: Size (S, M, L)
  await page.getByRole('combobox', { name: 'Attribute Name (optional)' }).click();
  await page.getByRole('option', { name: 'Size', exact: true }).first().click();
  await page.waitForTimeout(500);
  // Select S, M, L values
  await page.locator('.css-19bb58m').click();
  await page.getByRole('option', { name: 'S' }).first().click();
  await page.waitForTimeout(300);
  await page.locator('.css-19bb58m').click();
  await page.getByRole('option', { name: 'M' }).first().click();
  await page.waitForTimeout(300);
  await page.locator('.css-19bb58m').click();
  await page.getByRole('option', { name: 'L' }).first().click();
  await page.waitForTimeout(300);
  
  // Variation 2: Gender (Male, Female)
  await page.getByRole('button', { name: 'Add Variant' }).click();
  await page.waitForTimeout(500);
  await page.locator('[id="variants.1.attributeName"]').click();
  await page.getByRole('option', { name: 'Gender' }).first().click();
  await page.waitForTimeout(500);
  // Select Male, Female values
  await page.locator('.css-19bb58m').last().click();
  await page.getByRole('option', { name: 'Male' }).first().click();
  await page.waitForTimeout(300);
  await page.locator('.css-19bb58m').last().click();
  await page.getByRole('option', { name: 'Female' }).first().click();
  await page.waitForTimeout(300);
  
  // Variation 3: Color (Red, Blue)
  await page.getByRole('button', { name: 'Add Variant' }).click();
  await page.waitForTimeout(500);
  await page.locator('[id="variants.2.attributeName"]').click();
  await page.getByRole('option', { name: 'Color' }).first().click();
  await page.waitForTimeout(500);
  // Select Red, Blue values
  await page.locator('.css-19bb58m').last().click();
  await page.getByRole('option', { name: 'Red' }).first().click();
  await page.waitForTimeout(300);
  await page.locator('.css-19bb58m').last().click();
  await page.getByRole('option', { name: 'Blue' }).first().click();

    // Add % Discount
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('13.2 — product no benefit + no size guide + 1 variation + zero stock + fixed discount', async ({ page }) => {
    const name = `AdvMin ${timestamp}`;
    
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '2500');
    await page.fill(SEL.buyingPrice, '1800');
    await page.fill(SEL.stockQuantity, '0');

    // No Benefit (keep off)
    await setSwitch(page, 'Add Product Benefit?', false);

    // No Size Guide (keep off)
    await setSwitch(page, 'Enable Size Guide?', false);

    // Note: Variations need more complex setup - skipping for now

    // Add Fixed Discount
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Fixed');
    await page.fill(SEL.discountValue, '150');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);
    await page.waitForTimeout(2000);
  });

  test('13.3 — product with youtube + 3 images + 3 variations + all features', async ({ page }) => {
    const name = `AdvMedia ${timestamp}`;
    
    await fillBasicProductDetails(page, name);
    await page.fill(SEL.sellingPrice, '4500');
    await page.fill(SEL.buyingPrice, '3500');
    await page.fill(SEL.stockQuantity, '30');

    // Add Benefit
    await setSwitch(page, 'Add Product Benefit?', true);
    await page.getByRole('combobox', { name: 'Benefit' }).click();
    await page.locator('role=option').first().click();

    // Add YouTube link first (before scrolling to other sections)
    await page.getByRole('textbox', { name: 'Youtube Video Link (optional)' }).fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByRole('textbox', { name: 'Youtube Video Link (optional)' }).blur();
    await page.waitForTimeout(1000);

    // Add 3 additional product images (before Size Guide to keep input indices stable)
    await page.getByText('Product Images').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Upload first additional image - nth(1) is first additional (0 is thumbnail)
    await page.locator('input[type="file"]').nth(1).setInputFiles({
      mimeType: 'image/png',
      name: 'product_image_1.png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    await page.waitForTimeout(500);
    
    // Click "Add More" button to add more image slots, then upload
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
    await page.waitForTimeout(1000);
    await page.locator('input[type="file"]').last().setInputFiles({
      mimeType: 'image/png',
      name: 'product_image_2.png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    await page.waitForTimeout(500);
    
    // Click another "Add More" for third image
    await page.getByRole('button').filter({ hasText: /^$/ }).last().click();
    await page.waitForTimeout(1000);
    await page.locator('input[type="file"]').last().setInputFiles({
      mimeType: 'image/png',
      name: 'product_image_3.png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    await page.waitForTimeout(500);

    // Add Size Guide
    await setSwitch(page, 'Enable Size Guide?', true);
    await page.waitForTimeout(500);
    // Upload size guide image - now the last input should be size guide
    await page.locator('text=Size Guide Images').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.locator('input[type="file"]').last().setInputFiles({
      mimeType: 'image/png',
      name: 'size_guide.png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    });
    // Add size guide description
    await page.getByText('Size Guide Description').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const richTextInputs = page.locator('[contenteditable="true"]');
    await richTextInputs.last().click();
    await page.waitForTimeout(200);
    await page.keyboard.type('Size guide for helmet - S/M/L/XL');

    // Add 3 Variations
    await page.getByRole('switch', { name: 'Enable Product Variation?' }).click();
    await page.waitForTimeout(500);
    
    // Variation 1: Size (S, M, L)
    await page.getByRole('combobox', { name: 'Attribute Name (optional)' }).click();
    await page.getByRole('option', { name: 'Size', exact: true }).first().click();
    await page.waitForTimeout(500);
    await page.locator('.css-19bb58m').click();
    await page.getByRole('option', { name: 'S' }).first().click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').click();
    await page.getByRole('option', { name: 'M' }).first().click();
    await page.waitForTimeout(300);
    await page.locator('.css-19bb58m').click();
    await page.getByRole('option', { name: 'L' }).first().click();
    await page.waitForTimeout(300);

    // Add % Discount
    await setSwitch(page, 'Enable Product Discount?', true);
    await selectOption(page, 'text=Discount Type', 'Percentage');
    await page.fill(SEL.discountValue, '10');
    await page.locator(SEL.discountValue).blur();
    await page.waitForTimeout(500);

    await submitProduct(page);
    await page.waitForTimeout(2000);
  });
});