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

    const searchInput = page.getByPlaceholderText('Search items...');
    await expect(searchInput).toBeVisible();
  });

  test('should filter items when typing in search', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add some items first
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });

    // Add Apple
    await page.fill('input[type="text"]', 'Apple');
    await page.fill('input[type="number"]', '1.50');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Add Banana
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Banana');
    await page.fill('input[type="number"]', '0.75');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Add Milk
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Milk');
    await page.fill('input[type="number"]', '3.00');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Verify all items are visible
    await expect(page.getByText('Apple')).toBeVisible();
    await expect(page.getByText('Banana')).toBeVisible();
    await expect(page.getByText('Milk')).toBeVisible();

    // Search for "Apple"
    const searchInput = page.getByPlaceholderText('Search items...');
    await searchInput.fill('Apple');

    // Only Apple should be visible
    await expect(page.getByText('Apple')).toBeVisible();
    await expect(page.getByText('Banana')).not.toBeVisible();
    await expect(page.getByText('Milk')).not.toBeVisible();
  });

  test('should perform case-insensitive search', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add Milk
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Milk');
    await page.fill('input[type="number"]', '3.00');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Search with lowercase
    const searchInput = page.getByPlaceholderText('Search items...');
    await searchInput.fill('milk');

    // Milk should be visible (case-insensitive)
    await expect(page.getByText('Milk')).toBeVisible();
  });

  test('should show empty state when no items match', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add an item
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Apple');
    await page.fill('input[type="number"]', '1.50');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Search for something that doesn't exist
    const searchInput = page.getByPlaceholderText('Search items...');
    await searchInput.fill('XYZ123');

    // Should show empty state
    await expect(page.getByText('No items found matching your search.')).toBeVisible();
    await expect(page.getByText('Clear Search')).toBeVisible();
  });

  test('should clear search when clicking clear search button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add items
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Apple');
    await page.fill('input[type="number"]', '1.50');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Banana');
    await page.fill('input[type="number"]', '0.75');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Search for something that doesn't exist
    const searchInput = page.getByPlaceholderText('Search items...');
    await searchInput.fill('XYZ123');

    // Click clear search
    await page.click('text=Clear Search');

    // All items should be visible again
    await expect(page.getByText('Apple')).toBeVisible();
    await expect(page.getByText('Banana')).toBeVisible();
  });

  test('should filter items in real-time as user types', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add items
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Banana');
    await page.fill('input[type="number"]', '0.75');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Bread');
    await page.fill('input[type="number"]', '2.50');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Type "B" - should show both Banana and Bread
    const searchInput = page.getByPlaceholderText('Search items...');
    await searchInput.fill('B');
    await expect(page.getByText('Banana')).toBeVisible();
    await expect(page.getByText('Bread')).toBeVisible();

    // Type "Ba" - should show only Banana
    await searchInput.fill('Ba');
    await expect(page.getByText('Banana')).toBeVisible();
    await expect(page.getByText('Bread')).not.toBeVisible();
  });

  test('should work with partial matches', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add Bread
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Bread');
    await page.fill('input[type="number"]', '2.50');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Search for "read" (part of "Bread")
    const searchInput = page.getByPlaceholderText('Search items...');
    await searchInput.fill('read');

    // Bread should be visible
    await expect(page.getByText('Bread')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add an item
    await page.click('text=Add Item');
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.fill('input[type="text"]', 'Apple');
    await page.fill('input[type="number"]', '1.50');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Verify search input is visible and functional on mobile
    const searchInput = page.getByPlaceholderText('Search items...');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Apple');
    await expect(page.getByText('Apple')).toBeVisible();
  });
});


