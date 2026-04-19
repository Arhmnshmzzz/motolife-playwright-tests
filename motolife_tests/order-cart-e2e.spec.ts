import { test, expect } from '@playwright/test';

function generateUniquePhone(): string {
  return '01' + Math.floor(Math.random() * 9000000000 + 1000000000).toString().slice(0, 10);
}

function generateUniqueName(): string {
  const names = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Mike Williams', 'Chris Brown', 'David Lee', 'Tom Wilson', 'Steve Martin'];
  return names[Math.floor(Math.random() * names.length)] + Date.now().toString().slice(-4);
}

async function addProductToCart(page: Playwright.Page) {
  const addToCartButtons = page.locator('button:has-text("Add To Cart")');
  const count = await addToCartButtons.count();
  
  for (let i = 0; i < count; i++) {
    const btn = addToCartButtons.nth(i);
    const isDisabled = await btn.isDisabled();
    
    if (!isDisabled) {
      await page.waitForTimeout(500);
      await btn.click();
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
      
      await page.getByRole('button', { name: 'ADD TO CART' }).click();
      await page.waitForTimeout(1000);
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      return true;
    }
  }
  return false;
}

test.describe('Order via Cart E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/product-list');
  });

test('14.2 — Multiple products order via cart', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Product List' })).toBeVisible();
    await page.waitForTimeout(1500);
    
    let productsAdded = 0;
    while (productsAdded < 4) {
      const added = await addProductToCart(page);
      if (added) {
        productsAdded++;
      }
      await page.goto('/product-list');
      await page.waitForTimeout(1500);
    }
    
    expect(productsAdded).toBeGreaterThan(0);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /^[0-9]+$/ }).first().click();
    await page.waitForTimeout(4000);
    
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(400);
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // for (let i = 0; i < 18; i++) {
    //   await page.keyboard.press('Tab');
    //   await page.waitForTimeout(250);
    // }
    // await page.keyboard.press('Enter');
    // await page.waitForTimeout(4000);
    
    const uniqueName = generateUniqueName();
    const uniquePhone = generateUniquePhone();
    
    await page.getByRole('button', { name: 'PROCEED TO CHECKOUT' }).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'PROCEED TO CHECKOUT' }).click();
    await page.waitForTimeout(3000);

    await page.getByRole('textbox', { name: 'Full Name' }).click();
    await page.getByRole('textbox', { name: 'Full Name' }).fill(uniqueName);
    await page.getByRole('textbox', { name: 'xxxxxxxxx' }).click();
    await page.getByRole('textbox', { name: 'xxxxxxxxx' }).fill(uniquePhone);
    await page.getByRole('textbox', { name: 'Detail full address (house,' }).click();
    await page.getByRole('textbox', { name: 'Detail full address (house,' }).fill('d as dasd asd asd asd ');

    await page.getByRole('button', { name: 'Select option' }).first().click();
    await expect(page.getByRole('textbox', { name: 'Search...' }).first()).toBeVisible();

    await page.locator('div').filter({ hasText: 'Barguna' }).nth(3).click();
    await expect(page.getByRole('button', { name: 'Barguna' })).toBeVisible();

    await page.getByRole('button', { name: 'Select option' }).click();
    await expect(page.getByRole('textbox', { name: 'Search...' }).first()).toBeVisible();

    await page.getByText('Barguna Sadar').click();
    await expect(page.getByRole('button', { name: 'Barguna Sadar' })).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    const completeBtn = page.locator('button:has-text("Complete Purchase"), button:has-text("COMPLETE PURCHASE")').first();
    await completeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await completeBtn.click();
    await expect(page.getByRole('heading', { name: 'Thank you! Your order has' })).toBeVisible();

    console.log(`✅ TEST 14.2 PASSED: Multiple products order via cart`);
  });
});