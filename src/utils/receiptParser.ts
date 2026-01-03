import type { ShoppingItem } from '../types';
import type { OpenAIReceiptResponse, OpenAIReceiptItem } from '../types';

export interface ParsedReceiptItem {
  name: string;
  listedPrice: number;
  finalPrice: number;
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
    const finalPriceValue = item['Final Price'] ?? item.finalPrice ?? item.final_price ?? item['Listed Price'] ?? item.listedPrice ?? 0;

    const listedPrice = typeof listedPriceValue === 'number' ? listedPriceValue : parseFloat(String(listedPriceValue || '0'));
    const finalPrice = typeof finalPriceValue === 'number' ? finalPriceValue : parseFloat(String(finalPriceValue || '0'));

    if (!name.trim()) {
      throw new Error('Item name is required');
    }

    if (isNaN(listedPrice) || listedPrice < 0) {
      throw new Error(`Invalid listed price for item: ${name}`);
    }

    if (isNaN(finalPrice) || finalPrice < 0) {
      throw new Error(`Invalid final price for item: ${name}`);
    }

    return {
      name: name.trim(),
      listedPrice,
      finalPrice,
    };
  });
}

/**
 * Convert parsed receipt items to ShoppingItem format
 */
export function toShoppingItems(parsedItems: ParsedReceiptItem[]): ShoppingItem[] {
  return parsedItems.map(item => ({
    name: item.name,
    listedPrice: item.listedPrice,
    finalPrice: item.finalPrice,
  }));
}

