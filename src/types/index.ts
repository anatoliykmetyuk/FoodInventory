export type MealType = 'unspecified' | 'breakfast' | 'lunch' | 'dinner';

export interface Item {
  id: string;
  name: string;
  cost: number;
  percentageLeft: number;
  expirationDate?: Date;
}

export interface MealItem {
  itemId: string;
  name: string;
  percentageUsed: number;
  cost: number;
}

export interface Meal {
  id: string;
  name: string;
  date: Date;
  items: MealItem[];
  totalCost: number;
  portionsCooked: number;
  portionsLeft: number;
  isActive: boolean;
  isPlanned?: boolean;
  rating?: number; // 1-5 stars rating for how your body feels about the meal
  mealType?: MealType;
  savings?: number;
}

export interface ShoppingItem {
  name: string;
  listedPrice?: number; // Used during creation/editing only - NOT stored when saved
  finalPrice?: number; // Used for saved items - this is the cost after tax. When saved, items MUST ONLY have name and finalPrice
}

export interface ShoppingEvent {
  id: string;
  date: Date;
  items: ShoppingItem[];
  totalCost: number;
}

export type FridgeViewMode = 'full' | 'compact';

export interface Settings {
  openaiApiKey?: string;
  currency?: string;
  expirationWarningDays?: number;
  savingsMode?: boolean;
  breakfastCost?: number;
  lunchCost?: number;
  dinnerCost?: number;
  fridgeViewMode?: FridgeViewMode;
}

export interface AppData {
  items: Item[];
  meals: Meal[];
  shoppingEvents: ShoppingEvent[];
  settings: Settings;
}

// Types for OpenAI receipt response
export interface OpenAIReceiptItem {
  Item?: string;
  item?: string;
  name?: string;
  'Listed Price'?: number;
  listedPrice?: number;
  listed_price?: number;
  'Final Price'?: number;
  finalPrice?: number;
  final_price?: number;
}

export interface OpenAIReceiptResponse {
  items?: OpenAIReceiptItem[];
  data?: OpenAIReceiptItem[];
  taxRate?: number;
  tax_rate?: number;
  'Tax Rate'?: number;
  [key: string]: unknown;
}

// Types for Recharts components
export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      averageRating?: number;
      ratingCount?: number;
      meals?: Array<{ name: string; rating: number }>;
      cost?: number;
      cumulativeTotal?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface DotProps {
  cx?: number;
  cy?: number;
  payload?: {
    originalDataPoint?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface BarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: {
    originalDataPoint?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Types for window.navigator extensions
export interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}
