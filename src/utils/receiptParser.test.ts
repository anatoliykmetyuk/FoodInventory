import { describe, it, expect } from 'vitest';
import { parseReceiptItems, toShoppingItems, extractGlobalTaxRate } from './receiptParser';
import type { OpenAIReceiptResponse } from '../types';

describe('receiptParser', () => {
  describe('parseReceiptItems', () => {
    it('should parse receipt items with tax rate', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': 1.00,
            'Tax Rate': 8.5,
          },
          {
            Item: 'Banana',
            'Listed Price': 0.75,
            'Tax Rate': 8.5,
          },
        ],
      };

      const result = parseReceiptItems(data);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Apple',
        listedPrice: 1.00,
        taxRate: 8.5,
      });
      expect(result[1]).toEqual({
        name: 'Banana',
        listedPrice: 0.75,
        taxRate: 8.5,
      });
    });

    it('should handle different field name variations', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            item: 'Apple',
            listedPrice: 1.00,
            taxRate: 10,
          },
          {
            name: 'Banana',
            listed_price: 0.75,
            tax_rate: 5,
          },
        ],
      };

      const result = parseReceiptItems(data);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Apple',
        listedPrice: 1.00,
        taxRate: 10,
      });
      expect(result[1]).toEqual({
        name: 'Banana',
        listedPrice: 0.75,
        taxRate: 5,
      });
    });

    it('should default tax rate to 0 if not provided', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': 1.00,
          },
        ],
      };

      const result = parseReceiptItems(data);
      expect(result[0].taxRate).toBe(0);
    });

    it('should trim item names', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: '  Apple  ',
            'Listed Price': 1.00,
            'Tax Rate': 8.5,
          },
        ],
      };

      const result = parseReceiptItems(data);
      expect(result[0].name).toBe('Apple');
    });

    it('should throw error for invalid receipt data format', () => {
      expect(() => parseReceiptItems({} as OpenAIReceiptResponse)).toThrow('Invalid receipt data format');
      expect(() => parseReceiptItems({ items: null } as unknown as OpenAIReceiptResponse)).toThrow('Invalid receipt data format');
    });

    it('should throw error for missing item name', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            'Listed Price': 1.00,
            'Tax Rate': 8.5,
          },
        ],
      };

      expect(() => parseReceiptItems(data)).toThrow('Item name is required');
    });

    it('should throw error for invalid listed price', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': -1,
            'Tax Rate': 8.5,
          },
        ],
      };

      expect(() => parseReceiptItems(data)).toThrow('Invalid listed price for item: Apple');
    });

    it('should throw error for invalid tax rate', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': 1.00,
            'Tax Rate': -1,
          },
        ],
      };

      expect(() => parseReceiptItems(data)).toThrow('Invalid tax rate for item: Apple');
    });

    it('should handle string numbers', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': '1.50' as unknown as number,
            'Tax Rate': '8.5' as unknown as number,
          },
        ],
      };

      const result = parseReceiptItems(data);
      expect(result[0].listedPrice).toBe(1.50);
      expect(result[0].taxRate).toBe(8.5);
    });
  });

  describe('toShoppingItems', () => {
    it('should convert parsed items to ShoppingItem format (without taxRate)', () => {
      const parsedItems = [
        {
          name: 'Apple',
          listedPrice: 1.00,
          taxRate: 8.5,
        },
        {
          name: 'Banana',
          listedPrice: 0.75,
          taxRate: 5,
        },
      ];

      const result = toShoppingItems(parsedItems);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Apple',
        listedPrice: 1.00,
      });
      expect(result[1]).toEqual({
        name: 'Banana',
        listedPrice: 0.75,
      });
    });
  });

  describe('extractGlobalTaxRate', () => {
    it('should extract first non-zero tax rate', () => {
      const parsedItems = [
        {
          name: 'Apple',
          listedPrice: 1.00,
          taxRate: 8.5,
        },
        {
          name: 'Banana',
          listedPrice: 0.75,
          taxRate: 5,
        },
      ];

      const result = extractGlobalTaxRate(parsedItems);
      expect(result).toBe(8.5);
    });

    it('should return 0 for empty array', () => {
      const result = extractGlobalTaxRate([]);
      expect(result).toBe(0);
    });

    it('should return 0 when all tax rates are zero', () => {
      const parsedItems = [
        {
          name: 'Apple',
          listedPrice: 1.00,
          taxRate: 0,
        },
        {
          name: 'Banana',
          listedPrice: 0.75,
          taxRate: 0,
        },
      ];

      const result = extractGlobalTaxRate(parsedItems);
      expect(result).toBe(0);
    });

    it('should find first non-zero tax rate even if later items have different rates', () => {
      const parsedItems = [
        {
          name: 'Apple',
          listedPrice: 1.00,
          taxRate: 0,
        },
        {
          name: 'Banana',
          listedPrice: 0.75,
          taxRate: 8.5,
        },
        {
          name: 'Orange',
          listedPrice: 1.25,
          taxRate: 10,
        },
      ];

      const result = extractGlobalTaxRate(parsedItems);
      expect(result).toBe(8.5);
    });
  });
});

