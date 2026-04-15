import { test, expect, Page } from '@playwright/test';

const timestamp = Date.now();

const SEL = {
  name: 'role=textbox[name="Name"]',
  submitBtn: 'button[type="submit"]',
};

test.describe('Admin Panel - Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://motolife.rootdevs.xyz/root-lab/admin/product-management/category');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('1.1 — add Category: Helmets', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const allButtons = await page.locator('button').all();
    console.log('Total buttons:', allButtons.length);
    for (const btn of allButtons) {
      console.log('Button:', await btn.textContent());
    }
    
    await page.locator('button').filter({ hasText: 'Add New' }).first().click();
    await page.getByText('Upload Image').click();
    await page.locator('body').setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`Helmets ${timestamp}`);
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.getByPlaceholder('Enter subcategory name').fill('Full Face');
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.locator('input[name="subCategories.1.name"]').fill('Half Face');
    await page.locator(SEL.submitBtn).click();
    await page.waitForTimeout(1000);
  });

  test('1.2 — add Category: Riding Gear', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Category' }).click();
    await page.getByText('Upload Image').click();
    await page.locator('body').setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`Riding Gear ${timestamp}`);
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.getByPlaceholder('Enter subcategory name').fill('Jackets');
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.locator('input[name="subCategories.1.name"]').fill('Gloves');
    await page.locator(SEL.submitBtn).click();
    await page.waitForTimeout(1000);
  });

  test('1.3 — add Category: Bike Accessories', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Category' }).click();
    await page.getByText('Upload Image').click();
    await page.locator('body').setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`Bike Accessories ${timestamp}`);
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.getByPlaceholder('Enter subcategory name').fill('Lights');
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.locator('input[name="subCategories.1.name"]').fill('Mirrors');
    await page.locator(SEL.submitBtn).click();
    await page.waitForTimeout(1000);
  });

  test('1.4 — add Category: Spare Parts', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Category' }).click();
    await page.getByText('Upload Image').click();
    await page.locator('body').setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`Spare Parts ${timestamp}`);
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.getByPlaceholder('Enter subcategory name').fill('Engine Parts');
    await page.getByRole('button', { name: 'Add Subcategory' }).click();
    await page.locator('input[name="subCategories.1.name"]').fill('Brake Parts');
    await page.locator(SEL.submitBtn).click();
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin Panel - Brands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/brand');
    await expect(page.getByRole('row', { name: 'Logo Name Visibility Actions' })).toBeVisible({ timeout: 15000 });
  });

  test('2.1 — add Brand: Honda', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Brand' }).click();
    await expect(page.getByRole('dialog', { name: 'Add New Product Brand' })).toBeVisible();
    await page.getByText('Upload Image').click();
    await page.getByRole('dialog', { name: 'Add New Product Brand' }).setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`Honda ${timestamp}`);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('2.2 — add Brand: MRF', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Brand' }).click();
    await page.getByText('Upload Image').click();
    await page.getByRole('dialog', { name: 'Add New Product Brand' }).setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`MRF ${timestamp}`);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('2.3 — add Brand: Motul', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Brand' }).click();
    await page.getByText('Upload Image').click();
    await page.getByRole('dialog', { name: 'Add New Product Brand' }).setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`Motul ${timestamp}`);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('2.4 — add Brand: SteelBird', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Brand' }).click();
    await page.getByText('Upload Image').click();
    await page.getByRole('dialog', { name: 'Add New Product Brand' }).setInputFiles('carburetor.webp');
    await page.locator(SEL.name).fill(`SteelBird ${timestamp}`);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin Panel - Attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/attribute');
    await expect(page.getByRole('row', { name: 'Name Value Visibility Actions' })).toBeVisible({ timeout: 15000 });
  });

  test('3.1 — add Attribute: Helmet Size', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Attribute' }).click();
    await page.locator(SEL.name).fill(`Helmet Size ${timestamp}`);
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('S');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('M');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('L');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('3.2 — add Attribute: Tyre Size', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Attribute' }).click();
    await page.locator(SEL.name).fill(`Tyre Size ${timestamp}`);
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('100/80-17');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('120/70-17');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('3.3 — add Attribute: Oil Type', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Attribute' }).click();
    await page.locator(SEL.name).fill(`Oil Type ${timestamp}`);
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('Synthetic');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('Mineral');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('3.4 — add Attribute: Gender', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Attribute' }).click();
    await page.locator(SEL.name).fill(`Gender ${timestamp}`);
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('Men');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).fill('Women');
    await page.getByRole('textbox', { name: 'Values (Enter a tag and hit' }).press('Enter');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });
});

test.describe('Admin Panel - Benefits', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/benefit');
    await expect(page.getByRole('row', { name: 'Title Benefits Visibility' })).toBeVisible({ timeout: 15000 });
  });

  test('4.1 — add Benefit: Free Installation', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Benefit' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill(`Free Installation ${timestamp}`);
    await page.getByRole('textbox', { name: 'Heading' }).fill('Free Bike Installation');
    await page.getByRole('textbox', { name: 'Text' }).fill('Get free installation for all accessories purchased');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('4.2 — add Benefit: Warranty', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Benefit' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill(`Warranty ${timestamp}`);
    await page.getByRole('textbox', { name: 'Heading' }).fill('1 Year Manufacturer Warranty');
    await page.getByRole('textbox', { name: 'Text' }).fill('All spare parts come with 1 year warranty');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('4.3 — add Benefit: Cashback', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Benefit' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill(`Cashback ${timestamp}`);
    await page.getByRole('textbox', { name: 'Heading' }).fill('5% Cashback on Oils');
    await page.getByRole('textbox', { name: 'Text' }).fill('Get 5% cashback on all engine oil purchases');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });

  test('4.4 — add Benefit: Free Helmet Cleaning', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Product Benefit' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill(`Helmet Service ${timestamp}`);
    await page.getByRole('textbox', { name: 'Heading' }).fill('Free Helmet Cleaning');
    await page.getByRole('textbox', { name: 'Text' }).fill('Get free helmet cleaning service with helmet purchase');
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
  });
});