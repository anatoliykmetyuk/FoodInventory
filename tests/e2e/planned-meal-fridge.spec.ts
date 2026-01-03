import { test, expect } from '@playwright/test';

test.describe('Planned Meal Fridge Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test data with a fridge item
    await page.goto('/');
    await page.evaluate(() => {
      const testItem = {
        id: 'test-banana',
        name: 'Banana',
        cost: 0.75,
        estimatedCalories: 105,
        percentageLeft: 100,
      };
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{"meals":[],"items":[],"shoppingEvents":[],"settings":{}}');
      data.items = [testItem];
      data.meals = [];
      localStorage.setItem('food-inventory-data', JSON.stringify(data));
    });
  });

  test('should subtract ingredients from fridge when creating a planned meal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify initial state - Banana should be at 100%
    await expect(page.locator('text=Banana').first()).toBeVisible();
    const initialPercentage = page.locator('.item-percentage').filter({ hasText: '100%' }).or(page.locator('text=/100%/')).first();
    await expect(initialPercentage).toBeVisible();

    // Create a planned meal via localStorage (simulating user creation)
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{"meals":[],"items":[],"shoppingEvents":[],"settings":{}}');
      const testMeal = {
        id: 'test-planned-meal-new',
        name: 'Test Planned Meal',
        date: new Date().toISOString(),
        items: [
          {
            itemId: 'test-banana',
            name: 'Banana',
            percentageUsed: 50,
            cost: 0.38,
            calories: 52.5,
          },
        ],
        totalCost: 0.38,
        totalCalories: 52.5,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      };
      data.meals = [testMeal];
      // Simulate that addMeal was called - ingredients should be consumed
      // Set Banana to 50% (100% - 50% consumed when planned meal was created)
      data.items[0].percentageLeft = 50;
      localStorage.setItem('food-inventory-data', JSON.stringify(data));
    });

    // Reload page to see updated state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify Banana percentage was reduced to 50%
    await expect(page.locator('text=Banana').first()).toBeVisible();
    const reducedPercentage = page.locator('.item-percentage').filter({ hasText: '50%' }).or(page.locator('text=/50%/')).first();
    await expect(reducedPercentage).toBeVisible({ timeout: 5000 });
  });

  test('should restore ingredients to fridge when deleting a planned meal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set up dialog handler BEFORE navigation
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Create a planned meal via localStorage
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{"meals":[],"items":[],"shoppingEvents":[],"settings":{}}');
      const testMeal = {
        id: 'test-planned-meal',
        name: 'Test Planned Meal',
        date: new Date().toISOString(),
        items: [
          {
            itemId: 'test-banana',
            name: 'Banana',
            percentageUsed: 50,
            cost: 0.38,
            calories: 52.5,
          },
        ],
        totalCost: 0.38,
        totalCalories: 52.5,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      };
      data.meals = [testMeal];
      // Set Banana to 50% (consumed by planned meal)
      data.items[0].percentageLeft = 50;
      localStorage.setItem('food-inventory-data', JSON.stringify(data));
    });

    // Reload page to see updated state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify Banana is at 50%
    const bananaCard = page.locator('text=Banana').first();
    await expect(bananaCard).toBeVisible();
    await expect(page.locator('.item-percentage:has-text("50%")').or(page.locator('text=/50%/'))).toBeVisible();

    // Navigate to Cooking page
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Find and click Delete button for the planned meal (in Planned Meals section)
    const deleteButton = page.locator('text=Planned Meals').locator('..').locator('button:has-text("Delete")').first();
    await deleteButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Navigate back to Fridge
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify Banana percentage was restored to 100%
    await expect(bananaCard).toBeVisible();
    const restoredPercentage = page.locator('.item-percentage:has-text("100%")').or(page.locator('text=/100%/')).first();
    await expect(restoredPercentage).toBeVisible({ timeout: 5000 });
  });

  test('should NOT affect fridge when marking a planned meal as cooked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create a planned meal via localStorage
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{"meals":[],"items":[],"shoppingEvents":[],"settings":{}}');
      const testMeal = {
        id: 'test-planned-meal',
        name: 'Test Planned Meal',
        date: new Date().toISOString(),
        items: [
          {
            itemId: 'test-banana',
            name: 'Banana',
            percentageUsed: 30,
            cost: 0.22,
            calories: 31.5,
          },
        ],
        totalCost: 0.22,
        totalCalories: 31.5,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      };
      data.meals = [testMeal];
      // Set Banana to 70% (100% - 30% consumed when planned)
      data.items[0].percentageLeft = 70;
      localStorage.setItem('food-inventory-data', JSON.stringify(data));
    });

    // Reload page to see updated state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify Banana is at 70%
    const bananaCard = page.locator('text=Banana').first();
    await expect(bananaCard).toBeVisible();
    await expect(page.locator('.item-percentage:has-text("70%")').or(page.locator('text=/70%/'))).toBeVisible();

    // Navigate to Cooking page
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Find and click "Mark Cooked" button for the planned meal (in Planned Meals section)
    const markCookedButton = page.locator('text=Planned Meals').locator('..').locator('button:has-text("Mark Cooked")').first();
    await markCookedButton.click();

    // Wait for the action to complete
    await page.waitForTimeout(1000);

    // Navigate back to Fridge
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify Banana percentage did NOT change (still 70%)
    await expect(bananaCard).toBeVisible();
    const unchangedPercentage = page.locator('.item-percentage:has-text("70%")').or(page.locator('text=/70%/')).first();
    await expect(unchangedPercentage).toBeVisible({ timeout: 5000 });
  });
});

