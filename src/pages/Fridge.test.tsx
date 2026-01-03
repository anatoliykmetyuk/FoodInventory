import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Fridge from './Fridge';
import { addItem } from '../services/dataService';
import type { Item } from '../types';

describe('Fridge Search', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.removeItem('food-inventory-data');
  });

  const renderFridge = () => {
    return render(
      <MemoryRouter>
        <Fridge />
      </MemoryRouter>
    );
  };

  const createTestItems = () => {
    const items: Item[] = [
      addItem({
        name: 'Apple',
        cost: 1.50,
        estimatedCalories: 95,
        percentageLeft: 100,
      }),
      addItem({
        name: 'Banana',
        cost: 0.75,
        estimatedCalories: 105,
        percentageLeft: 100,
      }),
      addItem({
        name: 'Milk',
        cost: 3.00,
        estimatedCalories: 150,
        percentageLeft: 100,
      }),
      addItem({
        name: 'Bread',
        cost: 2.50,
        estimatedCalories: 200,
        percentageLeft: 100,
      }),
    ];
    return items;
  };

  it('should display search input field', () => {
    renderFridge();
    const searchInput = screen.getByPlaceholderText('Search items...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter items by name when searching', async () => {
    createTestItems();
    renderFridge();

    const searchInput = screen.getByPlaceholderText('Search items...');
    const user = userEvent.setup();

    // Initially all items should be visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();

    // Search for "Apple"
    await user.type(searchInput, 'Apple');

    // Only Apple should be visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('should perform case-insensitive search', async () => {
    createTestItems();
    renderFridge();

    const searchInput = screen.getByPlaceholderText('Search items...');
    const user = userEvent.setup();

    // Search with lowercase
    await user.type(searchInput, 'milk');

    // Milk should be visible (case-insensitive)
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('should show all items when search is cleared', async () => {
    createTestItems();
    renderFridge();

    const searchInput = screen.getByPlaceholderText('Search items...');
    const user = userEvent.setup();

    // Search for something
    await user.type(searchInput, 'Apple');
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();

    // Clear search
    await user.clear(searchInput);

    // All items should be visible again
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  it('should show empty state when no items match search', async () => {
    createTestItems();
    renderFridge();

    const searchInput = screen.getByPlaceholderText('Search items...');
    const user = userEvent.setup();

    // Search for something that doesn't exist
    await user.type(searchInput, 'XYZ123');

    // Should show empty state with clear search option
    expect(screen.getByText('No items found matching your search.')).toBeInTheDocument();
    const clearButton = screen.getByText('Clear Search');
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear search when clicking clear search button', async () => {
    createTestItems();
    renderFridge();

    const searchInput = screen.getByPlaceholderText('Search items...');
    const user = userEvent.setup();

    // Search for something
    await user.type(searchInput, 'XYZ123');
    expect(screen.getByText('No items found matching your search.')).toBeInTheDocument();

    // Click clear search
    const clearButton = screen.getByText('Clear Search');
    await user.click(clearButton);

    // All items should be visible again
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
  });

  it('should filter items in real-time as user types', async () => {
    createTestItems();
    renderFridge();

    const searchInput = screen.getByPlaceholderText('Search items...');
    const user = userEvent.setup();

    // Type "B" - should show Banana and Bread
    await user.type(searchInput, 'B');
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();

    // Type "Ba" - should show only Banana
    await user.type(searchInput, 'a');
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Bread')).not.toBeInTheDocument();
  });

  it('should work with partial matches', async () => {
    createTestItems();
    renderFridge();

    const searchInput = screen.getByPlaceholderText('Search items...');
    const user = userEvent.setup();

    // Search for "read" (part of "Bread")
    await user.type(searchInput, 'read');

    // Bread should be visible
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.queryByText('Milk')).not.toBeInTheDocument();
  });
});


