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
  const totalCost = items.reduce((sum, item) => sum + item.finalPrice, 0);

  return (
    <div className="shopping-item-view">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Listed Price</th>
              <th>Final Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{formatPrice(item.listedPrice, currency)}</td>
                <td>{formatPrice(item.finalPrice, currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="total-label">Total Cost:</td>
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

