import { getSettings, updateSettings } from './dataService';
import { getData, clearData, saveData } from './storage';
import type { FridgeViewMode, AppData, Item, Meal, ShoppingEvent } from '../types';

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
 * Get expiration warning days setting (default 7 days)
 */
export function getExpirationWarningDays(): number {
  const settings = getSettings();
  return settings.expirationWarningDays ?? 7;
}

/**
 * Set expiration warning days setting
 */
export function setExpirationWarningDays(days: number): void {
  updateSettings({ expirationWarningDays: days });
}

/**
 * Get savings mode setting (default false)
 */
export function getSavingsMode(): boolean {
  const settings = getSettings();
  return settings.savingsMode ?? false;
}

/**
 * Set savings mode setting
 */
export function setSavingsMode(enabled: boolean): void {
  updateSettings({ savingsMode: enabled });
}

/**
 * Get meal type cost setting
 */
export function getMealTypeCost(mealType: 'breakfast' | 'lunch' | 'dinner'): number {
  const settings = getSettings();
  switch (mealType) {
    case 'breakfast':
      return settings.breakfastCost ?? 0;
    case 'lunch':
      return settings.lunchCost ?? 0;
    case 'dinner':
      return settings.dinnerCost ?? 0;
  }
}

/**
 * Set meal type cost setting
 */
export function setMealTypeCost(mealType: 'breakfast' | 'lunch' | 'dinner', cost: number): void {
  switch (mealType) {
    case 'breakfast':
      updateSettings({ breakfastCost: cost });
      break;
    case 'lunch':
      updateSettings({ lunchCost: cost });
      break;
    case 'dinner':
      updateSettings({ dinnerCost: cost });
      break;
  }
}

/**
 * Get fridge view mode setting (default 'full')
 */
export function getFridgeViewMode(): FridgeViewMode {
  const settings = getSettings();
  return settings.fridgeViewMode ?? 'full';
}

/**
 * Set fridge view mode setting
 */
export function setFridgeViewMode(mode: FridgeViewMode): void {
  updateSettings({ fridgeViewMode: mode });
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
 * Accepts data with date strings that will be converted to Date objects
 */
export function importData(data: Partial<Omit<AppData, 'items' | 'meals' | 'shoppingEvents'> & {
  items?: Array<Omit<Item, 'expirationDate'> & { expirationDate?: Date | string }>;
  meals?: Array<Omit<Meal, 'date'> & { date?: Date | string }>;
  shoppingEvents?: Array<Omit<ShoppingEvent, 'date'> & { date?: Date | string }>;
}> & Record<string, unknown>): void {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Ensure required fields exist
  const rawItems = Array.isArray(data.items) ? data.items : [];
  const rawMeals = Array.isArray(data.meals) ? data.meals : [];
  const rawShoppingEvents = Array.isArray(data.shoppingEvents) ? data.shoppingEvents : [];

  // Convert date strings to Date objects
  const importedData: AppData = {
    items: (rawItems as Array<Partial<Item> & Record<string, unknown>>).map((item) => ({
    ...item,
    id: typeof item.id === 'string' ? item.id : '',
    name: typeof item.name === 'string' ? item.name : '',
    cost: typeof item.cost === 'number' ? item.cost : 0,
    estimatedCalories: typeof item.estimatedCalories === 'number' ? item.estimatedCalories : 0,
    percentageLeft: typeof item.percentageLeft === 'number' ? item.percentageLeft : 0,
    expirationDate: item.expirationDate ? (item.expirationDate instanceof Date ? item.expirationDate : new Date(String(item.expirationDate as unknown))) : undefined,
    } as Item)),
    meals: (rawMeals as Array<Partial<Meal> & Record<string, unknown>>).map((meal) => ({
    ...meal,
    id: typeof meal.id === 'string' ? meal.id : '',
    name: typeof meal.name === 'string' ? meal.name : '',
    date: meal.date ? (meal.date instanceof Date ? meal.date : new Date(String(meal.date as unknown))) : new Date(),
    items: Array.isArray(meal.items) ? meal.items : [],
    totalCost: typeof meal.totalCost === 'number' ? meal.totalCost : 0,
    totalCalories: typeof meal.totalCalories === 'number' ? meal.totalCalories : 0,
    portionsCooked: typeof meal.portionsCooked === 'number' ? meal.portionsCooked : 0,
    portionsLeft: typeof meal.portionsLeft === 'number' ? meal.portionsLeft : 0,
    isActive: typeof meal.isActive === 'boolean' ? meal.isActive : false,
    } as Meal)),
    shoppingEvents: (rawShoppingEvents as Array<Partial<ShoppingEvent> & Record<string, unknown>>).map((event) => ({
    ...event,
    id: typeof event.id === 'string' ? event.id : '',
    date: event.date ? new Date(String(event.date)) : new Date(),
    items: Array.isArray(event.items) ? event.items : [],
    totalCost: typeof event.totalCost === 'number' ? event.totalCost : 0,
    } as ShoppingEvent)),
    settings: data.settings || { currency: 'USD' },
  };

  // Save the imported data
  saveData(importedData);
}

