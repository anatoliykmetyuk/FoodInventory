import type { ShoppingItem } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import ReceiptReviewTable from './ReceiptReviewTable';
import './ShoppingItemEditor.css';

interface ShoppingItemEditorProps {
  items: ShoppingItem[];
  onItemsChange: (items: ShoppingItem[]) => void;
  isEditable?: boolean;
  taxRate?: number;
}

function ShoppingItemEditor({ items, onItemsChange, isEditable = true, taxRate = 0 }: ShoppingItemEditorProps) {
  if (isEditable) {
    return <ReceiptReviewTable items={items} onItemsChange={onItemsChange} taxRate={taxRate} />;
  }

  // Read-only view
  const currency = getCurrency();
  const getItemPrice = (item: ShoppingItem): number => {
    // If item has finalPrice (saved item), use it directly
    if (item.finalPrice !== undefined) {
      return item.finalPrice;
    }
    // Otherwise, calculate from global taxRate (editing item)
    return (item.listedPrice ?? 0) * (1 + taxRate / 100);
  };
  const totalCost = items.reduce((sum, item) => sum + getItemPrice(item), 0);

  return (
    <div className="shopping-item-view">
      <div className="items-list">
        {items.map((item, index) => {
          const price = getItemPrice(item);
          return (
            <div key={index} className="item-row">
              <span className="item-name">{item.name}</span>
              <span className="item-price">{formatPrice(price, currency)}</span>
            </div>
          );
        })}
        <div className="total-row">
          <span className="total-label">Total:</span>
          <span className="total-value">{formatPrice(totalCost, currency)}</span>
        </div>
      </div>
    </div>
  );
}

export default ShoppingItemEditor;

