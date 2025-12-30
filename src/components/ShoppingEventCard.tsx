import { ShoppingEvent } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import { Link } from 'react-router-dom';
import { deleteShoppingEvent } from '../services/dataService';
import './ShoppingEventCard.css';

interface ShoppingEventCardProps {
  event: ShoppingEvent;
  onDelete?: () => void;
}

function ShoppingEventCard({ event, onDelete }: ShoppingEventCardProps) {
  const currency = getCurrency();
  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this shopping event from ${formattedDate}?`)) {
      deleteShoppingEvent(event.id);
      if (onDelete) onDelete();
    }
  };

  return (
    <div className="shopping-event-card-wrapper">
      <Link to={`/shopping/event/${event.id}`} className="shopping-event-card-link">
        <div className="shopping-event-card">
          <div className="event-header">
            <h3 className="event-date">{formattedDate}</h3>
            <span className="event-total">{formatPrice(event.totalCost, currency)}</span>
          </div>
          <div className="event-item-count">
            {event.items.length} {event.items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </Link>
      <button onClick={handleDelete} className="shopping-event-delete-button" title="Delete shopping event">
        Delete
      </button>
    </div>
  );
}

export default ShoppingEventCard;

