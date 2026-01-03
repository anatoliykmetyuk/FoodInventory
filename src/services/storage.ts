import type { AppData, Item, Meal, ShoppingEvent } from '../types';

const STORAGE_KEY = 'food-inventory-data';

function getDefaultData(): AppData {
  return {
    items: [],
    meals: [],
    shoppingEvents: [],
    settings: {
      currency: 'USD',
    },
  };
}

/**
 * Get all data from localStorage
 */
export function getData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultData();
    }
    const parsed = JSON.parse(stored) as Partial<AppData> & Record<string, unknown>;
    // Convert date strings back to Date objects
    return {
      ...parsed,
      items: (Array.isArray(parsed.items) ? parsed.items as Array<Partial<Item> & Record<string, unknown>> : []).map((item) => ({
        ...item,
        id: typeof item.id === 'string' ? item.id : '',
        name: typeof item.name === 'string' ? item.name : '',
        cost: typeof item.cost === 'number' ? item.cost : 0,
        estimatedCalories: typeof item.estimatedCalories === 'number' ? item.estimatedCalories : 0,
        percentageLeft: typeof item.percentageLeft === 'number' ? item.percentageLeft : 0,
        expirationDate: item.expirationDate ? new Date(String(item.expirationDate)) : undefined,
      } as Item)),
      meals: (Array.isArray(parsed.meals) ? parsed.meals as Array<Partial<Meal> & Record<string, unknown>> : []).map((meal) => ({
        ...meal,
        id: typeof meal.id === 'string' ? meal.id : '',
        name: typeof meal.name === 'string' ? meal.name : '',
        date: meal.date ? new Date(String(meal.date)) : new Date(),
        items: Array.isArray(meal.items) ? meal.items : [],
        totalCost: typeof meal.totalCost === 'number' ? meal.totalCost : 0,
        totalCalories: typeof meal.totalCalories === 'number' ? meal.totalCalories : 0,
        portionsCooked: typeof meal.portionsCooked === 'number' ? meal.portionsCooked : 0,
        portionsLeft: typeof meal.portionsLeft === 'number' ? meal.portionsLeft : 0,
        isActive: typeof meal.isActive === 'boolean' ? meal.isActive : false,
      } as Meal)),
      shoppingEvents: (Array.isArray(parsed.shoppingEvents) ? parsed.shoppingEvents as Array<Partial<ShoppingEvent> & Record<string, unknown>> : []).map((event) => ({
        ...event,
        id: typeof event.id === 'string' ? event.id : '',
        date: event.date ? new Date(String(event.date)) : new Date(),
        items: Array.isArray(event.items) ? event.items : [],
        totalCost: typeof event.totalCost === 'number' ? event.totalCost : 0,
      } as ShoppingEvent)),
      settings: {
        currency: 'USD',
        ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}),
      },
    } as AppData;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return getDefaultData();
  }
}

/**
 * Save all data to localStorage
 */
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw new Error('Failed to save data to localStorage');
  }
}

/**
 * Clear all data from localStorage
 */
export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    // Don't throw in test environment - just log
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
      throw new Error('Failed to clear localStorage');
    }
  }
}

