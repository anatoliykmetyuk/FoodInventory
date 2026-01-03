import type { ShoppingItem } from '../types';
import type { OpenAIReceiptResponse, OpenAIReceiptItem } from '../types';

export interface ParsedReceiptItem {
  name: string;
  listedPrice: number;
  taxRate: number;
}

/**
 * Parse and validate receipt items from OpenAI response
 */
export function parseReceiptItems(data: OpenAIReceiptResponse): ParsedReceiptItem[] {
  if (!data || !data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid receipt data format');
  }

  return data.items.map((item: OpenAIReceiptItem) => {
    const name = item.Item || item.item || item.name || '';
    const listedPriceValue = item['Listed Price'] ?? item.listedPrice ?? item.listed_price ?? 0;
    const taxRateValue = item['Tax Rate'] ?? item.taxRate ?? item.tax_rate ?? 0;

    const listedPrice = typeof listedPriceValue === 'number' ? listedPriceValue : parseFloat(String(listedPriceValue || '0'));
    const taxRate = typeof taxRateValue === 'number' ? taxRateValue : parseFloat(String(taxRateValue || '0'));

    if (!name.trim()) {
      throw new Error('Item name is required');
    }

    if (isNaN(listedPrice) || listedPrice < 0) {
      throw new Error(`Invalid listed price for item: ${name}`);
    }

    if (isNaN(taxRate) || taxRate < 0) {
      throw new Error(`Invalid tax rate for item: ${name}`);
    }

    return {
      name: name.trim(),
      listedPrice,
      taxRate,
    };
  });
}

/**
 * Extract a single global tax rate from parsed receipt items
 * Uses the first non-zero tax rate, or average if all are non-zero
 */
export function extractGlobalTaxRate(parsedItems: ParsedReceiptItem[]): number {
  if (parsedItems.length === 0) {
    return 0;
  }

  // Find first non-zero tax rate
  const firstNonZero = parsedItems.find(item => item.taxRate > 0);
  if (firstNonZero) {
    return firstNonZero.taxRate;
  }

  // If all are zero, calculate average (will be 0)
  const sum = parsedItems.reduce((acc, item) => acc + item.taxRate, 0);
  return parsedItems.length > 0 ? sum / parsedItems.length : 0;
}

/**
 * Convert parsed receipt items to ShoppingItem format
 */
export function toShoppingItems(parsedItems: ParsedReceiptItem[]): ShoppingItem[] {
  return parsedItems.map(item => ({
    name: item.name,
    listedPrice: item.listedPrice,
  }));
}

