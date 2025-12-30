import { Item } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './FridgeItemCard.css';

interface FridgeItemCardProps {
  item: Item;
}

function FridgeItemCard({ item }: FridgeItemCardProps) {
  const currency = getCurrency();

  return (
    <div className="fridge-item-card">
      <div className="item-header">
        <h3 className="item-name">{item.name}</h3>
        <span className="item-percentage">{item.percentageLeft}%</span>
      </div>
      <div className="item-details">
        <div className="item-detail">
          <span className="detail-label">Cost:</span>
          <span className="detail-value">{formatPrice(item.cost, currency)}</span>
        </div>
        <div className="item-detail">
          <span className="detail-label">Calories:</span>
          <span className="detail-value">{item.estimatedCalories}</span>
        </div>
      </div>
      <div className="item-progress">
        <div
          className="item-progress-bar"
          style={{ width: `${item.percentageLeft}%` }}
        />
      </div>
    </div>
  );
}

export default FridgeItemCard;

