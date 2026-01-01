import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOpenAIApiKey,
  setOpenAIApiKey,
  getCurrency,
  setCurrency,
  exportData,
  wipeData,
  getExpirationWarningDays,
  setExpirationWarningDays,
  importData,
} from './settingsService';
import { getData } from './storage';
import { addItem, getItems } from './dataService';

describe('settingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get and set OpenAI API key', () => {
    expect(getOpenAIApiKey()).toBeUndefined();

    setOpenAIApiKey('test-api-key-123');
    expect(getOpenAIApiKey()).toBe('test-api-key-123');
  });

  it('should get default currency', () => {
    expect(getCurrency()).toBe('USD');
  });

  it('should get and set currency', () => {
    setCurrency('EUR');
    expect(getCurrency()).toBe('EUR');

    setCurrency('GBP');
    expect(getCurrency()).toBe('GBP');
  });

  it('should export data as JSON', () => {
    const data = exportData();
    expect(data).toBeTruthy();
    expect(() => JSON.parse(data)).not.toThrow();

    const parsed = JSON.parse(data);
    expect(parsed).toHaveProperty('items');
    expect(parsed).toHaveProperty('meals');
    expect(parsed).toHaveProperty('shoppingEvents');
    expect(parsed).toHaveProperty('settings');
  });

  it('should wipe all data', () => {
    // Clear any existing data first
    localStorage.clear();

    // Add some data first
    addItem({
      name: 'Test Item',
      cost: 10,
      estimatedCalories: 100,
      percentageLeft: 100,
    });

    // Verify data exists
    let data = getData();
    expect(data.items.length).toBeGreaterThanOrEqual(1);

    // Wipe data
    wipeData();

    // Verify data is cleared
    data = getData();
    expect(data.items).toHaveLength(0);
    expect(data.meals).toHaveLength(0);
    expect(data.shoppingEvents).toHaveLength(0);
  });

  it('should get default expiration warning days', () => {
    expect(getExpirationWarningDays()).toBe(7);
  });

  it('should get and set expiration warning days', () => {
    setExpirationWarningDays(14);
    expect(getExpirationWarningDays()).toBe(14);

    setExpirationWarningDays(3);
    expect(getExpirationWarningDays()).toBe(3);
  });

  it('should import data with expiration dates', () => {
    const importedData = {
      items: [
        {
          id: 'item-1',
          name: 'Milk',
          cost: 3.00,
          estimatedCalories: 150,
          percentageLeft: 100,
          expirationDate: '2024-12-31T00:00:00.000Z',
        },
        {
          id: 'item-2',
          name: 'Rice',
          cost: 5.00,
          estimatedCalories: 200,
          percentageLeft: 100,
        },
      ],
      meals: [],
      shoppingEvents: [],
      settings: { currency: 'EUR', expirationWarningDays: 10 },
    };

    importData(importedData);

    const items = getItems();
    expect(items).toHaveLength(2);

    const milkItem = items.find(i => i.name === 'Milk');
    expect(milkItem?.expirationDate).toBeDefined();
    expect(milkItem?.expirationDate instanceof Date).toBe(true);
    expect(new Date(milkItem!.expirationDate!).toISOString().split('T')[0]).toBe('2024-12-31');

    const riceItem = items.find(i => i.name === 'Rice');
    expect(riceItem?.expirationDate).toBeUndefined();

    expect(getExpirationWarningDays()).toBe(10);
  });

  it('should export data with expiration dates', () => {
    addItem({
      name: 'Yogurt',
      cost: 2.00,
      estimatedCalories: 100,
      percentageLeft: 100,
      expirationDate: new Date('2024-06-15'),
    });

    const exported = exportData();
    const parsed = JSON.parse(exported);

    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].expirationDate).toBeDefined();
    // Exported as ISO string
    expect(parsed.items[0].expirationDate).toContain('2024-06-15');
  });
});

