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
  getShoppingEvents,
  addShoppingEvent,
  getSettings,
  updateSettings,
  addItemsToFridgeFromShopping,
  updateFridgeAfterMeal,
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

