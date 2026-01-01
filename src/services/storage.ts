import type { AppData } from '../types';

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
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return {
      ...parsed,
      items: parsed.items?.map((item: any) => ({
        ...item,
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
      })) || [],
      meals: parsed.meals?.map((meal: any) => ({
        ...meal,
        date: new Date(meal.date),
      })) || [],
      shoppingEvents: parsed.shoppingEvents?.map((event: any) => ({
        ...event,
        date: new Date(event.date),
      })) || [],
      settings: {
        currency: 'USD',
        ...parsed.settings,
      },
    };
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

