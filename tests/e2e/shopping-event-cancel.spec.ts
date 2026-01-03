import { test, expect } from '@playwright/test';

test.describe('Shopping Event Cancel and Save', () => {
  test.beforeEach(async ({ page }) => {
    // Clear and set up initial test data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      const initialData = {
        items: [
          { id: 'item-1', name: 'Existing Apple', cost: 1.50, percentageLeft: 100 },
          { id: 'item-2', name: 'Existing Banana', cost: 0.75, percentageLeft: 100 },
        ],
        meals: [],
        shoppingEvents: [
          {
            id: 'existing-event-1',
            date: new Date().toISOString(),
            items: [{ name: 'Existing Item', listedPrice: 5.00, taxRate: 10 }],
            totalCost: 5.50,
          },
        ],
        settings: { currency: 'USD' },
      };
      localStorage.setItem('food-inventory-data', JSON.stringify(initialData));
    });
  });

  test('should not save items when Cancel is clicked after adding items', async ({ page }) => {
    // Get initial state
    const initialFridgeCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.items?.length || 0;
    });

    const initialShoppingEventsCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.shoppingEvents?.length || 0;
    });

    // Navigate to shopping page
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    // Create a new shopping event
    await page.click('text=Add Shopping Event');
    await page.waitForURL(/\/shopping\/event\/.*/);
    await page.waitForLoadState('networkidle');

    // Verify we're on the shopping event page
    await expect(page.locator('h1:has-text("Shopping Event")')).toBeVisible();

    // Add an item
    await page.click('button:has-text("+ Add Item")');
    await page.waitForTimeout(500);

    // Fill in item details - handle both desktop (table) and mobile (card) views
    const isMobile = await page.locator('.items-card-container').isVisible().catch(() => false);

    let itemNameInput;
    let priceInputs;

    if (isMobile) {
      // Mobile card view
      itemNameInput = page.locator('.item-card').last().locator('input[placeholder="Enter item name"]');
      priceInputs = page.locator('.item-card').last().locator('input[type="number"]');
    } else {
      // Desktop table view
      itemNameInput = page.locator('table tbody tr').last().locator('input[type="text"]').first();
      priceInputs = page.locator('table tbody tr').last().locator('input[type="number"]');
    }

    await itemNameInput.fill('Test Cancel Item');
    await page.waitForTimeout(300);

    await priceInputs.nth(0).fill('10.00');
    await page.waitForTimeout(300);
    await priceInputs.nth(1).fill('8');
    await page.waitForTimeout(500);

    // Verify item is visible in the form by checking the input value
    await expect(itemNameInput).toHaveValue('Test Cancel Item');

    // Click Cancel button
    await page.click('button:has-text("Cancel")');
    await page.waitForURL('/shopping');
    await page.waitForLoadState('networkidle');

    // Verify we're back on shopping page
    await expect(page).toHaveURL('/shopping');

    // Verify Fridge items count did not change
    const finalFridgeCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.items?.length || 0;
    });
    expect(finalFridgeCount).toBe(initialFridgeCount);

    // Verify Shopping Events count did not change (new event was deleted)
    const finalShoppingEventsCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.shoppingEvents?.length || 0;
    });
    expect(finalShoppingEventsCount).toBe(initialShoppingEventsCount);

    // Verify the test item was not added to fridge
    const fridgeItems = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.items?.map((item: { name: string }) => item.name) || [];
    });
    expect(fridgeItems).not.toContain('Test Cancel Item');

    // Navigate to fridge to verify visually
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Test Cancel Item')).not.toBeVisible();
    await expect(page.locator('text=Existing Apple')).toBeVisible();
  });

  test('should save items to both Fridge and Shopping Events when Save is clicked', async ({ page }) => {
    // Get initial state
    const initialFridgeCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.items?.length || 0;
    });

    const initialShoppingEventsCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.shoppingEvents?.length || 0;
    });

    // Navigate to shopping page
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    // Create a new shopping event
    await page.click('text=Add Shopping Event');
    await page.waitForURL(/\/shopping\/event\/.*/);
    await page.waitForLoadState('networkidle');

    // Verify we're on the shopping event page
    await expect(page.locator('h1:has-text("Shopping Event")')).toBeVisible();

    // Add an item
    await page.click('button:has-text("+ Add Item")');
    await page.waitForTimeout(500);

    // Fill in item details - handle both desktop (table) and mobile (card) views
    const isMobile = await page.locator('.items-card-container').isVisible().catch(() => false);

    let itemNameInput;
    let priceInputs;

    if (isMobile) {
      // Mobile card view
      itemNameInput = page.locator('.item-card').last().locator('input[placeholder="Enter item name"]');
      priceInputs = page.locator('.item-card').last().locator('input[type="number"]');
    } else {
      // Desktop table view
      itemNameInput = page.locator('table tbody tr').last().locator('input[type="text"]').first();
      priceInputs = page.locator('table tbody tr').last().locator('input[type="number"]');
    }

    await itemNameInput.fill('Test Save Item');
    await page.waitForTimeout(300);

    await priceInputs.nth(0).fill('15.00');
    await page.waitForTimeout(300);
    await priceInputs.nth(1).fill('10');
    await page.waitForTimeout(500);

    // Verify item is visible in the form by checking the input value
    await expect(itemNameInput).toHaveValue('Test Save Item');

    // Click Save button
    await page.click('button:has-text("Save to Fridge")');
    await page.waitForURL('/');
    await page.waitForLoadState('networkidle');

    // Verify we're on the fridge page
    await expect(page).toHaveURL('/');

    // Verify Fridge items count increased
    const finalFridgeCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.items?.length || 0;
    });
    expect(finalFridgeCount).toBe(initialFridgeCount + 1);

    // Verify Shopping Events count increased
    const finalShoppingEventsCount = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.shoppingEvents?.length || 0;
    });
    expect(finalShoppingEventsCount).toBe(initialShoppingEventsCount + 1);

    // Verify the test item was added to fridge
    const fridgeItems = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.items?.map((item: { name: string }) => item.name) || [];
    });
    expect(fridgeItems).toContain('Test Save Item');

    // Verify the item is visible on the fridge page
    await expect(page.locator('text=Test Save Item')).toBeVisible();

    // Navigate back to shopping to verify the event was saved
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    // Verify the shopping event appears in the list with the correct total
    // The total should be 15.00 * 1.10 = 16.50
    await expect(page.locator('text=/\\$16\\.50/')).toBeVisible();

    // Verify the shopping event has the item saved
    const shoppingEvents = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('food-inventory-data') || '{}');
      return data.shoppingEvents || [];
    });

    const newEvent = shoppingEvents.find((event: { id: string }) =>
      !event.id.startsWith('existing-event')
    );
    expect(newEvent).toBeDefined();
    expect(newEvent.items).toHaveLength(1);
    expect(newEvent.items[0].name).toBe('Test Save Item');
    expect(newEvent.items[0].listedPrice).toBe(15.00);
    expect(newEvent.items[0].taxRate).toBe(10);
    expect(newEvent.totalCost).toBe(16.50);
  });
});
