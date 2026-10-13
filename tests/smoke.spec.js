import { test, expect } from '@playwright/test';

test('primary Cheerio feature discovery journey persists and resets', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/');

  await page.getByRole('button', { name: 'Discover features', exact: true }).click();
  await page.getByRole('button', { name: /Configure automation/i }).click();
  await page.getByRole('button', { name: /Continue/i }).click();

  const message = page.locator('textarea');
  await message.fill('');
  await expect(page.getByRole('button', { name: /Continue/i })).toBeDisabled();

  await message.fill('Hi {{customer_name}}, your {{cart_items}} are waiting.');
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.getByRole('button', { name: /3 hours/i }).click();
  await page.getByRole('button', { name: /Continue/i }).click();

  await page.getByRole('button', { name: /^Edit$/i }).nth(1).click();
  await expect(message).toHaveValue(/cart_items/);
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.getByRole('button', { name: /Complete setup/i }).click();
  await page.getByRole('button', { name: /Return to dashboard/i }).click();

  await page.reload();
  await page.getByRole('button', { name: /^My Setup/i }).click();
  await expect(page.getByText(/completed/i).first()).toBeVisible();

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: /Reset demo data/i }).click();
  await page.getByRole('button', { name: /Confirm reset/i }).click();
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
});
