import { describe, it, expect } from 'vitest';
import { parseReceiptItems, toShoppingItems, extractGlobalTaxRate } from './receiptParser';
import type { OpenAIReceiptResponse } from '../types';

describe('receiptParser', () => {
  describe('parseReceiptItems', () => {
    it('should parse receipt items without tax rate', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': 1.00,
          },
          {
            Item: 'Banana',
            'Listed Price': 0.75,
          },
        ],
        taxRate: 8.5,
      };

      const result = parseReceiptItems(data);
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

    it('should handle different field name variations', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            item: 'Apple',
            listedPrice: 1.00,
          },
          {
            name: 'Banana',
            listed_price: 0.75,
          },
        ],
        taxRate: 10,
      };

      const result = parseReceiptItems(data);
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

    it('should trim item names', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: '  Apple  ',
            'Listed Price': 1.00,
          },
        ],
        taxRate: 8.5,
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
          },
        ],
        taxRate: 8.5,
      };

      expect(() => parseReceiptItems(data)).toThrow('Item name is required');
    });

    it('should throw error for invalid listed price', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': -1,
          },
        ],
        taxRate: 8.5,
      };

      expect(() => parseReceiptItems(data)).toThrow('Invalid listed price for item: Apple');
    });

    it('should handle string numbers', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': '1.50' as unknown as number,
          },
        ],
        taxRate: 8.5,
      };

      const result = parseReceiptItems(data);
      expect(result[0].listedPrice).toBe(1.50);
    });
  });

  describe('toShoppingItems', () => {
    it('should convert parsed items to ShoppingItem format', () => {
      const parsedItems = [
        {
          name: 'Apple',
          listedPrice: 1.00,
        },
        {
          name: 'Banana',
          listedPrice: 0.75,
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
    it('should extract tax rate from response', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': 1.00,
          },
        ],
        taxRate: 8.5,
      };

      const result = extractGlobalTaxRate(data);
      expect(result).toBe(8.5);
    });

    it('should handle different tax rate field names', () => {
      const data1: OpenAIReceiptResponse = {
        items: [],
        tax_rate: 10,
      };
      expect(extractGlobalTaxRate(data1)).toBe(10);

      const data2: OpenAIReceiptResponse = {
        items: [],
        'Tax Rate': 5,
      };
      expect(extractGlobalTaxRate(data2)).toBe(5);
    });

    it('should return 0 when tax rate is not provided', () => {
      const data: OpenAIReceiptResponse = {
        items: [
          {
            Item: 'Apple',
            'Listed Price': 1.00,
          },
        ],
      };

      const result = extractGlobalTaxRate(data);
      expect(result).toBe(0);
    });

    it('should return 0 when tax rate is zero', () => {
      const data: OpenAIReceiptResponse = {
        items: [],
        taxRate: 0,
      };

      const result = extractGlobalTaxRate(data);
      expect(result).toBe(0);
    });

    it('should handle invalid tax rate values', () => {
      const data: OpenAIReceiptResponse = {
        items: [],
        taxRate: -5,
      };

      const result = extractGlobalTaxRate(data);
      expect(result).toBe(0);
    });
  });
});

