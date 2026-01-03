import { useState, useEffect } from 'react';
import type { ShoppingItem } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './ReceiptReviewTable.css';

interface ReceiptReviewTableProps {
  items: ShoppingItem[];
  onItemsChange: (items: ShoppingItem[]) => void;
  taxRate: number;
}

function ReceiptReviewTable({ items, onItemsChange, taxRate }: ReceiptReviewTableProps) {
  const [localItems, setLocalItems] = useState<ShoppingItem[]>(items);
  // Store raw input values for listedPrice to allow empty strings
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({});
  const currency = getCurrency();

  useEffect(() => {
    setLocalItems(items);
    // Initialize price inputs from items, but preserve existing user input
    setPriceInputs(prev => {
      const inputs: Record<number, string> = { ...prev };
      items.forEach((item, index) => {
        // Only initialize if this index doesn't have a value yet
        if (inputs[index] === undefined) {
          inputs[index] = item.listedPrice !== undefined && item.listedPrice !== null ? String(item.listedPrice) : '';
        }
      });
      return inputs;
    });
  }, [items]);

  const updateItem = (index: number, field: keyof ShoppingItem, value: string | number) => {
    const updated = [...localItems];
    if (field === 'listedPrice') {
      const stringValue = String(value);
      // Store raw input value (allow empty string)
      setPriceInputs(prev => ({ ...prev, [index]: stringValue }));

      // Empty string is interpreted as 0 for calculations
      const numValue = stringValue === '' ? 0 : parseFloat(stringValue);
      updated[index] = {
        ...updated[index],
        listedPrice: isNaN(numValue) ? 0 : numValue,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setLocalItems(updated);
    onItemsChange(updated);
  };

  const removeItem = (index: number) => {
    const updated = localItems.filter((_, i) => i !== index);
    setLocalItems(updated);
    onItemsChange(updated);
  };

  const addItem = () => {
    const newItem: ShoppingItem = {
      name: '',
      listedPrice: 0,
    };
    const updated = [...localItems, newItem];
    const newIndex = updated.length - 1;
    setLocalItems(updated);
    // Initialize price input as empty string for new item - set it immediately and preserve it
    setPriceInputs(prev => ({ ...prev, [newIndex]: '' }));
    onItemsChange(updated);
  };

  const calculateTotalCost = (item: ShoppingItem): number => {
    // Empty string is interpreted as 0, so undefined/null also treated as 0
    const listedPrice = item.listedPrice ?? 0;
    // Use global tax rate for calculation
    return listedPrice * (1 + taxRate / 100);
  };

  const totalCost = localItems.reduce((sum, item) => sum + calculateTotalCost(item), 0);

  return (
    <div className="receipt-review-table">
      <div className="table-header">
        <h3>Review Receipt Items</h3>
        <button onClick={addItem} className="add-row-button">
          + Add Item
        </button>
      </div>

      {/* Desktop table view */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Listed Price</th>
              <th>Total Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {localItems.map((item, index) => {
              const itemTotalCost = calculateTotalCost(item);
              return (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceInputs[index] ?? (item.listedPrice !== undefined && item.listedPrice !== null ? String(item.listedPrice) : '')}
                      onChange={(e) => updateItem(index, 'listedPrice', e.target.value)}
                      className="table-input"
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formatPrice(itemTotalCost, currency)}
                      readOnly
                      className="table-input table-input-readonly"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => removeItem(index)}
                      className="remove-button"
                      type="button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="total-label">Total Cost:</td>
              <td className="total-value" colSpan={2}>
                {formatPrice(totalCost, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="items-card-container">
        {localItems.map((item, index) => {
          const itemTotalCost = calculateTotalCost(item);
          return (
            <div key={index} className="item-card">
              <div className="item-card-header">
                <h4 className="item-card-title">Item {index + 1}</h4>
                <button
                  onClick={() => removeItem(index)}
                  className="item-card-remove"
                  type="button"
                >
                  Remove
                </button>
              </div>
              <div className="item-card-field">
                <label className="item-card-label">Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="item-card-input"
                  placeholder="Enter item name"
                />
              </div>
              <div className="item-card-field">
                <label className="item-card-label">Listed Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceInputs[index] ?? (item.listedPrice !== undefined && item.listedPrice !== null ? String(item.listedPrice) : '')}
                  onChange={(e) => updateItem(index, 'listedPrice', e.target.value)}
                  className="item-card-input"
                  placeholder="0.00"
                />
              </div>
              <div className="item-card-field">
                <label className="item-card-label">Total Cost</label>
                <input
                  type="text"
                  value={formatPrice(itemTotalCost, currency)}
                  readOnly
                  className="item-card-input item-card-input-readonly"
                />
              </div>
            </div>
          );
        })}
        <div className="mobile-total">
          <span className="mobile-total-label">Total Cost:</span>
          <span className="mobile-total-value">{formatPrice(totalCost, currency)}</span>
        </div>
      </div>
    </div>
  );
}

export default ReceiptReviewTable;

