import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddItemDialog from './AddItemDialog';
import { addItem } from '../services/dataService';

// Mock dataService
vi.mock('../services/dataService', () => ({
  addItem: vi.fn(),
}));

describe('AddItemDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should not render when isOpen is false', () => {
    render(<AddItemDialog isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByText('Add Item to Fridge')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<AddItemDialog isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('Add Item to Fridge')).toBeInTheDocument();
    expect(screen.getByLabelText('Item Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost:')).toBeInTheDocument();
    expect(screen.queryByLabelText(/calories/i)).not.toBeInTheDocument();
  });

  it('should not have calories input field', () => {
    render(<AddItemDialog isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByLabelText(/calories/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Estimated Calories/i)).not.toBeInTheDocument();
  });

  it('should have form fields without calories', () => {
    render(<AddItemDialog isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByLabelText('Item Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost:')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiration Date (optional):')).toBeInTheDocument();
    expect(screen.queryByLabelText(/calories/i)).not.toBeInTheDocument();
  });

  it('should not submit if name is empty', async () => {
    const user = userEvent.setup();
    render(<AddItemDialog isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    await user.type(screen.getByLabelText('Cost:'), '1.50');
    await user.click(screen.getByRole('button', { name: /add item/i }));

    expect(addItem).not.toHaveBeenCalled();
  });

  it('should not submit if cost is invalid', async () => {
    const user = userEvent.setup();
    render(<AddItemDialog isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    await user.type(screen.getByLabelText('Item Name:'), 'Apple');
    await user.type(screen.getByLabelText('Cost:'), '0');
    await user.click(screen.getByRole('button', { name: /add item/i }));

    expect(addItem).not.toHaveBeenCalled();
  });
});

