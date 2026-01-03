import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ShoppingEvent from './ShoppingEvent';
import { getShoppingEvent, deleteShoppingEvent } from '../services/dataService';
import type { ShoppingEvent as ShoppingEventType } from '../types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-event-id' }),
    useNavigate: () => mockNavigate,
  };
});

// Mock dataService
vi.mock('../services/dataService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/dataService')>();
  return {
    ...actual,
    getShoppingEvent: vi.fn(),
    deleteShoppingEvent: vi.fn(),
    updateShoppingEvent: vi.fn(),
    addItemsToFridgeFromShopping: vi.fn(),
    getShoppingEvents: vi.fn(() => []),
  };
});

describe('ShoppingEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('should delete empty event when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const emptyEvent: ShoppingEventType = {
      id: 'test-event-id',
      date: new Date(),
      items: [],
      totalCost: 0,
    };

    vi.mocked(getShoppingEvent).mockReturnValue(emptyEvent);
    vi.mocked(deleteShoppingEvent).mockReturnValue(true);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(deleteShoppingEvent).toHaveBeenCalledWith('test-event-id');
    expect(mockNavigate).toHaveBeenCalledWith('/shopping');
  });

  it('should not delete event with items when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const eventWithItems: ShoppingEventType = {
      id: 'test-event-id',
      date: new Date(),
      items: [
        {
          name: 'Apple',
          listedPrice: 1.50,
          taxRate: 10,
        },
      ],
      totalCost: 1.65,
    };

    vi.mocked(getShoppingEvent).mockReturnValue(eventWithItems);
    vi.mocked(deleteShoppingEvent).mockReturnValue(true);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    // When event has items, isEditable is false, so button shows "Back to Shopping"
    const backButton = screen.getByRole('button', { name: /back to shopping/i });
    await user.click(backButton);

    expect(deleteShoppingEvent).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/shopping');
  });

  it('should navigate to shopping page when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const emptyEvent: ShoppingEventType = {
      id: 'test-event-id',
      date: new Date(),
      items: [],
      totalCost: 0,
    };

    vi.mocked(getShoppingEvent).mockReturnValue(emptyEvent);
    vi.mocked(deleteShoppingEvent).mockReturnValue(true);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/shopping');
  });

  it('should delete event when Cancel is clicked even if date was changed', async () => {
    const user = userEvent.setup();
    const emptyEvent: ShoppingEventType = {
      id: 'test-event-id',
      date: new Date(),
      items: [],
      totalCost: 0,
    };

    vi.mocked(getShoppingEvent).mockReturnValue(emptyEvent);
    vi.mocked(deleteShoppingEvent).mockReturnValue(true);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    // Change the date
    const dateInput = screen.getByLabelText(/date:/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2024-12-31');

    // Click Cancel - should still delete the event because items.length === 0
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(deleteShoppingEvent).toHaveBeenCalledWith('test-event-id');
    expect(mockNavigate).toHaveBeenCalledWith('/shopping');
  });
});

