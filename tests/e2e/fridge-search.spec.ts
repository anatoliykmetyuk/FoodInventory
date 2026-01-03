import { test, expect } from '@playwright/test';

test.describe('Fridge Search', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.removeItem('food-inventory-data');
    });
  });

  test('should display search input on fridge page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    const searchInput = page.locator('input[placeholder="Search items..."]');
    await expect(searchInput).toBeVisible();
  });

  test('should filter items when typing in search', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    // Add some items first
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name', { timeout: 10000 });

    // Add Apple
    await page.fill('#item-name', 'Apple');
    await page.fill('#item-cost', '1.50');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Add Banana
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name');
    await page.fill('#item-name', 'Banana');
    await page.fill('#item-cost', '0.75');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Add Milk
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name');
    await page.fill('#item-name', 'Milk');
    await page.fill('#item-cost', '3.00');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Verify all items are visible
    await expect(page.locator('text=Apple')).toBeVisible();
    await expect(page.locator('text=Banana')).toBeVisible();
    await expect(page.locator('text=Milk')).toBeVisible();

    // Search for "Apple"
    const searchInput = page.locator('input[placeholder="Search items..."]');
    await searchInput.fill('Apple');

    // Only Apple should be visible
    await expect(page.locator('text=Apple')).toBeVisible();
    await expect(page.locator('text=Banana')).not.toBeVisible();
    await expect(page.locator('text=Milk')).not.toBeVisible();
  });

  test('should perform case-insensitive search', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    // Add Milk
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name', { timeout: 10000 });
    await page.fill('#item-name', 'Milk');
    await page.fill('#item-cost', '3.00');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Search with lowercase
    const searchInput = page.locator('input[placeholder="Search items..."]');
    await searchInput.fill('milk');

    // Milk should be visible (case-insensitive)
    await expect(page.locator('text=Milk')).toBeVisible();
  });

  test('should show empty state when no items match', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    // Add an item
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name', { timeout: 10000 });
    await page.fill('#item-name', 'Apple');
    await page.fill('#item-cost', '1.50');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Search for something that doesn't exist
    const searchInput = page.locator('input[placeholder="Search items..."]');
    await searchInput.fill('XYZ123');

    // Should show empty state
    await expect(page.locator('text=No items found matching your search.')).toBeVisible();
    await expect(page.locator('text=Clear Search')).toBeVisible();
  });

  test('should clear search when clicking clear search button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    // Add items
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name', { timeout: 10000 });
    await page.fill('#item-name', 'Apple');
    await page.fill('#item-cost', '1.50');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name');
    await page.fill('#item-name', 'Banana');
    await page.fill('#item-cost', '0.75');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Search for something that doesn't exist
    const searchInput = page.locator('input[placeholder="Search items..."]');
    await searchInput.fill('XYZ123');

    // Click clear search
    await page.click('text=Clear Search');

    // All items should be visible again
    await expect(page.locator('text=Apple')).toBeVisible();
    await expect(page.locator('text=Banana')).toBeVisible();
  });

  test('should filter items in real-time as user types', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    // Add items
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name', { timeout: 10000 });
    await page.fill('#item-name', 'Banana');
    await page.fill('#item-cost', '0.75');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name');
    await page.fill('#item-name', 'Bread');
    await page.fill('#item-cost', '2.50');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Type "B" - should show both Banana and Bread
    const searchInput = page.locator('.fridge-search-input');
    await searchInput.fill('B');
    await expect(page.locator('text=Banana')).toBeVisible();
    await expect(page.locator('text=Bread')).toBeVisible();

    // Type "Ba" - should show only Banana
    await searchInput.fill('Ba');
    await expect(page.locator('text=Banana')).toBeVisible();
    await expect(page.locator('text=Bread')).not.toBeVisible();
  });

  test('should work with partial matches', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    // Add Bread
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name', { timeout: 10000 });
    await page.fill('#item-name', 'Bread');
    await page.fill('#item-cost', '2.50');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Search for "read" (part of "Bread")
    const searchInput = page.locator('.fridge-search-input');
    await searchInput.fill('read');

    // Bread should be visible
    await expect(page.locator('text=Bread')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    // Add an item
    await page.click('button.add-item-button');
    await page.waitForSelector('#item-name', { timeout: 10000 });
    await page.fill('#item-name', 'Apple');
    await page.fill('#item-cost', '1.50');
    await page.click('button.save-button:has-text("Add Item")');
    await page.waitForTimeout(500);

    // Verify search input is visible and functional on mobile
    const searchInput = page.locator('.fridge-search-input');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Apple');
    await expect(page.locator('text=Apple')).toBeVisible();
  });

  test('should have proper styling on mobile iOS PWA viewport', async ({ page }) => {
    // Set mobile viewport (iPhone size)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[placeholder="Search items..."]', { timeout: 10000 });

    const searchInput = page.locator('.fridge-search-input');
    const searchContainer = page.locator('.fridge-search-container');

    // Verify search container exists
    await expect(searchContainer).toBeVisible();

    // Verify search input has correct classes
    await expect(searchInput).toHaveClass('fridge-search-input');

    // Verify search input has proper styling on mobile
    const inputStyles = await searchInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        padding: styles.padding,
        minHeight: styles.minHeight,
        borderRadius: styles.borderRadius,
        width: styles.width,
        boxSizing: styles.boxSizing,
      };
    });

    const containerWidth = await searchContainer.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });

    // Verify mobile-specific styling
    expect(inputStyles.fontSize).toBe('16px'); // Prevents zoom on iOS
    expect(parseInt(inputStyles.minHeight)).toBeGreaterThanOrEqual(44); // Better touch target
    // Width should match container width (computed as pixels, not percentage)
    expect(inputStyles.width).toBe(containerWidth);
    expect(inputStyles.boxSizing).toBe('border-box');

    // Verify container styling - container should be visible and have proper margin
    const containerStyles = await searchContainer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        marginBottom: styles.marginBottom,
      };
    });

    // Container should have margin-bottom for spacing
    expect(parseFloat(containerStyles.marginBottom)).toBeGreaterThan(0);
  });
});

