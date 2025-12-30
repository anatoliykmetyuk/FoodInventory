import { ShoppingEvent } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import { Link } from 'react-router-dom';
import './ShoppingEventCard.css';

interface ShoppingEventCardProps {
  event: ShoppingEvent;
}

function ShoppingEventCard({ event }: ShoppingEventCardProps) {
  const currency = getCurrency();
  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
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
  );
}

export default ShoppingEventCard;

