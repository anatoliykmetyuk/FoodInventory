import type { ShoppingItem } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import ReceiptReviewTable from './ReceiptReviewTable';
import './ShoppingItemEditor.css';

interface ShoppingItemEditorProps {
  items: ShoppingItem[];
  onItemsChange: (items: ShoppingItem[]) => void;
  isEditable?: boolean;
}

function ShoppingItemEditor({ items, onItemsChange, isEditable = true }: ShoppingItemEditorProps) {
  if (isEditable) {
    return <ReceiptReviewTable items={items} onItemsChange={onItemsChange} />;
  }

  // Read-only view
  const currency = getCurrency();
  const calculateTotalCost = (item: ShoppingItem): number => {
    return item.listedPrice * (1 + item.taxRate / 100);
  };
  const totalCost = items.reduce((sum, item) => sum + calculateTotalCost(item), 0);

  return (
    <div className="shopping-item-view">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Listed Price</th>
              <th>Tax Rate (%)</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const itemTotalCost = calculateTotalCost(item);
              return (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{formatPrice(item.listedPrice, currency)}</td>
                  <td>{item.taxRate.toFixed(2)}%</td>
                  <td>{formatPrice(itemTotalCost, currency)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="total-label">Total Cost:</td>
              <td className="total-value" colSpan={1}>
                {formatPrice(totalCost, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default ShoppingItemEditor;

