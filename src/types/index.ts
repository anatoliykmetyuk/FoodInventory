export type MealType = 'unspecified' | 'breakfast' | 'lunch' | 'dinner';

export interface Item {
  id: string;
  name: string;
  cost: number;
  estimatedCalories: number;
  percentageLeft: number;
  expirationDate?: Date;
}

export interface MealItem {
  itemId: string;
  name: string;
  percentageUsed: number;
  cost: number;
  calories: number;
}

export interface Meal {
  id: string;
  name: string;
  date: Date;
  items: MealItem[];
  totalCost: number;
  totalCalories: number;
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
  listedPrice: number;
  finalPrice: number;
  estimatedCalories: number;
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
