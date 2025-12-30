import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all pages', async ({ page }) => {
    await page.goto('/');

    // Test desktop navigation
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.click('text=Fridge');
    await expect(page).toHaveURL('/');

    await page.click('text=Cooking');
    await expect(page).toHaveURL('/cooking');

    await page.click('text=Shopping');
    await expect(page).toHaveURL('/shopping');

    await page.click('text=Statistics');
    await expect(page).toHaveURL('/statistics');

    await page.click('text=Settings');
    await expect(page).toHaveURL('/settings');
  });

  test('should show breadcrumb navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.goto('/cooking');

    // Check if breadcrumb navigation is visible
    const breadcrumb = page.locator('.navigation.mobile .breadcrumb');
    await expect(breadcrumb).toBeVisible();
  });
});

