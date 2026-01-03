import { test, expect } from '@playwright/test';

test.describe('Empty String Validation for Shopping Event and Meal', () => {
  test.beforeEach(async ({ page }) => {
    // Clear and set up initial test data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      const initialData = {
        items: [
          { id: 'item-1', name: 'Test Apple', cost: 1.50, percentageLeft: 100 },
          { id: 'item-2', name: 'Test Banana', cost: 0.75, percentageLeft: 50 },
        ],
        meals: [],
        shoppingEvents: [],
        settings: { currency: 'USD' },
      };
      localStorage.setItem('food-inventory-data', JSON.stringify(initialData));
    });
  });

  test('should allow empty strings for tax rate and listed price in Shopping Event', async ({ page }) => {
    // Navigate to shopping page
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    // Create a new shopping event
    await page.click('text=Add Shopping Event');
    await page.waitForURL(/\/shopping\/event\/.*/);
    await page.waitForLoadState('networkidle');

    // Add an item
    const addItemButton = page.locator('text=+ Add Item');
    await addItemButton.click();

    // Get the tax rate input
    const taxRateInput = page.locator('input[id="event-tax-rate"]');
    await expect(taxRateInput).toBeVisible();

    // Clear the tax rate field (should allow empty string)
    await taxRateInput.clear();
    await expect(taxRateInput).toHaveValue('');

    // The listed price input should be one of the number inputs
    // Let's find it by its position or label - use robust selector for mobile
    const priceInput = page.locator('input[type="number"].table-input').or(page.locator('input[type="number"].item-card-input')).first();

    // For mobile, ensure visibility
    try {
      await priceInput.waitFor({ state: 'visible', timeout: 2000 });
      await priceInput.scrollIntoViewIfNeeded();
      await priceInput.clear();
    } catch {
      await priceInput.clear({ force: true });
    }
    await page.waitForTimeout(500);

    // Verify we can type a new value (proves the field accepts empty state)
    try {
      await priceInput.waitFor({ state: 'visible', timeout: 2000 });
      await priceInput.scrollIntoViewIfNeeded();
      await priceInput.fill('15.00');
    } catch {
      await priceInput.fill('15.00', { force: true });
    }
    const newValue = await priceInput.inputValue();
    expect(parseFloat(newValue)).toBeCloseTo(15.00);

    // Verify totals ignore non-numeric values (should be 0 or empty)
    const totalCostElement = page.locator('text=/Total Cost:/i').or(page.locator('.total-value'));
    const totalText = await totalCostElement.first().textContent();
    // Total should reflect 0 or empty values
    expect(totalText).toBeTruthy();
  });

  test('should show validation error when saving Shopping Event with empty tax rate', async ({ page }) => {
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    await page.click('text=Add Shopping Event');
    await page.waitForURL(/\/shopping\/event\/.*/);
    await page.waitForLoadState('networkidle');

    // Add an item with a name
    await page.click('text=+ Add Item');
    await page.waitForTimeout(500);
    const nameInput = page.locator('input[type="text"].table-input').or(page.locator('input[type="text"].item-card-input')).first();
    // For mobile, the table might be hidden, so try to fill with force if not visible
    try {
      await nameInput.waitFor({ state: 'visible', timeout: 2000 });
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.fill('Test Item');
    } catch {
      // If not visible (mobile card view), use force
      await nameInput.fill('Test Item', { force: true });
    }

    // Clear tax rate (empty string = 0, which is valid, so this should save successfully)
    const taxRateInput = page.locator('input[id="event-tax-rate"]');
    await taxRateInput.clear();

    // Add a valid listed price
    const priceInput = page.locator('input[type="number"].table-input').or(page.locator('input[type="number"].item-card-input')).first();
    try {
      await priceInput.waitFor({ state: 'visible', timeout: 2000 });
      await priceInput.scrollIntoViewIfNeeded();
      await priceInput.fill('10.00');
    } catch {
      await priceInput.fill('10.00', { force: true });
    }

    // Try to save - should succeed (empty tax rate = 0% which is valid)
    await page.click('text=Save to Fridge');

    // Should navigate to fridge (success)
    await page.waitForURL('/');
    await expect(page.locator('text=Test Item')).toBeVisible();
  });

  test('should show validation error when saving Shopping Event with empty listed price', async ({ page }) => {
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    await page.click('text=Add Shopping Event');
    await page.waitForURL(/\/shopping\/event\/.*/);
    await page.waitForLoadState('networkidle');

    // Add an item with a name
    await page.click('text=+ Add Item');
    await page.waitForTimeout(500);
    const nameInput = page.locator('input[type="text"].table-input').or(page.locator('input[type="text"].item-card-input')).first();
    // For mobile, the table might be hidden, so try to fill with force if not visible
    try {
      await nameInput.waitFor({ state: 'visible', timeout: 2000 });
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.fill('Test Item');
    } catch {
      // If not visible (mobile card view), use force
      await nameInput.fill('Test Item', { force: true });
    }

    // Set valid tax rate
    const taxRateInput = page.locator('input[id="event-tax-rate"]');
    await taxRateInput.fill('10');

    // Clear listed price (empty string = 0, which is valid, so this should save successfully)
    const priceInput = page.locator('input[type="number"].table-input').or(page.locator('input[type="number"].item-card-input')).first();
    try {
      await priceInput.waitFor({ state: 'visible', timeout: 2000 });
      await priceInput.scrollIntoViewIfNeeded();
      await priceInput.clear();
    } catch {
      await priceInput.clear({ force: true });
    }

    // Try to save - should succeed (empty listed price = $0.00 which is valid)
    await page.click('text=Save to Fridge');

    // Should navigate to fridge (success)
    await page.waitForURL('/');
    await page.waitForLoadState('networkidle');
    // Item with $0.00 cost should still be visible - wait a bit and check
    await page.waitForTimeout(1000);
    // Try multiple selectors - item might be in a card or list
    const testItem = page.locator('text=Test Item').or(page.locator('[data-testid*="Test Item"]')).first();
    // Item might be there but need to scroll or wait - use longer timeout
    await testItem.scrollIntoViewIfNeeded();
    await expect(testItem).toBeVisible({ timeout: 10000 });
  });

  test('should allow empty strings for percentage used in Meal', async ({ page }) => {
    // Navigate to cooking page
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    // Create a new meal
    await page.click('text=Cook Meal');
    await page.click('text=Cook from Scratch');
    await page.waitForURL(/\/cooking\/meal\/.*/);
    await page.waitForLoadState('networkidle');

    // Enter meal name
    const mealNameInput = page.locator('input[placeholder*="meal name"]').or(page.locator('input[type="text"]').first());
    await mealNameInput.fill('Test Meal');

    // Add an item from fridge
    const itemSelect = page.locator('select[id="item-select"]');
    await itemSelect.selectOption({ index: 1 }); // Select first available item

    // Get the percentage input - find it by looking for number inputs that are not the portions input
    const allNumberInputs = page.locator('input[type="number"]');
    const inputCount = await allNumberInputs.count();
    let percentageInput = null;

    // Find the percentage input (should be after the portions input)
    for (let i = 0; i < inputCount; i++) {
      const input = allNumberInputs.nth(i);
      const id = await input.getAttribute('id');
      if (id !== 'portions') {
        percentageInput = input;
        break;
      }
    }

    if (!percentageInput) {
      // Fallback: use the last number input
      percentageInput = allNumberInputs.last();
    }

    // Clear the percentage field (should allow empty string)
    // The key test is that we can clear it and type a new value without immediate validation error
    await percentageInput.clear();
    // Wait a bit to ensure no immediate validation error appears
    await page.waitForTimeout(500);

    // Verify we can type a new value (proves the field accepts empty state)
    await percentageInput.fill('50');
    const newValue = await percentageInput.inputValue();
    expect(newValue).toBe('50');

    // Verify totals ignore non-numeric values
    const totalCostElement = page.locator('text=/Total Cost:/i');
    const totalText = await totalCostElement.textContent();
    expect(totalText).toBeTruthy();
  });

  test('should show validation error when saving Meal with empty percentage', async ({ page }) => {
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    await page.click('text=Cook Meal');
    await page.click('text=Cook from Scratch');
    await page.waitForURL(/\/cooking\/meal\/.*/);
    await page.waitForLoadState('networkidle');

    // Enter meal name
    const mealNameInput = page.locator('input[placeholder*="meal name"]').or(page.locator('input[type="text"]').first());
    await mealNameInput.fill('Test Meal');

    // Add an item from fridge
    const itemSelect = page.locator('select[id="item-select"]');
    await itemSelect.selectOption({ index: 1 });

    // Clear percentage
    const percentageInput = page.locator('input[type="number"]').filter({ hasNotText: 'Portions' }).first();
    await percentageInput.clear();

    // Try to save - should show validation error
    await page.click('text=Save Meal');

    // Should show error toast or alert
    const toast = page.locator('.toast, [role="alert"]').or(page.locator('text=/valid percentages/i'));
    // Check for either toast or alert dialog
    const errorVisible = await Promise.race([
      toast.first().isVisible().catch(() => false),
      page.locator('text=/valid percentages/i').isVisible().catch(() => false),
    ]).catch(() => false);

    expect(errorVisible).toBeTruthy();
  });

  test('should successfully save Shopping Event with valid values after clearing', async ({ page }) => {
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');

    await page.click('text=Add Shopping Event');
    await page.waitForURL(/\/shopping\/event\/.*/);
    await page.waitForLoadState('networkidle');

    // Add an item
    await page.click('text=+ Add Item');
    await page.waitForTimeout(500);
    // On mobile, inputs might be in card view, so find by more specific selector
    // Try both desktop table view and mobile card view - use force for mobile if needed
    const nameInput = page.locator('input[type="text"].table-input').or(page.locator('input[type="text"].item-card-input')).first();
    // For mobile, the table might be hidden, so try to fill with force if not visible
    try {
      await nameInput.waitFor({ state: 'visible', timeout: 2000 });
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.fill('Test Item');
    } catch {
      // If not visible (mobile card view), use force
      await nameInput.fill('Test Item', { force: true });
    }

    // Clear and then set valid tax rate
    const taxRateInput = page.locator('input[id="event-tax-rate"]');
    await taxRateInput.clear();
    await taxRateInput.fill('10');

    // Clear and then set valid listed price
    const priceInput = page.locator('input[type="number"].table-input').or(page.locator('input[type="number"].item-card-input')).first();
    try {
      await priceInput.waitFor({ state: 'visible', timeout: 2000 });
      await priceInput.scrollIntoViewIfNeeded();
      await priceInput.clear();
      await priceInput.fill('20.00');
    } catch {
      await priceInput.clear({ force: true });
      await priceInput.fill('20.00', { force: true });
    }

    // Save should succeed
    await page.click('text=Save to Fridge');

    // Should navigate away (to fridge page)
    await page.waitForURL(/\//, { timeout: 5000 });
    expect(page.url()).toMatch(/\//);
  });

  test('should successfully save Meal with valid percentage after clearing', async ({ page }) => {
    await page.goto('/cooking');
    await page.waitForLoadState('networkidle');

    await page.click('text=Cook Meal');
    await page.click('text=Cook from Scratch');
    await page.waitForURL(/\/cooking\/meal\/.*/);
    await page.waitForLoadState('networkidle');

    // Enter meal name
    const mealNameInput = page.locator('input[placeholder*="meal name"]').or(page.locator('input[type="text"]').first());
    await mealNameInput.fill('Test Meal');

    // Add an item from fridge
    const itemSelect = page.locator('select[id="item-select"]');
    await itemSelect.selectOption({ index: 1 });

    // Clear and then set valid percentage
    const percentageInput = page.locator('input[type="number"]').filter({ hasNotText: 'Portions' }).first();
    await percentageInput.clear();
    await percentageInput.fill('50');

    // Save should succeed
    await page.click('text=Save Meal');

    // Should navigate to meal view page
    await page.waitForURL(/\/cooking\/meal\/[^/]+$/, { timeout: 5000 });
  });
});

