import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all pages', async ({ page }) => {
    await page.goto('/');

    // Test desktop navigation
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for navigation to load
    await page.waitForSelector('.nav-desktop', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Navigate to each page
    await page.click('text=Fridge');
    await expect(page).toHaveURL('/');
    await page.waitForLoadState('networkidle');

    await page.click('text=Cooking');
    await expect(page).toHaveURL('/cooking');
    await page.waitForLoadState('networkidle');

    await page.click('text=Shopping');
    await expect(page).toHaveURL('/shopping');
    await page.waitForLoadState('networkidle');

    await page.click('text=Statistics');
    await expect(page).toHaveURL('/statistics');
    await page.waitForLoadState('networkidle');

    await page.click('text=Settings');
    await expect(page).toHaveURL('/settings');
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
    await page.goto('/cooking');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Wait for navigation to load
    await page.waitForSelector('.nav-mobile', { timeout: 10000 });

    // Check if hamburger button is visible
    const hamburgerButton = page.locator('.hamburger-button');
    await expect(hamburgerButton).toBeVisible({ timeout: 5000 });

    // Click hamburger to open menu
    await hamburgerButton.click();

    // Wait for menu animation
    await page.waitForTimeout(300);

    // Check if mobile menu is visible
    const mobileMenu = page.locator('.mobile-menu');
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });

    // Check if menu items are visible (using more specific selectors)
    await expect(page.locator('.mobile-nav-list >> text=Fridge')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mobile-nav-list >> text=Cooking')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mobile-nav-list >> text=Shopping')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mobile-nav-list >> text=Statistics')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.mobile-nav-list >> text=Settings')).toBeVisible({ timeout: 5000 });
  });
});

