import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MealReuseSelector from './MealReuseSelector';
import { addMeal } from '../services/dataService';

describe('MealReuseSelector', () => {
  const mockOnSelect = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    mockOnSelect.mockClear();
    mockOnCancel.mockClear();
  });

  it('should display search input', () => {
    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    const searchInput = screen.getByPlaceholderText('Search meals...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should display "No meals found" when there are no meals', () => {
    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    expect(screen.getByText('No meals found')).toBeInTheDocument();
  });

  it('should display meals with names and dates', async () => {
    // Add test meals
    const meal1 = addMeal({
      name: 'Test Meal 1',
      date: new Date('2026-01-01'),
      items: [],
      totalCost: 10.50,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    const meal2 = addMeal({
      name: 'Test Meal 2',
      date: new Date('2026-01-02'),
      items: [],
      totalCost: 8.75,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Test Meal 1')).toBeInTheDocument();
      expect(screen.getByText('Test Meal 2')).toBeInTheDocument();
    });

    // Check that dates are displayed
    const date1 = new Date(meal1.date).toLocaleDateString();
    const date2 = new Date(meal2.date).toLocaleDateString();
    expect(screen.getByText(date1)).toBeInTheDocument();
    expect(screen.getByText(date2)).toBeInTheDocument();
  });

  it('should display meals sorted by date descending (most recent first)', async () => {
    // Add meals with different dates
    addMeal({
      name: 'Old Meal',
      date: new Date('2026-01-01'),
      items: [],
      totalCost: 10.50,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    addMeal({
      name: 'Recent Meal',
      date: new Date('2026-01-03'),
      items: [],
      totalCost: 8.75,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    await waitFor(() => {
      const mealOptions = screen.getAllByRole('button', { name: /meal/i });
      expect(mealOptions.length).toBeGreaterThan(0);
    });

    const mealOptions = screen.getAllByRole('button');
    // Filter out the Cancel button
    const mealButtons = mealOptions.filter(btn =>
      btn.textContent?.includes('Meal') && !btn.textContent?.includes('Cancel')
    );

    // Most recent meal should appear first
    expect(mealButtons[0]).toHaveTextContent('Recent Meal');
  });

  it('should filter meals when searching', async () => {
    const user = userEvent.setup();

    addMeal({
      name: 'Apple Pie',
      date: new Date('2026-01-01'),
      items: [],
      totalCost: 10.50,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    addMeal({
      name: 'Banana Bread',
      date: new Date('2026-01-02'),
      items: [],
      totalCost: 8.75,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Apple Pie')).toBeInTheDocument();
      expect(screen.getByText('Banana Bread')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search meals...');
    await user.type(searchInput, 'Apple');

    await waitFor(() => {
      expect(screen.getByText('Apple Pie')).toBeInTheDocument();
      expect(screen.queryByText('Banana Bread')).not.toBeInTheDocument();
    });
  });

  it('should call onSelect when a meal is clicked', async () => {
    const meal = addMeal({
      name: 'Test Meal',
      date: new Date('2026-01-01'),
      items: [],
      totalCost: 10.50,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Test Meal')).toBeInTheDocument();
    });

    const mealButton = screen.getByRole('button', { name: /Test Meal/ });
    await userEvent.click(mealButton);

    expect(mockOnSelect).toHaveBeenCalledWith(meal);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should limit displayed meals to 10 most recent', async () => {
    // Add 15 meals
    for (let i = 1; i <= 15; i++) {
      addMeal({
        name: `Meal ${i}`,
        date: new Date(`2026-01-${String(i).padStart(2, '0')}`),
        items: [],
        totalCost: 10.50,
        portionsCooked: 1,
        portionsLeft: 0,
        isActive: false,
      });
    }

    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    await waitFor(() => {
      const mealOptions = screen.getAllByRole('button');
      const mealButtons = mealOptions.filter(btn =>
        btn.textContent?.includes('Meal') && !btn.textContent?.includes('Cancel')
      );
      expect(mealButtons.length).toBe(10);
    });
  });

  it('should display meal names and dates in horizontal layout', async () => {
    const meal = addMeal({
      name: 'Test Meal',
      date: new Date('2026-01-01'),
      items: [],
      totalCost: 10.50,
      portionsCooked: 1,
      portionsLeft: 0,
      isActive: false,
    });

    render(<MealReuseSelector onSelect={mockOnSelect} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Test Meal')).toBeInTheDocument();
    });

    const mealOption = screen.getByRole('button', { name: /Test Meal/ });

    // Verify the meal option has the correct class
    expect(mealOption).toHaveClass('meal-option');

    // Verify both name and date elements exist within the same button
    const mealName = mealOption.querySelector('.meal-option-name');
    const mealDate = mealOption.querySelector('.meal-option-date');

    expect(mealName).toBeInTheDocument();
    expect(mealDate).toBeInTheDocument();
    expect(mealName?.textContent).toBe('Test Meal');
    expect(mealDate?.textContent).toBe(new Date(meal.date).toLocaleDateString());
  });
});

