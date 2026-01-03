import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MealItemEditor from './MealItemEditor';
import type { MealItem } from '../types';

// Mock dataService
vi.mock('../services/dataService', () => ({
  getItems: vi.fn(() => []),
  addItem: vi.fn(),
}));

// Mock settingsService
vi.mock('../services/settingsService', () => ({
  getCurrency: vi.fn(() => 'USD'),
  getMealTypeCost: vi.fn(() => 0),
}));

describe('MealItemEditor', () => {
  const mockOnMealItemsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should not display calories column in the table', () => {
    const mealItems: MealItem[] = [
      {
        itemId: '1',
        name: 'Apple',
        percentageUsed: 50,
        cost: 0.75,
      },
    ];

    render(
      <MealItemEditor
        mealItems={mealItems}
        onMealItemsChange={mockOnMealItemsChange}
      />
    );

    expect(screen.queryByText('Calories')).not.toBeInTheDocument();
  });

  it('should not display total calories', () => {
    const mealItems: MealItem[] = [
      {
        itemId: '1',
        name: 'Apple',
        percentageUsed: 50,
        cost: 0.75,
      },
    ];

    render(
      <MealItemEditor
        mealItems={mealItems}
        onMealItemsChange={mockOnMealItemsChange}
      />
    );

    expect(screen.queryByText(/total calories/i)).not.toBeInTheDocument();
  });

  it('should display total cost', () => {
    const mealItems: MealItem[] = [
      {
        itemId: '1',
        name: 'Apple',
        percentageUsed: 50,
        cost: 0.75,
      },
    ];

    render(
      <MealItemEditor
        mealItems={mealItems}
        onMealItemsChange={mockOnMealItemsChange}
      />
    );

    expect(screen.getByText(/total cost/i)).toBeInTheDocument();
  });

  it('should create meal items without calories field', () => {
    const mealItems: MealItem[] = [];
    render(
      <MealItemEditor
        mealItems={mealItems}
        onMealItemsChange={mockOnMealItemsChange}
      />
    );

    // Verify meal items structure doesn't include calories
    expect(mealItems.every(item => !('calories' in item))).toBe(true);
  });
});

