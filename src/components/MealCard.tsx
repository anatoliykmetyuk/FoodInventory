import { Meal } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import { Link } from 'react-router-dom';
import './MealCard.css';

interface MealCardProps {
  meal: Meal;
  onConsumePortion?: (mealId: string) => void;
}

function MealCard({ meal, onConsumePortion }: MealCardProps) {
  const currency = getCurrency();
  const date = new Date(meal.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="meal-card">
      <Link to={`/cooking/meal/${meal.id}`} className="meal-card-link">
        <div className="meal-header">
          <h3 className="meal-name">{meal.name}</h3>
          <span className="meal-date">{formattedDate}</span>
        </div>
        <div className="meal-details">
          <div className="meal-detail">
            <span className="detail-label">Cost:</span>
            <span className="detail-value">{formatPrice(meal.totalCost, currency)}</span>
          </div>
          <div className="meal-detail">
            <span className="detail-label">Calories:</span>
            <span className="detail-value">{meal.totalCalories}</span>
          </div>
          <div className="meal-detail">
            <span className="detail-label">Portions:</span>
            <span className="detail-value">{meal.portionsLeft} / {meal.portionsCooked}</span>
          </div>
        </div>
      </Link>
      {meal.isActive && meal.portionsLeft > 0 && onConsumePortion && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onConsumePortion(meal.id);
          }}
          className="consume-portion-button"
        >
          Consume Portion
        </button>
      )}
    </div>
  );
}

export default MealCard;

