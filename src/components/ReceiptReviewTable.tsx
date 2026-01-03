import { useState, useEffect } from 'react';
import type { ShoppingItem } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './ReceiptReviewTable.css';

interface ReceiptReviewTableProps {
  items: ShoppingItem[];
  onItemsChange: (items: ShoppingItem[]) => void;
}

function ReceiptReviewTable({ items, onItemsChange }: ReceiptReviewTableProps) {
  const [localItems, setLocalItems] = useState<ShoppingItem[]>(items);
  const currency = getCurrency();

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const updateItem = (index: number, field: keyof ShoppingItem, value: string | number) => {
    const updated = [...localItems];
    updated[index] = {
      ...updated[index],
      [field]: (field === 'listedPrice' || field === 'taxRate') ? parseFloat(String(value)) || 0 :
               value,
    };
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
      taxRate: 0,
    };
    const updated = [...localItems, newItem];
    setLocalItems(updated);
    onItemsChange(updated);
  };

  const calculateTotalCost = (item: ShoppingItem): number => {
    // For editing, items should have taxRate
    return (item.listedPrice ?? 0) * (1 + (item.taxRate ?? 0) / 100);
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
              <th>Tax Rate (%)</th>
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
                      value={item.listedPrice ?? 0}
                      onChange={(e) => updateItem(index, 'listedPrice', e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.taxRate ?? 0}
                      onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
                      className="table-input"
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
              <td colSpan={3} className="total-label">Total Cost:</td>
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
                  value={item.listedPrice ?? 0}
                  onChange={(e) => updateItem(index, 'listedPrice', e.target.value)}
                  className="item-card-input"
                  placeholder="0.00"
                />
              </div>
              <div className="item-card-field">
                <label className="item-card-label">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.taxRate ?? 0}
                  onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
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

