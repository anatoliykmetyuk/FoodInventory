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

export interface Settings {
  openaiApiKey?: string;
  currency?: string;
  expirationWarningDays?: number;
}

export interface AppData {
  items: Item[];
  meals: Meal[];
  shoppingEvents: ShoppingEvent[];
  settings: Settings;
}

