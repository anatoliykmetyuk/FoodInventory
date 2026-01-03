import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Fridge from './Fridge';
import { addItem } from '../services/dataService';

describe('Fridge', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should display search input with correct className', () => {
    render(
      <MemoryRouter>
        <Fridge />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('fridge-search-input');
  });

  it('should display search container with correct className', () => {
    render(
      <MemoryRouter>
        <Fridge />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    const searchContainer = searchInput.closest('.fridge-search-container');
    expect(searchContainer).toBeInTheDocument();
  });

  it('should filter items when typing in search', async () => {
    const user = userEvent.setup();

    // Add test items
    addItem({
      name: 'Apple',
      cost: 1.50,
      estimatedCalories: 95,
      percentageLeft: 100,
    });

    addItem({
      name: 'Banana',
      cost: 0.75,
      estimatedCalories: 105,
      percentageLeft: 100,
    });

    render(
      <MemoryRouter>
        <Fridge />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search items...');
    await user.type(searchInput, 'Apple');

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
  });

  it('should clear search and show all items', async () => {
    const user = userEvent.setup();

    // Add test items
    addItem({
      name: 'Apple',
      cost: 1.50,
      estimatedCalories: 95,
      percentageLeft: 100,
    });

    addItem({
      name: 'Banana',
      cost: 0.75,
      estimatedCalories: 105,
      percentageLeft: 100,
    });

    render(
      <MemoryRouter>
        <Fridge />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search items...') as HTMLInputElement;
    await user.type(searchInput, 'Apple');

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });

    // Clear search
    await user.clear(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
  });

  it('should display empty state when no items match search', async () => {
    const user = userEvent.setup();

    // Add test item
    addItem({
      name: 'Apple',
      cost: 1.50,
      estimatedCalories: 95,
      percentageLeft: 100,
    });

    render(
      <MemoryRouter>
        <Fridge />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search items...');
    await user.type(searchInput, 'XYZ123');

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      expect(screen.getByText('No items found matching your search.')).toBeInTheDocument();
    });
  });
});

