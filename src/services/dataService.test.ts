import { describe, it, expect, beforeEach } from 'vitest';
import {
  getItems,
  addItem,
  updateItem,
  removeItem,
  getItem,
  getMeals,
  getMeal,
  addMeal,
  updateMeal,
  deleteMeal,
  getShoppingEvents,
  addShoppingEvent,
  getSettings,
  updateSettings,
  addItemsToFridgeFromShopping,
  updateFridgeAfterMeal,
  validateMealIngredients,
  markMealAsCooked,
  rateMeal,
} from './dataService';
import type { ShoppingItem } from '../types';

describe('dataService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Force clear by removing the storage key
    localStorage.removeItem('food-inventory-data');
  });

  describe('Items', () => {
    it('should add and retrieve items', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      expect(item.id).toBeTruthy();
      expect(item.name).toBe('Apple');

      const items = getItems();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Apple');
    });

    it('should add item with expiration date', () => {
      const expirationDate = new Date('2024-12-31');
      const item = addItem({
        name: 'Milk',
        cost: 3.00,
        percentageLeft: 100,
        expirationDate,
      });

      expect(item.expirationDate).toBeDefined();
      expect(new Date(item.expirationDate!).toISOString().split('T')[0]).toBe('2024-12-31');

      const retrieved = getItem(item.id);
      expect(retrieved?.expirationDate).toBeDefined();
    });

    it('should add item without expiration date', () => {
      const item = addItem({
        name: 'Rice',
        cost: 5.00,
        percentageLeft: 100,
      });

      expect(item.expirationDate).toBeUndefined();
    });

    it('should update an item', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      const updated = updateItem(item.id, { cost: 2.00 });
      expect(updated?.cost).toBe(2.00);

      const retrieved = getItem(item.id);
      expect(retrieved?.cost).toBe(2.00);
    });

    it('should update item expiration date', () => {
      const item = addItem({
        name: 'Yogurt',
        cost: 2.00,
        percentageLeft: 100,
      });

      expect(item.expirationDate).toBeUndefined();

      const expirationDate = new Date('2024-06-15');
      const updated = updateItem(item.id, { expirationDate });
      expect(updated?.expirationDate).toBeDefined();
      expect(new Date(updated!.expirationDate!).toISOString().split('T')[0]).toBe('2024-06-15');
    });

    it('should clear item expiration date', () => {
      const expirationDate = new Date('2024-06-15');
      const item = addItem({
        name: 'Cheese',
        cost: 4.00,
        percentageLeft: 100,
        expirationDate,
      });

      expect(item.expirationDate).toBeDefined();

      const updated = updateItem(item.id, { expirationDate: undefined });
      expect(updated?.expirationDate).toBeUndefined();
    });

    it('should remove an item', () => {
      const item1 = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      const item2 = addItem({
        name: 'Banana',
        cost: 0.75,
        percentageLeft: 100,
      });

      // Verify both items exist
      const itemsBefore = getItems();
      expect(itemsBefore.find(i => i.id === item1.id)).toBeTruthy();
      expect(itemsBefore.find(i => i.id === item2.id)).toBeTruthy();

      const removed = removeItem(item1.id);
      expect(removed).toBe(true);

      // Verify item1 is removed and item2 still exists
      const itemsAfter = getItems();
      expect(itemsAfter.find(i => i.id === item1.id)).toBeUndefined();
      expect(itemsAfter.find(i => i.id === item2.id)).toBeTruthy();
      expect(itemsAfter.find(i => i.id === item2.id)?.name).toBe('Banana');
    });

    it('should return null when updating non-existent item', () => {
      const result = updateItem('non-existent', { cost: 10 });
      expect(result).toBeNull();
    });
  });

  describe('Meals', () => {
    it('should add and retrieve meals', () => {
      const meal = addMeal({
        name: 'Pasta',
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 10,
        portionsCooked: 2,
        portionsLeft: 2,
        isActive: true,
      });

      expect(meal.id).toBeTruthy();
      expect(meal.name).toBe('Pasta');

      const meals = getMeals();
      expect(meals).toHaveLength(1);
    });

    it('should update a meal', () => {
      const meal = addMeal({
        name: 'Pasta',
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 10,
        portionsCooked: 2,
        portionsLeft: 2,
        isActive: true,
      });

      const updated = updateMeal(meal.id, { portionsLeft: 1 });
      expect(updated?.portionsLeft).toBe(1);
    });

    it('should delete a meal and restore percentages to fridge items', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      // Create meal items
      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
        },
      ];

      // Create a meal using the item
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: mealItems,
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
      });

      // Update fridge after meal (simulating meal creation)
      updateFridgeAfterMeal(mealItems);

      // Verify meal exists
      expect(getMeals()).toHaveLength(1);

      // Verify item percentage was reduced
      const itemAfterMeal = getItem(item.id);
      expect(itemAfterMeal?.percentageLeft).toBe(50);

      // Delete the meal
      const deleted = deleteMeal(meal.id);
      expect(deleted).toBe(true);

      // Verify meal is deleted
      expect(getMeals()).toHaveLength(0);

      // Verify item percentage was restored
      const itemAfterDelete = getItem(item.id);
      expect(itemAfterDelete?.percentageLeft).toBe(100);
    });

    it('should not restore percentages if item no longer exists in fridge', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      // Create a meal using the item
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
          },
        ],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
      });

      // Remove item from fridge
      removeItem(item.id);
      expect(getItem(item.id)).toBeNull();

      // Delete the meal - should not error even though item doesn't exist
      const deleted = deleteMeal(meal.id);
      expect(deleted).toBe(true);

      // Verify meal is deleted
      expect(getMeals()).toHaveLength(0);

      // Verify item still doesn't exist
      expect(getItem(item.id)).toBeNull();
    });

    it('should return false when deleting non-existent meal', () => {
      const deleted = deleteMeal('non-existent');
      expect(deleted).toBe(false);
    });

    it('should restore percentages when deleting a planned meal', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      // Create a planned meal (ingredients ARE consumed when planned)
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
          },
        ],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Verify item percentage was reduced when meal was created (planned meals consume ingredients)
      const itemBeforeDelete = getItem(item.id);
      expect(itemBeforeDelete?.percentageLeft).toBe(50);

      // Delete the planned meal
      const deleted = deleteMeal(meal.id);
      expect(deleted).toBe(true);

      // Verify item percentage was restored
      const itemAfterDelete = getItem(item.id);
      expect(itemAfterDelete?.percentageLeft).toBe(100);
    });

    it('should subtract ingredients from fridge when creating a planned meal', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Banana',
        cost: 0.75,
        percentageLeft: 100,
      });

      // Verify initial state
      expect(getItem(item.id)?.percentageLeft).toBe(100);

      // Create a planned meal - should consume ingredients
      addMeal({
        name: 'Banana Smoothie',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Banana',
            percentageUsed: 50,
            cost: 0.38,
          },
        ],
        totalCost: 0.38,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Verify item percentage was reduced when planned meal was created
      const itemAfterPlanned = getItem(item.id);
      expect(itemAfterPlanned?.percentageLeft).toBe(50);
    });
  });

  describe('validateMealIngredients', () => {
    it('should return valid when all ingredients are available', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
        },
      ];

      const result = validateMealIngredients(mealItems);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when item is not in fridge', () => {
      const mealItems = [
        {
          itemId: 'non-existent-id',
          name: 'Missing Item',
          percentageUsed: 50,
          cost: 0.75,
        },
      ];

      const result = validateMealIngredients(mealItems);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('"Missing Item" is no longer in your fridge');
    });

    it('should return invalid when not enough percentage available', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 30,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
        },
      ];

      const result = validateMealIngredients(mealItems);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Not enough "Apple"');
    });
  });

  describe('markMealAsCooked', () => {
    it('should mark a planned meal as cooked without affecting fridge (already consumed when planned)', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      // Create a planned meal (ingredients are consumed when meal is created)
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
          },
        ],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Verify item percentage was already reduced when meal was planned
      const itemAfterPlanned = getItem(item.id);
      expect(itemAfterPlanned?.percentageLeft).toBe(50);

      // Mark as cooked - should NOT affect fridge (already consumed)
      const result = markMealAsCooked(meal.id);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Verify item percentage did NOT change (still 50%)
      const itemAfterCooked = getItem(item.id);
      expect(itemAfterCooked?.percentageLeft).toBe(50);

      // Verify meal is no longer planned
      const meals = getMeals();
      const updatedMeal = meals.find(m => m.id === meal.id);
      expect(updatedMeal?.isPlanned).toBe(false);
    });

    it('should succeed when marking planned meal as cooked even if ingredient is no longer available (ingredients already consumed)', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      // Create a planned meal (ingredients are consumed when meal is created)
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
          },
        ],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Verify ingredients were consumed when meal was created
      const itemAfterPlanned = getItem(item.id);
      expect(itemAfterPlanned?.percentageLeft).toBe(50);

      // Remove item from fridge (simulating it was used up)
      removeItem(item.id);

      // Mark as cooked - should succeed because ingredients were already consumed
      const result = markMealAsCooked(meal.id);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Verify meal is no longer planned
      const meals = getMeals();
      const updatedMeal = meals.find(m => m.id === meal.id);
      expect(updatedMeal?.isPlanned).toBe(false);
    });

    it('should succeed when marking planned meal as cooked even if ingredient percentage is low (ingredients already consumed)', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      // Create a planned meal (ingredients are consumed when meal is created)
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
          },
        ],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Verify ingredients were consumed when meal was created
      const itemAfterPlanned = getItem(item.id);
      expect(itemAfterPlanned?.percentageLeft).toBe(50);

      // Reduce item percentage further (simulating other usage)
      updateItem(item.id, { percentageLeft: 30 });

      // Mark as cooked - should succeed because ingredients were already consumed when planned
      const result = markMealAsCooked(meal.id);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Verify item percentage was not changed by marking as cooked
      const itemAfter = getItem(item.id);
      expect(itemAfter?.percentageLeft).toBe(30);

      // Verify meal is no longer planned
      const meals = getMeals();
      const updatedMeal = meals.find(m => m.id === meal.id);
      expect(updatedMeal?.isPlanned).toBe(false);
    });

    it('should fail for non-existent meal', () => {
      const result = markMealAsCooked('non-existent');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Meal not found');
    });

    it('should fail for already cooked meal', () => {
      // Create a non-planned meal
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: false,
      });

      const result = markMealAsCooked(meal.id);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Meal is already cooked');
    });
  });

  describe('rateMeal', () => {
    it('should rate a meal with valid rating', () => {
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      });

      const result = rateMeal(meal.id, 4);
      expect(result).not.toBeNull();
      expect(result?.rating).toBe(4);

      // Verify rating is persisted
      const updatedMeal = getMeal(meal.id);
      expect(updatedMeal?.rating).toBe(4);
    });

    it('should update existing rating', () => {
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
        rating: 3,
      });

      expect(getMeal(meal.id)?.rating).toBe(3);

      const result = rateMeal(meal.id, 5);
      expect(result).not.toBeNull();
      expect(result?.rating).toBe(5);

      // Verify rating is updated
      const updatedMeal = getMeal(meal.id);
      expect(updatedMeal?.rating).toBe(5);
    });

    it('should reject rating below 1', () => {
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      });

      const result = rateMeal(meal.id, 0);
      expect(result).toBeNull();

      // Verify no rating was set
      const updatedMeal = getMeal(meal.id);
      expect(updatedMeal?.rating).toBeUndefined();
    });

    it('should reject rating above 5', () => {
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 0.75,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      });

      const result = rateMeal(meal.id, 6);
      expect(result).toBeNull();

      // Verify no rating was set
      const updatedMeal = getMeal(meal.id);
      expect(updatedMeal?.rating).toBeUndefined();
    });

    it('should return null for non-existent meal', () => {
      const result = rateMeal('non-existent-id', 4);
      expect(result).toBeNull();
    });

    it('should accept all valid ratings (1-5)', () => {
      for (let rating = 1; rating <= 5; rating++) {
        const meal = addMeal({
          name: `Test Meal ${rating}`,
          date: new Date('2024-01-01'),
          items: [],
          totalCost: 1,
          portionsCooked: 1,
          portionsLeft: 0,
          isActive: false,
        });

        const result = rateMeal(meal.id, rating);
        expect(result).not.toBeNull();
        expect(result?.rating).toBe(rating);
      }
    });
  });

  describe('Shopping Events', () => {
    it('should add and retrieve shopping events', () => {
      const event = addShoppingEvent({
        date: new Date('2024-01-01'),
        items: [],
        totalCost: 50,
      });

      expect(event.id).toBeTruthy();
      expect(event.totalCost).toBe(50);

      const events = getShoppingEvents();
      expect(events).toHaveLength(1);
    });
  });

  describe('Settings', () => {
    it('should get default settings', () => {
      const settings = getSettings();
      expect(settings.currency).toBe('USD');
    });

    it('should update settings', () => {
      updateSettings({ currency: 'EUR' });
      const settings = getSettings();
      expect(settings.currency).toBe('EUR');
    });
  });

  describe('addItemsToFridgeFromShopping', () => {
    it('should add new items to fridge with finalPrice', () => {
      const shoppingItems: ShoppingItem[] = [
        {
          name: 'Apple',
          finalPrice: 1.085, // Already calculated with tax
        },
      ];

      const addedItems = addItemsToFridgeFromShopping(shoppingItems);
      expect(addedItems).toHaveLength(1);
      expect(addedItems[0].name).toBe('Apple');
      expect(addedItems[0].cost).toBe(1.085);
      expect(addedItems[0].percentageLeft).toBe(100);
    });

    it('should update existing items with same name', () => {
      addItem({
        name: 'Apple',
        cost: 1.00,
        percentageLeft: 50,
      });

      const shoppingItems: ShoppingItem[] = [
        {
          name: 'Apple',
          finalPrice: 1.085, // Already calculated with tax
        },
      ];

      const addedItems = addItemsToFridgeFromShopping(shoppingItems);
      expect(addedItems).toHaveLength(1);
      expect(addedItems[0].percentageLeft).toBe(100); // Reset to 100%
      expect(addedItems[0].cost).toBe(1.085);
    });

    it('should fallback to listedPrice if finalPrice is not available', () => {
      const shoppingItems: ShoppingItem[] = [
        {
          name: 'Apple',
          listedPrice: 1.00,
        },
      ];

      const addedItems = addItemsToFridgeFromShopping(shoppingItems);
      expect(addedItems[0].cost).toBe(1.00);
    });
  });

  describe('updateFridgeAfterMeal', () => {
    it('should reduce percentage left for items used in meal', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 100,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 30,
          cost: 0.45,
        },
      ];

      updateFridgeAfterMeal(mealItems);

      const updatedItem = getItem(item.id);
      expect(updatedItem?.percentageLeft).toBe(70);
    });

    it('should remove item when percentage reaches 0', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        percentageLeft: 50,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
        },
      ];

      updateFridgeAfterMeal(mealItems);

      const updatedItem = getItem(item.id);
      expect(updatedItem).toBeNull();
    });
  });
});

