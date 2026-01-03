import OpenAI from 'openai';
import { getOpenAIApiKey } from './settingsService';
import type { OpenAIReceiptResponse } from '../types';

/**
 * Process a receipt image using OpenAI Vision API
 */
export async function processReceiptImage(imageFile: File): Promise<OpenAIReceiptResponse> {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key is not set. Please set it in Settings.');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });

  // Read the prompt from the resources file
  const prompt = `Transcribe me everything that I purchased as a list. Extract the listed price (the price shown in the item table) for each item. Also extract the tax rate for the entire receipt (as a percentage number, e.g., 8.5 for 8.5%). Look at the bottom of the receipt to find the tax rate. And please, the output needs to be in English, alright?

The output must be a JSON object with the following structure:

- "items" - an array of objects, each with:
  - "Item" - the name of the item, in English.
  - "Listed Price" - the price of the item as listed on the receipt (before tax).
- "taxRate" - a single number representing the tax rate for the entire receipt as a percentage (e.g., 8.5 for 8.5%, 0 if no tax).

The output needs to be in JSON format.`;

  try {
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);

    // Validate and normalize the response structure
    return normalizeReceiptResponse(parsed);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key in Settings.');
      } else if (err.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      }
    }
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error('Failed to process receipt image. Please try again.');
  }
}

/**
 * Convert a file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Normalize the receipt response to ensure it has the expected structure
 */
function normalizeReceiptResponse(response: OpenAIReceiptResponse): OpenAIReceiptResponse {
  // Items must be under the 'items' key
  const items = Array.isArray(response.items) ? response.items : [];

  // Extract tax rate from top level
  const taxRateValue = response.taxRate ?? response.tax_rate ?? response['Tax Rate'] ?? 0;
  const taxRate = typeof taxRateValue === 'number' ? taxRateValue : parseFloat(String(taxRateValue || '0'));

  // If no items found, return empty array with tax rate
  if (items.length === 0) {
    return { items: [], taxRate: isNaN(taxRate) ? 0 : taxRate };
  }

  // Normalize each item to ensure it has all required fields (only name and listed price)
  const normalizedItems = items.map((item) => ({
    Item: item.Item || item.item || item.name || '',
    'Listed Price': item['Listed Price'] || item.listedPrice || item.listed_price || 0,
  }));

  return { items: normalizedItems, taxRate: isNaN(taxRate) ? 0 : taxRate };
}

