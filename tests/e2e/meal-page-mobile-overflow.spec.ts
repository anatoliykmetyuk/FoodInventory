import { test, expect } from '@playwright/test';

test.describe('Meal Page Mobile Overflow', () => {
  test.beforeEach(async ({ page }) => {
    // Enable savings mode in settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Try to find and enable savings mode
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      const label = await checkbox.evaluate((el) => {
        const parent = el.closest('label') || el.parentElement;
        return parent?.textContent || '';
      });
      if (label.toLowerCase().includes('savings')) {
        await checkbox.check();
        break;
      }
    }

    // Set meal type costs
    const breakfastInput = page.locator('input[id*="breakfast"], input[placeholder*="Breakfast"]').first();
    if (await breakfastInput.count() > 0) {
      await breakfastInput.fill('15');
    }

    const lunchInput = page.locator('input[id*="lunch"], input[placeholder*="Lunch"]').first();
    if (await lunchInput.count() > 0) {
      await lunchInput.fill('20');
    }

    const dinnerInput = page.locator('input[id*="dinner"], input[placeholder*="Dinner"]').first();
    if (await dinnerInput.count() > 0) {
      await dinnerInput.fill('25');
    }
  });

  test('should not overflow horizontally on mobile when Savings field is present', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to cooking page and create a meal with savings
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    // Click "Cook Meal" button (use the header button specifically)
    const cookMealButton = page.locator('.cook-meal-button').first();
    await cookMealButton.click();
    await page.waitForTimeout(500);

    // Click "Cook from Scratch" in the dialog
    const cookFromScratchButton = page.locator('button:has-text("Cook from Scratch")');
    await cookFromScratchButton.click();
    await page.waitForTimeout(500);

    // Fill in meal name
    const mealNameInput = page.locator('input[placeholder*="meal name"], input[type="text"]').first();
    await mealNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await mealNameInput.fill('Test Meal with Savings');
    await page.waitForTimeout(300);

    // Select meal type (to enable savings calculation)
    const mealTypeSelect = page.locator('select[id*="meal-type"], select').filter({ hasText: /breakfast|lunch|dinner/i }).first();
    if (await mealTypeSelect.count() > 0) {
      await mealTypeSelect.selectOption({ index: 1 }); // Select breakfast
    }

    // Add at least one item if possible
    const itemSelect = page.locator('select[id*="item-select"], select').filter({ hasText: /Select an item/i }).first();
    if (await itemSelect.count() > 0 && (await itemSelect.locator('option').count()) > 1) {
      await itemSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }

    // Save the meal
    const saveButton = page.locator('button:has-text("Save Meal")');
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to the meal page
    await page.waitForTimeout(1000);

    // Check if we're on a meal page
    const mealPage = page.locator('.meal-page');
    await expect(mealPage).toBeVisible({ timeout: 5000 });

    // Check for horizontal overflow
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    const html = page.locator('html');
    const htmlBox = await html.boundingBox();

    // The body and html should not be wider than the viewport
    expect(bodyBox?.width).toBeLessThanOrEqual(375);
    expect(htmlBox?.width).toBeLessThanOrEqual(375);

    // Check that meal-summary is visible and not causing overflow
    const mealSummary = page.locator('.meal-summary');
    if (await mealSummary.count() > 0) {
      const summaryBox = await mealSummary.boundingBox();
      expect(summaryBox?.width).toBeLessThanOrEqual(375);

      // Check that Savings field is present and not causing overflow
      const savingsField = mealSummary.locator('.summary-item:has-text("Savings")');
      if (await savingsField.count() > 0) {
        const savingsBox = await savingsField.boundingBox();
        expect(savingsBox?.width).toBeLessThanOrEqual(375);
      }
    }

    // Check meal-totals in editor header
    const mealTotals = page.locator('.meal-totals');
    if (await mealTotals.count() > 0) {
      const totalsBox = await mealTotals.boundingBox();
      expect(totalsBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('should wrap summary items properly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to an existing meal with savings or create one
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    // Try to find an existing meal card and click it
    const mealCard = page.locator('.meal-card').first();
    if (await mealCard.count() > 0) {
      await mealCard.click();
      await page.waitForLoadState('networkidle');

      const mealSummary = page.locator('.meal-summary');
      if (await mealSummary.count() > 0) {
        // Check that summary items are stacked vertically on mobile
        const summaryItems = mealSummary.locator('.summary-item');
        const itemCount = await summaryItems.count();

        if (itemCount > 0) {
          // On mobile, items should stack vertically (each taking full width)
          const firstItem = summaryItems.first();
          const firstItemBox = await firstItem.boundingBox();
          const secondItem = summaryItems.nth(1);

          if (await secondItem.count() > 0) {
            const secondItemBox = await secondItem.boundingBox();
            // Items should be stacked (second item's top should be below first item's bottom)
            expect(secondItemBox?.y).toBeGreaterThanOrEqual((firstItemBox?.y || 0) + (firstItemBox?.height || 0) - 10);
          }
        }
      }
    }
  });
});

