import { useNavigate } from 'react-router-dom';
import { Item } from '../types';
import { getExpirationWarningDays } from '../services/settingsService';
import './FridgeItemCardCompact.css';

interface FridgeItemCardCompactProps {
  item: Item;
}

function FridgeItemCardCompact({ item }: FridgeItemCardCompactProps) {
  const navigate = useNavigate();
  const expirationWarningDays = getExpirationWarningDays();

  // Calculate days until expiration
  const getDaysUntilExpiration = (): number | null => {
    if (!item.expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(item.expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiration = getDaysUntilExpiration();
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= expirationWarningDays;

  const formatDaysUntilExpiration = (): string => {
    if (daysUntilExpiration === null) return '—';
    if (daysUntilExpiration < 0) return `${Math.abs(daysUntilExpiration)}d ago`;
    if (daysUntilExpiration === 0) return 'today';
    return `${daysUntilExpiration}d`;
  };

  return (
    <div className="fridge-item-card-compact" onClick={() => navigate(`/fridge/item/${item.id}`)}>
      <span className="compact-item-name">{item.name}</span>
      <span className={`compact-item-expiration ${isExpiringSoon ? 'expiring-soon' : ''}`}>
        {formatDaysUntilExpiration()}
      </span>
      <div className="compact-item-progress">
        <div
          className="compact-item-progress-bar"
          style={{ width: `${item.percentageLeft}%` }}
        />
      </div>
      <span className="compact-item-percentage">{item.percentageLeft}%</span>
    </div>
  );
}

export default FridgeItemCardCompact;
