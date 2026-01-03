import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getData, saveData, clearData } from './storage';
import type { AppData } from '../types';

// Helper to clear localStorage (jsdom doesn't have clear())
function clearLocalStorage() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => localStorage.removeItem(key));
}

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearLocalStorage();
    vi.clearAllMocks();
  });

  it('should return default data when localStorage is empty', () => {
    const data = getData();
    expect(data.items).toEqual([]);
    expect(data.meals).toEqual([]);
    expect(data.shoppingEvents).toEqual([]);
    expect(data.settings.currency).toBe('USD');
  });

  it('should save and retrieve data', () => {
    const testData: AppData = {
      items: [
        {
          id: '1',
          name: 'Apple',
          cost: 1.50,
          percentageLeft: 100,
        },
      ],
      meals: [],
      shoppingEvents: [],
      settings: { currency: 'EUR' },
    };

    saveData(testData);
    const retrieved = getData();

    expect(retrieved.items).toHaveLength(1);
    expect(retrieved.items[0].name).toBe('Apple');
    expect(retrieved.settings.currency).toBe('EUR');
  });

  it('should convert date strings back to Date objects', () => {
    const testData: AppData = {
      items: [],
      meals: [
        {
          id: '1',
          name: 'Test Meal',
          date: new Date('2024-01-01'),
          items: [],
          totalCost: 10,
          portionsCooked: 2,
          portionsLeft: 1,
          isActive: true,
        },
      ],
      shoppingEvents: [
        {
          id: '1',
          date: new Date('2024-01-01'),
          items: [],
          totalCost: 50,
        },
      ],
      settings: {},
    };

    saveData(testData);
    const retrieved = getData();

    expect(retrieved.meals[0].date).toBeInstanceOf(Date);
    expect(retrieved.shoppingEvents[0].date).toBeInstanceOf(Date);
  });

  it('should clear data', () => {
    const testData: AppData = {
      items: [{ id: '1', name: 'Test', cost: 1, percentageLeft: 100 }],
      meals: [],
      shoppingEvents: [],
      settings: {},
    };

    saveData(testData);
    clearData();
    const data = getData();

    expect(data.items).toEqual([]);
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.setItem to throw an error
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = vi.fn(() => {
      throw new Error('Quota exceeded');
    });

    const testData: AppData = {
      items: [],
      meals: [],
      shoppingEvents: [],
      settings: {},
    };

    expect(() => saveData(testData)).toThrow('Failed to save data to localStorage');

    // Restore original
    window.localStorage.setItem = originalSetItem;
  });
});

