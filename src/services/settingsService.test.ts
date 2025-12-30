import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOpenAIApiKey,
  setOpenAIApiKey,
  getCurrency,
  setCurrency,
  exportData,
  wipeData,
} from './settingsService';
import { getData } from './storage';
import { addItem } from './dataService';

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
});

