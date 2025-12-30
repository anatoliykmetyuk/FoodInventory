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
      [field]: field === 'estimatedCalories' ? parseInt(String(value), 10) || 0 :
               (field === 'listedPrice' || field === 'finalPrice') ? parseFloat(String(value)) || 0 :
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
      finalPrice: 0,
      estimatedCalories: 0,
    };
    const updated = [...localItems, newItem];
    setLocalItems(updated);
    onItemsChange(updated);
  };

  const totalCost = localItems.reduce((sum, item) => sum + item.finalPrice, 0);

  return (
    <div className="receipt-review-table">
      <div className="table-header">
        <h3>Review Receipt Items</h3>
        <button onClick={addItem} className="add-row-button">
          + Add Item
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Listed Price</th>
              <th>Final Price</th>
              <th>Estimated Calories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {localItems.map((item, index) => (
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
                    value={item.listedPrice}
                    onChange={(e) => updateItem(index, 'listedPrice', e.target.value)}
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.finalPrice}
                    onChange={(e) => updateItem(index, 'finalPrice', e.target.value)}
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.estimatedCalories}
                    onChange={(e) => updateItem(index, 'estimatedCalories', e.target.value)}
                    className="table-input"
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
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="total-label">Total Cost:</td>
              <td className="total-value" colSpan={3}>
                {formatPrice(totalCost, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default ReceiptReviewTable;

