import type { Item, Meal, ShoppingEvent, Settings } from '../types';
import { getData, saveData } from './storage';
import { generateId } from '../utils/idGenerator';

/**
 * Get all items from the fridge
 */
export function getItems(): Item[] {
  const data = getData();
  return data.items;
}

/**
 * Add a new item to the fridge
 */
export function addItem(item: Omit<Item, 'id'>): Item {
  const data = getData();
  const newItem: Item = {
    ...item,
    id: generateId(),
  };
  data.items.push(newItem);
  saveData(data);
  return newItem;
}

/**
 * Update an existing item
 */
export function updateItem(itemId: string, updates: Partial<Omit<Item, 'id'>>): Item | null {
  const data = getData();
  const index = data.items.findIndex(item => item.id === itemId);
  if (index === -1) {
    return null;
  }
  data.items[index] = { ...data.items[index], ...updates };
  saveData(data);
  return data.items[index];
}

/**
 * Remove an item from the fridge
 */
export function removeItem(itemId: string): boolean {
  const data = getData();
  const index = data.items.findIndex(item => item.id === itemId);
  if (index === -1) {
    return false;
  }
  data.items.splice(index, 1);
  saveData(data);
  return true;
}

/**
 * Get an item by ID
 */
export function getItem(itemId: string): Item | null {
  const data = getData();
  return data.items.find(item => item.id === itemId) || null;
}

/**
 * Get all meals
 */
export function getMeals(): Meal[] {
  const data = getData();
  return data.meals;
}

/**
 * Get a meal by ID
 */
export function getMeal(mealId: string): Meal | null {
  const data = getData();
  return data.meals.find(meal => meal.id === mealId) || null;
}

/**
 * Add a new meal
 * For planned meals, ingredients are consumed when the meal is created
 */
export function addMeal(meal: Omit<Meal, 'id'>): Meal {
  const data = getData();
  const newMeal: Meal = {
    ...meal,
    id: generateId(),
  };
  data.meals.push(newMeal);
  saveData(data);

  // For planned meals, consume ingredients when meal is created
  if (newMeal.isPlanned) {
    updateFridgeAfterMeal(newMeal.items);
  }

  return newMeal;
}

/**
 * Update an existing meal
 */
export function updateMeal(mealId: string, updates: Partial<Omit<Meal, 'id'>>): Meal | null {
  const data = getData();
  const index = data.meals.findIndex(meal => meal.id === mealId);
  if (index === -1) {
    return null;
  }
  data.meals[index] = { ...data.meals[index], ...updates };
  saveData(data);
  return data.meals[index];
}

/**
 * Get all shopping events
 */
export function getShoppingEvents(): ShoppingEvent[] {
  const data = getData();
  return data.shoppingEvents;
}

/**
 * Get a shopping event by ID
 */
export function getShoppingEvent(eventId: string): ShoppingEvent | null {
  const data = getData();
  return data.shoppingEvents.find(event => event.id === eventId) || null;
}

/**
 * Add a new shopping event
 */
export function addShoppingEvent(event: Omit<ShoppingEvent, 'id'>): ShoppingEvent {
  const data = getData();
  const newEvent: ShoppingEvent = {
    ...event,
    id: generateId(),
  };
  data.shoppingEvents.push(newEvent);
  saveData(data);
  return newEvent;
}

/**
 * Update an existing shopping event
 */
export function updateShoppingEvent(eventId: string, updates: Partial<Omit<ShoppingEvent, 'id'>>): ShoppingEvent | null {
  const data = getData();
  const index = data.shoppingEvents.findIndex(event => event.id === eventId);
  if (index === -1) {
    return null;
  }
  data.shoppingEvents[index] = { ...data.shoppingEvents[index], ...updates };
  saveData(data);
  return data.shoppingEvents[index];
}

/**
 * Delete a shopping event
 */
export function deleteShoppingEvent(eventId: string): boolean {
  const data = getData();
  const index = data.shoppingEvents.findIndex(event => event.id === eventId);
  if (index === -1) {
    return false;
  }
  data.shoppingEvents.splice(index, 1);
  saveData(data);
  return true;
}

/**
 * Get settings
 */
export function getSettings(): Settings {
  const data = getData();
  return data.settings || { currency: 'USD' };
}

/**
 * Update settings
 */
export function updateSettings(updates: Partial<Settings>): Settings {
  const data = getData();
  data.settings = {
    ...data.settings,
    ...updates,
  };
  saveData(data);
  return data.settings;
}

/**
 * Add items from a shopping event to the fridge
 * This creates new items or updates existing ones based on name matching
 */
