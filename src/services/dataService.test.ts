import { describe, it, expect, beforeEach } from 'vitest';
import {
  getItems,
  addItem,
  updateItem,
  removeItem,
  getItem,
  getMeals,
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
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      expect(item.id).toBeTruthy();
      expect(item.name).toBe('Apple');

      const items = getItems();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Apple');
    });

    it('should update an item', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      const updated = updateItem(item.id, { cost: 2.00 });
      expect(updated?.cost).toBe(2.00);

      const retrieved = getItem(item.id);
      expect(retrieved?.cost).toBe(2.00);
    });

    it('should remove an item', () => {
      const item1 = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      const item2 = addItem({
        name: 'Banana',
        cost: 0.75,
        estimatedCalories: 105,
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
        totalCalories: 500,
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
        totalCalories: 500,
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
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      // Create meal items
      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
          calories: 47.5,
        },
      ];

      // Create a meal using the item
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: mealItems,
        totalCost: 0.75,
        totalCalories: 47.5,
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
        estimatedCalories: 95,
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
            calories: 47.5,
          },
        ],
        totalCost: 0.75,
        totalCalories: 47.5,
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

    it('should not restore percentages when deleting a planned meal', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      // Create a planned meal (ingredients not consumed)
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
            calories: 47.5,
          },
        ],
        totalCost: 0.75,
        totalCalories: 47.5,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Verify item percentage is still 100% (not consumed)
      const itemBeforeDelete = getItem(item.id);
      expect(itemBeforeDelete?.percentageLeft).toBe(100);

      // Delete the planned meal
      const deleted = deleteMeal(meal.id);
      expect(deleted).toBe(true);

      // Verify item percentage is still 100% (no restoration needed)
      const itemAfterDelete = getItem(item.id);
      expect(itemAfterDelete?.percentageLeft).toBe(100);
    });
  });

  describe('validateMealIngredients', () => {
    it('should return valid when all ingredients are available', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
          calories: 47.5,
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
          calories: 47.5,
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
        estimatedCalories: 95,
        percentageLeft: 30,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
          calories: 47.5,
        },
      ];

      const result = validateMealIngredients(mealItems);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Not enough "Apple"');
    });
  });

  describe('markMealAsCooked', () => {
    it('should mark a planned meal as cooked and consume ingredients', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      // Create a planned meal
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
            calories: 47.5,
          },
        ],
        totalCost: 0.75,
        totalCalories: 47.5,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Mark as cooked
      const result = markMealAsCooked(meal.id);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Verify item percentage was reduced
      const itemAfter = getItem(item.id);
      expect(itemAfter?.percentageLeft).toBe(50);

      // Verify meal is no longer planned
      const meals = getMeals();
      const updatedMeal = meals.find(m => m.id === meal.id);
      expect(updatedMeal?.isPlanned).toBe(false);
    });

    it('should fail when ingredient is no longer available', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      // Create a planned meal
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
            calories: 47.5,
          },
        ],
        totalCost: 0.75,
        totalCalories: 47.5,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Remove item from fridge
      removeItem(item.id);

      // Try to mark as cooked
      const result = markMealAsCooked(meal.id);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('"Apple" is no longer in your fridge');

      // Verify meal is still planned
      const meals = getMeals();
      const unchangedMeal = meals.find(m => m.id === meal.id);
      expect(unchangedMeal?.isPlanned).toBe(true);
    });

    it('should fail when not enough ingredient percentage', () => {
      // Create a fridge item
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      // Create a planned meal
      const meal = addMeal({
        name: 'Apple Salad',
        date: new Date('2024-01-01'),
        items: [
          {
            itemId: item.id,
            name: 'Apple',
            percentageUsed: 50,
            cost: 0.75,
            calories: 47.5,
          },
        ],
        totalCost: 0.75,
        totalCalories: 47.5,
        portionsCooked: 1,
        portionsLeft: 1,
        isActive: true,
        isPlanned: true,
      });

      // Reduce item percentage
      updateItem(item.id, { percentageLeft: 30 });

      // Try to mark as cooked
      const result = markMealAsCooked(meal.id);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Not enough "Apple"');

      // Verify item percentage was not changed
      const itemAfter = getItem(item.id);
      expect(itemAfter?.percentageLeft).toBe(30);

      // Verify meal is still planned
      const meals = getMeals();
      const unchangedMeal = meals.find(m => m.id === meal.id);
      expect(unchangedMeal?.isPlanned).toBe(true);
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
        totalCalories: 47.5,
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
    it('should add new items to fridge', () => {
      const shoppingItems: ShoppingItem[] = [
        {
          name: 'Apple',
          listedPrice: 1.00,
          finalPrice: 1.50,
          estimatedCalories: 95,
        },
      ];

      const addedItems = addItemsToFridgeFromShopping(shoppingItems);
      expect(addedItems).toHaveLength(1);
      expect(addedItems[0].name).toBe('Apple');
      expect(addedItems[0].cost).toBe(1.50);
      expect(addedItems[0].percentageLeft).toBe(100);
    });

    it('should update existing items with same name', () => {
      addItem({
        name: 'Apple',
        cost: 1.00,
        estimatedCalories: 90,
        percentageLeft: 50,
      });

      const shoppingItems: ShoppingItem[] = [
        {
          name: 'Apple',
          listedPrice: 1.00,
          finalPrice: 1.50,
          estimatedCalories: 95,
        },
      ];

      const addedItems = addItemsToFridgeFromShopping(shoppingItems);
      expect(addedItems).toHaveLength(1);
      expect(addedItems[0].percentageLeft).toBe(100); // Reset to 100%
      expect(addedItems[0].cost).toBe(1.50);
    });
  });

  describe('updateFridgeAfterMeal', () => {
    it('should reduce percentage left for items used in meal', () => {
      const item = addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 30,
          cost: 0.45,
          calories: 28.5,
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
        estimatedCalories: 95,
        percentageLeft: 50,
      });

      const mealItems = [
        {
          itemId: item.id,
          name: 'Apple',
          percentageUsed: 50,
          cost: 0.75,
          calories: 47.5,
        },
      ];

      updateFridgeAfterMeal(mealItems);

      const updatedItem = getItem(item.id);
      expect(updatedItem).toBeNull();
    });
  });
});

