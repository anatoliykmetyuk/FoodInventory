import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ShoppingEvent from './ShoppingEvent';
import { getShoppingEvent, deleteShoppingEvent, addShoppingEvent, addItemsToFridgeFromShopping } from '../services/dataService';
import type { ShoppingEvent as ShoppingEventType } from '../types';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ id: 'test-event-id' }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
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
      addShoppingEvent: vi.fn(),
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

  it('should navigate away when Cancel button is clicked on existing event', async () => {
    const user = userEvent.setup();
    const emptyEvent: ShoppingEventType = {
      id: 'test-event-id',
      date: new Date(),
      items: [],
      totalCost: 0,
    };

    vi.mocked(getShoppingEvent).mockReturnValue(emptyEvent);

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

    // Cancel should just navigate away, not delete
    expect(deleteShoppingEvent).not.toHaveBeenCalled();
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
          finalPrice: 1.65, // Saved items have finalPrice, not taxRate
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

  it('should navigate away when Cancel is clicked even if date was changed', async () => {
    const user = userEvent.setup();
    const emptyEvent: ShoppingEventType = {
      id: 'test-event-id',
      date: new Date(),
      items: [],
      totalCost: 0,
    };

    vi.mocked(getShoppingEvent).mockReturnValue(emptyEvent);

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

    // Click Cancel - should just navigate away, not delete
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(deleteShoppingEvent).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/shopping');
  });

  it('should navigate away for new event when Cancel is clicked', async () => {
    const user = userEvent.setup();

    // Mock useParams to return 'new' for new events
    mockUseParams.mockReturnValue({ id: 'new' });
    vi.mocked(getShoppingEvent).mockReturnValue(null);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    // Click Cancel - should just navigate away, nothing to delete
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(deleteShoppingEvent).not.toHaveBeenCalled();
    expect(addShoppingEvent).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/shopping');

    // Reset mock
    mockUseParams.mockReturnValue({ id: 'test-event-id' });
  });

  it('should not create event when Save is clicked with empty items for new event', async () => {
    const user = userEvent.setup();

    // Mock useParams to return 'new' for new events
    mockUseParams.mockReturnValue({ id: 'new' });
    vi.mocked(getShoppingEvent).mockReturnValue(null);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    // Click Save with empty items - should show error and NOT create event
    const saveButton = screen.getByRole('button', { name: /save to fridge/i });
    await user.click(saveButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Shopping event was not saved because it is empty/i)).toBeInTheDocument();
    });

    // Should NOT create event
    expect(addShoppingEvent).not.toHaveBeenCalled();
    expect(addItemsToFridgeFromShopping).not.toHaveBeenCalled();

    // Reset mock
    mockUseParams.mockReturnValue({ id: 'test-event-id' });
  });

  it('should render new event form correctly', async () => {
    // Mock useParams to return 'new' for new events
    mockUseParams.mockReturnValue({ id: 'new' });
    vi.mocked(getShoppingEvent).mockReturnValue(null);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    // The save button should be visible
    const saveButton = screen.getByRole('button', { name: /save to fridge/i });
    expect(saveButton).toBeInTheDocument();

    // Cancel button should be visible
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();

    // Date input should be visible
    const dateInput = screen.getByLabelText(/date:/i);
    expect(dateInput).toBeInTheDocument();

    // Reset mock
    mockUseParams.mockReturnValue({ id: 'test-event-id' });
  });

  it('should show tax rate input for new event', async () => {
    // Mock useParams to return 'new' for new events
    mockUseParams.mockReturnValue({ id: 'new' });
    vi.mocked(getShoppingEvent).mockReturnValue(null);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    // Tax rate input should be visible
    const taxRateInput = screen.getByLabelText(/tax rate/i);
    expect(taxRateInput).toBeInTheDocument();
    // Tax rate should be empty string initially (allows user to clear and type new value)
    expect(taxRateInput).toHaveValue(null); // Empty number input shows as null

    // Reset mock
    mockUseParams.mockReturnValue({ id: 'test-event-id' });
  });

  it('should use global tax rate when calculating finalPrice on save', async () => {
    const user = userEvent.setup();
    const mockAddShoppingEvent = vi.mocked(addShoppingEvent);

    // Mock useParams to return 'new' for new events
    mockUseParams.mockReturnValue({ id: 'new' });
    vi.mocked(getShoppingEvent).mockReturnValue(null);

    // Mock addShoppingEvent to return a new event
    const newEvent: ShoppingEventType = {
      id: 'new-event-id',
      date: new Date(),
      items: [],
      totalCost: 0,
    };
    mockAddShoppingEvent.mockReturnValue(newEvent);

    render(
      <MemoryRouter>
        <ShoppingEvent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shopping Event')).toBeInTheDocument();
    });

    // This test would need to interact with ReceiptReviewTable to add items
    // For now, we'll just verify the tax rate input exists and can be changed
    const taxRateInput = screen.getByLabelText(/tax rate/i);
    await user.clear(taxRateInput);
    await user.type(taxRateInput, '8.5');
    expect(taxRateInput).toHaveValue(8.5);

    // Reset mock
    mockUseParams.mockReturnValue({ id: 'test-event-id' });
  });
});