export function addItemsToFridgeFromShopping(shoppingItems: ShoppingEvent['items']): Item[] {
  const data = getData();
  const addedItems: Item[] = [];

  for (const shoppingItem of shoppingItems) {
    // Items should have finalPrice already calculated (tax rate is applied globally before saving)
    // Fallback to listedPrice if finalPrice is not available (shouldn't happen in normal flow)
    const finalPrice = shoppingItem.finalPrice ?? (shoppingItem.listedPrice ?? 0);

    // Check if item with same name already exists
    const existingItem = data.items.find(item => item.name.toLowerCase() === shoppingItem.name.toLowerCase());

    if (existingItem) {
      // Update existing item: add to percentage left (up to 100%)
      existingItem.percentageLeft = Math.min(100, existingItem.percentageLeft + 100);
      existingItem.cost = finalPrice;
      addedItems.push(existingItem);
    } else {
      // Create new item
      const newItem: Item = {
        id: generateId(),
        name: shoppingItem.name,
        cost: finalPrice,
        percentageLeft: 100,
      };
      data.items.push(newItem);
      addedItems.push(newItem);
    }
  }

  saveData(data);
  return addedItems;
}

/**
 * Update fridge items when a meal is cooked
 * Reduces the percentage left for each item used in the meal
 */
export function updateFridgeAfterMeal(mealItems: Meal['items']): void {
  const data = getData();

  for (const mealItem of mealItems) {
    const fridgeItem = data.items.find(item => item.id === mealItem.itemId);
    if (fridgeItem) {
      fridgeItem.percentageLeft = Math.max(0, fridgeItem.percentageLeft - mealItem.percentageUsed);

      // Remove item if percentage reaches 0
      if (fridgeItem.percentageLeft <= 0) {
        const index = data.items.findIndex(item => item.id === mealItem.itemId);
        if (index !== -1) {
          data.items.splice(index, 1);
        }
      }
    }
  }

  saveData(data);
}

/**
 * Restore used percentages to fridge items
 * Only restores if the item still exists in the fridge (by ID)
 */
export function restoreFridgeAfterMeal(mealItems: Meal['items']): void {
  const data = getData();

  for (const mealItem of mealItems) {
    const fridgeItem = data.items.find(item => item.id === mealItem.itemId);
    if (fridgeItem) {
      // Restore the percentage used back to the item
      fridgeItem.percentageLeft = Math.min(100, fridgeItem.percentageLeft + mealItem.percentageUsed);
    }
    // If item doesn't exist in fridge, do nothing (as per requirements)
  }

  saveData(data);
}

/**
 * Delete a meal and restore used percentages to fridge items
 * Only restores if the item still exists in the fridge (by ID)
 * Restores for both planned and cooked meals since both consume ingredients
 */
export function deleteMeal(mealId: string): boolean {
  const data = getData();
  const mealIndex = data.meals.findIndex(meal => meal.id === mealId);

  if (mealIndex === -1) {
    return false;
  }

  const meal = data.meals[mealIndex];

  // Restore percentages for all meals (both planned and cooked meals consume ingredients)
  restoreFridgeAfterMeal(meal.items);

  // Remove the meal - get fresh data again after restoration
  const updatedData = getData();
  const updatedMealIndex = updatedData.meals.findIndex(meal => meal.id === mealId);
  if (updatedMealIndex !== -1) {
    updatedData.meals.splice(updatedMealIndex, 1);
    saveData(updatedData);
  }
  return true;
}

/**
 * Validate that all meal ingredients are available in the fridge
 * Returns an object with validation result and error messages
 */
export function validateMealIngredients(mealItems: Meal['items']): { valid: boolean; errors: string[] } {
  const data = getData();
  const errors: string[] = [];

  for (const mealItem of mealItems) {
    const fridgeItem = data.items.find(item => item.id === mealItem.itemId);

    if (!fridgeItem) {
      errors.push(`"${mealItem.name}" is no longer in your fridge`);
    } else if (fridgeItem.percentageLeft < mealItem.percentageUsed) {
      errors.push(`Not enough "${mealItem.name}" in fridge (need ${mealItem.percentageUsed}%, have ${fridgeItem.percentageLeft}%)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Mark a planned meal as cooked
 * This marks the meal as no longer planned (ingredients were already consumed when the meal was planned)
 * Returns an object with success status and error messages
 */
export function markMealAsCooked(mealId: string): { success: boolean; errors: string[] } {
  const data = getData();
  const meal = data.meals.find(m => m.id === mealId);

  if (!meal) {
    return { success: false, errors: ['Meal not found'] };
  }

  if (!meal.isPlanned) {
    return { success: false, errors: ['Meal is already cooked'] };
  }

  // No need to validate or consume ingredients - they were already consumed when the meal was planned
  // Just mark the meal as cooked
  const mealIndex = data.meals.findIndex(m => m.id === mealId);
  data.meals[mealIndex] = {
    ...data.meals[mealIndex],
    isPlanned: false,
    date: new Date(), // Update date to when it was actually cooked
  };
  saveData(data);

  return { success: true, errors: [] };
}

/**
 * Rate a meal with 1-5 stars
 * This represents how your body feels about the meal after eating it
 */
export function rateMeal(mealId: string, rating: number): Meal | null {
  if (rating < 1 || rating > 5) {
    return null;
  }

  const data = getData();
  const mealIndex = data.meals.findIndex(meal => meal.id === mealId);

  if (mealIndex === -1) {
    return null;
  }

  data.meals[mealIndex] = {
    ...data.meals[mealIndex],
    rating,
  };

  saveData(data);
  return data.meals[mealIndex];
}

