import { getSettings, updateSettings } from './dataService';
import { getData, clearData, saveData } from './storage';

/**
 * Get OpenAI API key from settings
 */
export function getOpenAIApiKey(): string | undefined {
  const settings = getSettings();
  return settings.openaiApiKey;
}

/**
 * Set OpenAI API key in settings
 */
export function setOpenAIApiKey(apiKey: string): void {
  updateSettings({ openaiApiKey: apiKey });
}

/**
 * Get currency setting
 */
export function getCurrency(): string {
  const settings = getSettings();
  return settings.currency || 'USD';
}

/**
 * Set currency setting
 */
export function setCurrency(currency: string): void {
  updateSettings({ currency });
}

/**
 * Export all data as JSON
 */
export function exportData(): string {
  const data = getData();
  return JSON.stringify(data, null, 2);
}

/**
 * Wipe all data
 */
export function wipeData(): void {
  clearData();
}

/**
 * Import data from JSON object
 */
export function importData(data: any): void {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Ensure required fields exist
  const importedData = {
    items: Array.isArray(data.items) ? data.items : [],
    meals: Array.isArray(data.meals) ? data.meals : [],
    shoppingEvents: Array.isArray(data.shoppingEvents) ? data.shoppingEvents : [],
    settings: data.settings || { currency: 'USD' },
  };

  // Convert date strings to Date objects
  importedData.meals = importedData.meals.map((meal: any) => ({
    ...meal,
    date: meal.date ? new Date(meal.date) : new Date(),
  }));

  importedData.shoppingEvents = importedData.shoppingEvents.map((event: any) => ({
    ...event,
    date: event.date ? new Date(event.date) : new Date(),
  }));

  // Save the imported data
  saveData(importedData);
}

