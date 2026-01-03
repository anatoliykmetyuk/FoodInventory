import { test, expect } from '@playwright/test';

test.describe('Meal Picker Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test data
    await page.goto('/');
    await page.evaluate(() => {
      const testMeal1 = {
        id: 'test-meal-1',
        name: 'Test Meal with Long Name to Test Layout',
        date: new Date().toISOString(),
        items: [],
        totalCost: 10.50,
        totalCalories: 500,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      };
      const testMeal2 = {
        id: 'test-meal-2',
        name: 'Another Test Meal',
        date: new Date(Date.now() - 86400000).toISOString(),
        items: [],
        totalCost: 8.75,
        totalCalories: 400,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      };
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{"meals":[],"items":[],"shoppingEvents":[],"settings":{}}');
      data.meals = [testMeal1, testMeal2];
      localStorage.setItem('food-inventory-data', JSON.stringify(data));
    });
  });

  test('should display meal dates horizontally to the right of meal names on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone size
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    // Click Cook Meal button
    await page.click('text=Cook Meal');
    await page.waitForTimeout(300);

    // Click Reuse Previous Meal
    await page.click('text=Reuse Previous Meal');
    await page.waitForTimeout(300);

    // Wait for meal picker to appear
    await page.waitForSelector('.meal-reuse-selector', { timeout: 5000 });

    // Get the first meal option
    const firstMealOption = page.locator('.meal-option').first();
    await expect(firstMealOption).toBeVisible();

    // Check that the meal option uses flexbox row layout
    const flexDirection = await firstMealOption.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });
    expect(flexDirection).toBe('row');

    // Check that meal name and date are in the same row
    const mealName = firstMealOption.locator('.meal-option-name');
    const mealDate = firstMealOption.locator('.meal-option-date');

    await expect(mealName).toBeVisible();
    await expect(mealDate).toBeVisible();

    // Get bounding boxes to verify horizontal layout
    const nameBox = await mealName.boundingBox();
    const dateBox = await mealDate.boundingBox();
    const optionBox = await firstMealOption.boundingBox();

    expect(nameBox).not.toBeNull();
    expect(dateBox).not.toBeNull();
    expect(optionBox).not.toBeNull();

    if (nameBox && dateBox && optionBox) {
      // Date should be to the right of the name (dateBox.left > nameBox.right)
      expect(dateBox.x).toBeGreaterThan(nameBox.x);
      // Both should be within the same vertical space (similar top values)
      // Allow up to 10px difference for font rendering variations
      expect(Math.abs(dateBox.y - nameBox.y)).toBeLessThan(10);
    }
  });

  test('should display meal dates horizontally to the right of meal names on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    // Click Cook Meal button
    await page.click('text=Cook Meal');
    await page.waitForTimeout(300);

    // Click Reuse Previous Meal
    await page.click('text=Reuse Previous Meal');
    await page.waitForTimeout(300);

    // Wait for meal picker to appear
    await page.waitForSelector('.meal-reuse-selector', { timeout: 5000 });

    // Get the first meal option
    const firstMealOption = page.locator('.meal-option').first();
    await expect(firstMealOption).toBeVisible();

    // Check that the meal option uses flexbox row layout
    const flexDirection = await firstMealOption.evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });
    expect(flexDirection).toBe('row');

    // Check that meal name and date are in the same row
    const mealName = firstMealOption.locator('.meal-option-name');
    const mealDate = firstMealOption.locator('.meal-option-date');

    await expect(mealName).toBeVisible();
    await expect(mealDate).toBeVisible();

    // Get bounding boxes to verify horizontal layout
    const nameBox = await mealName.boundingBox();
    const dateBox = await mealDate.boundingBox();

    expect(nameBox).not.toBeNull();
    expect(dateBox).not.toBeNull();

    if (nameBox && dateBox) {
      // Date should be to the right of the name
      expect(dateBox.x).toBeGreaterThan(nameBox.x);
      // Both should be within the same vertical space
      // Allow up to 10px difference for font rendering variations
      expect(Math.abs(dateBox.y - nameBox.y)).toBeLessThan(10);
    }
  });

  test('should prevent date from wrapping on mobile with long meal names', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone size
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    // Click Cook Meal button
    await page.click('text=Cook Meal');
    await page.waitForTimeout(300);

    // Click Reuse Previous Meal
    await page.click('text=Reuse Previous Meal');
    await page.waitForTimeout(300);

    // Wait for meal picker to appear
    await page.waitForSelector('.meal-reuse-selector', { timeout: 5000 });

    // Get the meal option with long name
    const longNameMealOption = page.locator('.meal-option').first();
    const mealDate = longNameMealOption.locator('.meal-option-date');

    // Check that date has white-space: nowrap
    const whiteSpace = await mealDate.evaluate((el) => {
      return window.getComputedStyle(el).whiteSpace;
    });
    expect(whiteSpace).toBe('nowrap');

    // Check that date has flex-shrink: 0
    const flexShrink = await mealDate.evaluate((el) => {
      return window.getComputedStyle(el).flexShrink;
    });
    expect(flexShrink).toBe('0');
  });
});

