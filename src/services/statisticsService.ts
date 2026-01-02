import type { Meal, ShoppingEvent } from '../types';
import { getMeals, getShoppingEvents } from './dataService';

export type Granularity = 'day' | 'week';
export type StatisticsType = 'meals' | 'shopping' | 'ratings' | 'savings';

export interface StatisticsDataPoint {
  date: string;
  cost: number;
  cumulativeTotal: number;
  items: Array<{
    id: string;
    name: string;
    cost: number;
    type: 'meal' | 'shopping';
  }>;
}

export interface RatingsDataPoint {
  date: string;
  averageRating: number;
  ratingCount: number;
  meals: Array<{
    id: string;
    name: string;
    rating: number;
  }>;
}

/**
 * Aggregate data by day or week
 */
export function aggregateData(
  startDate: Date,
  endDate: Date,
  granularity: Granularity,
  type: StatisticsType
): StatisticsDataPoint[] {
  const dateMap = new Map<string, StatisticsDataPoint>();

  let meals: Meal[] = [];
  let shoppingEvents: ShoppingEvent[] = [];

  if (type === 'meals') {
    // Exclude planned meals - only include cooked/consumed meals
    meals = getMeals().filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= startDate && mealDate <= endDate && !meal.isPlanned;
    });
  }

  if (type === 'shopping') {
    shoppingEvents = getShoppingEvents().filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  if (type === 'savings') {
    // Only include meals that have savings defined and are not planned
    meals = getMeals().filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= startDate && mealDate <= endDate && meal.savings !== undefined && !meal.isPlanned;
    });
  }

  // Process meals (for both 'meals' and 'savings' types)
  meals.forEach(meal => {
    const dateKey = getDateKey(new Date(meal.date), granularity);
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { date: dateKey, cost: 0, cumulativeTotal: 0, items: [] });
    }
    const point = dateMap.get(dateKey)!;
    // For savings type, use savings value; for meals type, use totalCost
    const value = type === 'savings' ? (meal.savings ?? 0) : meal.totalCost;
    point.cost += value;
    point.items.push({
      id: meal.id,
      name: meal.name,
      cost: value,
      type: 'meal',
    });
  });

  // Process shopping events
  shoppingEvents.forEach(event => {
    const dateKey = getDateKey(new Date(event.date), granularity);
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { date: dateKey, cost: 0, cumulativeTotal: 0, items: [] });
    }
    const point = dateMap.get(dateKey)!;
    point.cost += event.totalCost;
    point.items.push({
      id: event.id,
      name: `Shopping Event`,
      cost: event.totalCost,
      type: 'shopping',
    });
  });

  // Convert map to array and sort by date
  const result = Array.from(dateMap.values()).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate cumulative totals
  let runningTotal = 0;
  result.forEach(point => {
    runningTotal += point.cost;
    point.cumulativeTotal = runningTotal;
  });

  return result;
}

/**
 * Get date key for aggregation
 */
function getDateKey(date: Date, granularity: Granularity): string {
  if (granularity === 'day') {
    return date.toISOString().split('T')[0];
  } else {
    // Week: Get Monday of the week
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }
}

/**
 * Aggregate meal ratings by day or week
 */
export function aggregateRatings(
  startDate: Date,
  endDate: Date,
  granularity: Granularity
): RatingsDataPoint[] {
  const dateMap = new Map<string, {
    totalRating: number;
    count: number;
    meals: Array<{ id: string; name: string; rating: number }>;
  }>();

  const meals = getMeals().filter(meal => {
    const mealDate = new Date(meal.date);
    // Only include meals with ratings and not planned
    return meal.rating && meal.rating > 0 && mealDate >= startDate && mealDate <= endDate && !meal.isPlanned;
  });

  // Process meals with ratings
  meals.forEach(meal => {
    const dateKey = getDateKey(new Date(meal.date), granularity);
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { totalRating: 0, count: 0, meals: [] });
    }
    const point = dateMap.get(dateKey)!;
    point.totalRating += meal.rating!;
    point.count += 1;
    point.meals.push({
      id: meal.id,
      name: meal.name,
      rating: meal.rating!,
    });
  });

  // Convert map to array with calculated averages
  const result: RatingsDataPoint[] = Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    averageRating: data.count > 0 ? data.totalRating / data.count : 0,
    ratingCount: data.count,
    meals: data.meals,
  }));

  // Sort by date
  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
}
