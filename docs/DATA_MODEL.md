# Data & Calculations Model

This document describes the data structures, calculation formulas, and storage schema used in the Food Inventory application.

## Data Structures

### Item

Represents a food item in the fridge.

```typescript
interface Item {
  id: string;                    // Unique identifier
  name: string;                  // Item name
  cost: number;                  // Purchase cost (final price after tax/discounts)
  estimatedCalories: number;     // Estimated calories
  percentageLeft: number;         // Percentage remaining (0-100)
}
```

**Note**: The "listed price" from shopping events is NOT used in Item calculations - only the final price (cost) is stored.

### MealItem

Represents an item used in a meal.

```typescript
interface MealItem {
  itemId: string;                // Reference to Item.id
  name: string;                  // Item name (for display)
  percentageUsed: number;        // Percentage of item used (0-100)
  cost: number;                  // Calculated cost: (percentageUsed / 100) * item.cost
  calories: number;              // Calculated calories: (percentageUsed / 100) * item.estimatedCalories
}
```

### Meal

Represents a cooked meal.

```typescript
type MealType = 'unspecified' | 'breakfast' | 'lunch' | 'dinner';

interface Meal {
  id: string;                    // Unique identifier
  name: string;                  // Meal name
  date: Date;                    // Date meal was cooked
  items: MealItem[];             // Items used in the meal
  totalCost: number;             // Sum of all MealItem.cost
  totalCalories: number;         // Sum of all MealItem.calories
  portionsCooked: number;       // Number of portions cooked
  portionsLeft: number;         // Number of portions remaining
  isActive: boolean;             // true if portionsLeft > 0
  rating?: number;               // 1-5 stars rating for how your body feels about the meal
  mealType?: MealType;           // Type of meal (for savings tracking)
  savings?: number;              // Amount saved compared to eating out
}
```

### ShoppingItem

Represents an item from a shopping event.

```typescript
interface ShoppingItem {
  name: string;                   // Item name
  listedPrice: number;           // Price as listed on receipt
  finalPrice: number;            // Price after tax and discounts
  estimatedCalories: number;     // Estimated calories
}
```

**Note**: Only `finalPrice` is used when adding items to the fridge (becomes Item.cost).

### ShoppingEvent

Represents a shopping trip.

```typescript
interface ShoppingEvent {
  id: string;                    // Unique identifier
  date: Date;                    // Date of shopping event
  items: ShoppingItem[];         // Items purchased
  totalCost: number;             // Sum of all ShoppingItem.finalPrice
}
```

### Settings

Application settings.

```typescript
interface Settings {
  openaiApiKey?: string;         // OpenAI API key (stored locally)
  currency?: string;              // Currency code (default: 'USD')
  expirationWarningDays?: number; // Days before expiration to show warning
  savingsMode?: boolean;          // Enable savings tracking feature
  breakfastCost?: number;         // Normal cost of breakfast for savings calculation
  lunchCost?: number;             // Normal cost of lunch for savings calculation
  dinnerCost?: number;            // Normal cost of dinner for savings calculation
}
```

## Calculation Formulas

### Meal Item Cost

```
itemCost = (percentageUsed / 100) * totalItemCost
```

Where:
- `percentageUsed` is the percentage of the item used (0-100)
- `totalItemCost` is the Item.cost

### Meal Item Calories

```
itemCalories = (percentageUsed / 100) * itemEstimatedCalories
```

### Meal Total Cost

```
mealTotalCost = sum(mealItem.cost for all mealItems)
```

### Meal Total Calories

```
mealTotalCalories = sum(mealItem.calories for all mealItems)
```

### Shopping Event Total Cost

```
shoppingEventTotalCost = sum(shoppingItem.finalPrice for all items)
```

### Meal Savings

When Savings Mode is enabled and a meal type (Breakfast, Lunch, or Dinner) is selected:

```
savings = normalCost - actualCost
```

Where:
- `normalCost` is the user-configured cost for eating out (from Settings)
- `actualCost` is the meal's totalCost

**Note:** Savings are calculated only at the time of creating or editing a meal. They are NOT retroactively updated when the user changes the normal costs in Settings.

## Fridge Updates

### When Adding Items from Shopping

1. For each ShoppingItem:
   - Check if an Item with the same name exists
   - If exists: Update existing item
     - Set `percentageLeft = 100` (reset to full)
     - Update `cost = shoppingItem.finalPrice`
     - Update `estimatedCalories = shoppingItem.estimatedCalories`
   - If not exists: Create new Item
     - `cost = shoppingItem.finalPrice`
     - `percentageLeft = 100`
     - `estimatedCalories = shoppingItem.estimatedCalories`

### When Cooking a Meal

1. For each MealItem in the meal:
   - Find the corresponding Item in the fridge
   - Reduce `percentageLeft` by `percentageUsed`
   - If `percentageLeft <= 0`, remove the Item from the fridge

## Storage Schema

All data is stored in browser localStorage under the key `food-inventory-data`.

### Storage Structure

```json
{
  "items": Item[],
  "meals": Meal[],
  "shoppingEvents": ShoppingEvent[],
  "settings": Settings
}
```

### Date Serialization

Dates are serialized as ISO strings and converted back to Date objects when loaded.

## Currency Display

Currency is a cosmetic setting that only affects the display symbol. All prices are stored as numbers. The currency symbol is applied retroactively to all displayed prices throughout the application.

Supported currencies include: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, MXN, KRW, SGD, HKD, NZD, SEK, NOK, DKK, PLN, RUB, TRY, ZAR.

