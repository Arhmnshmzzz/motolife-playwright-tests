import { chromium } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/session.json');

export default async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  await page.goto('https://motolife.rootdevs.xyz/root-lab/admin/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@demo.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Product Management' }).click();
  await page.getByRole('link', { name: 'In-house Products' }).click();
  await page.getByRole('button', { name: 'Add New Product' }).click();

  await page.waitForLoadState('networkidle');
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}