import { getSettings, updateSettings } from './dataService';
import { getData, clearData } from './storage';

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

