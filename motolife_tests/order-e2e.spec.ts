import { test, expect } from '@playwright/test';

const SEL = {
  fullName: 'input[name="fullName"]',
  phone: 'input[name="phone"]',
  address: 'input[name="address"]',
};

function generateUniquePhone(): string {
  return '01' + Math.floor(Math.random() * 9000000000 + 1000000000).toString().slice(0, 10);
}

function generateUniqueName(): string {
  const names = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Mike Williams', 'Chris Brown', 'David Lee', 'Tom Wilson', 'Steve Martin'];
  return names[Math.floor(Math.random() * names.length)] + Date.now().toString().slice(-4);
}

test.describe('Order E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/product-list');
  });

  test('14.1 — Single product order', async ({ page }) => {
    await page.goto('/product-list');
    await expect(page.getByRole('heading', { name: 'Product List' })).toBeVisible();
    await page.waitForTimeout(1500);

    const productLinks = page.locator('a:has-text("Order now")');
    const count = await productLinks.count();
    const randomIndex = Math.floor(Math.random() * count);
    const selectedLink = productLinks.nth(randomIndex);
    const linkText = await selectedLink.textContent();
    const productName = linkText?.replace('Order now', '').trim() || 'Unknown Product';
    await selectedLink.click();
    
    await expect(page.getByRole('button', { name: 'Product thumbnail' }).first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'ORDER NOW' }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByRole('button', { name: 'Go Back' })).toBeVisible({ timeout: 10000 });

    const uniqueName = generateUniqueName();
    const uniquePhone = generateUniquePhone();

    await page.getByRole('textbox', { name: 'Full Name' }).click();
    await page.getByRole('textbox', { name: 'Full Name' }).fill(uniqueName);
    await page.getByRole('textbox', { name: 'xxxxxxxxx' }).click();
    await page.getByRole('textbox', { name: 'xxxxxxxxx' }).fill(uniquePhone);
    await page.getByRole('textbox', { name: 'Detail full address (house,' }).click();
    await page.getByRole('textbox', { name: 'Detail full address (house,' }).fill('ada ad ad asd ad asd asd');

    await page.getByRole('button', { name: 'Select option' }).first().click();
    await expect(page.getByRole('textbox', { name: 'Search...' })).toBeVisible();

    await page.locator('div').filter({ hasText: 'Barisal' }).nth(3).click();
    await expect(page.getByRole('button', { name: 'Barisal' })).toBeVisible();

await page.getByRole('button', { name: 'Select option' }).first().click();
    await expect(page.getByRole('textbox', { name: 'Search...' }).first()).toBeVisible();

    await page.locator('div').filter({ hasText: 'Barisal' }).nth(3).click();
    await expect(page.getByRole('button', { name: 'Barisal' })).toBeVisible();

    await page.getByRole('button', { name: 'Select option' }).click();
    await expect(page.getByRole('textbox', { name: 'Search...' }).first()).toBeVisible();

    await page.locator('div').filter({ hasText: 'Bakerganj' }).nth(3).click();
    await expect(page.getByRole('button', { name: 'Bakerganj' })).toBeVisible();

    await page.getByRole('button', { name: 'Complete Purchase' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you! Your order has' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();

    console.log(`✅ TEST 14.1 PASSED: ${productName}`);
  });
});