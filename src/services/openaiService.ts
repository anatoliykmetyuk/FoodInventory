import OpenAI from 'openai';
import { getOpenAIApiKey } from './settingsService';

/**
 * Process a receipt image using OpenAI Vision API
 */
export async function processReceiptImage(imageFile: File): Promise<any> {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key is not set. Please set it in Settings.');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });

  // Read the prompt from the resources file
  const prompt = `Transcribe me everything that I purchased as a list. Prices-wise, you will include both the price listed in the table as well as the final price - after tax and discounts. You see at the bottom there is tax. So, both prices need to be included. And please, the output needs to be in fucking English, alright?

The following keys must be present for each item:

- Item - the name of the item, in English.
- Listed Price - the price of the item as listed on the receipt.
- Final Price - the price of the item after tax and discounts.
- Estimated Calories - the estimated calories of the item.

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
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key in Settings.');
    } else if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.message) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error('Failed to process receipt image. Please try again.');
    }
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
function normalizeReceiptResponse(response: any): any {
  // The response might have items in different formats
  // Try to extract items array
  let items: any[] = [];

  if (Array.isArray(response.items)) {
    items = response.items;
  } else if (Array.isArray(response)) {
    items = response;
  } else if (response.data && Array.isArray(response.data)) {
    items = response.data;
  } else {
    // Try to find any array in the response
    const keys = Object.keys(response);
    for (const key of keys) {
      if (Array.isArray(response[key])) {
        items = response[key];
        break;
      }
    }
  }

  // If no items found, return empty array
  if (items.length === 0) {
    return { items: [] };
  }

  // Normalize each item to ensure it has all required fields
  const normalizedItems = items.map((item: any) => ({
    Item: item.Item || item.item || item.name || '',
    'Listed Price': item['Listed Price'] || item.listedPrice || item.listed_price || 0,
    'Final Price': item['Final Price'] || item.finalPrice || item.final_price || item['Listed Price'] || item.listedPrice || 0,
    'Estimated Calories': item['Estimated Calories'] || item.estimatedCalories || item.estimated_calories || 0,
  }));

  return { items: normalizedItems };
}

