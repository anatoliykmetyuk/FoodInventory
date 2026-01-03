import { Meal } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import './MealCard.css';

interface MealCardProps {
  meal: Meal;
  onConsumePortion?: (mealId: string) => void;
  onDelete?: (mealId: string) => void;
  onMarkCooked?: (mealId: string) => void;
  onRate?: (mealId: string, rating: number) => void;
}

function MealCard({ meal, onConsumePortion, onDelete, onMarkCooked, onRate }: MealCardProps) {
  const currency = getCurrency();
  const navigate = useNavigate();
  const date = new Date(meal.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/cooking/meal/${meal.id}?edit=true`);
  };

  return (
    <div className={`meal-card ${meal.isActive ? 'meal-card-active' : ''} ${meal.isPlanned ? 'meal-card-planned' : ''}`}>
      <Link to={`/cooking/meal/${meal.id}`} className="meal-card-link">
        <div className="meal-header">
          <h3 className="meal-name">
            {meal.name}
            {meal.isPlanned && <span className="planned-indicator">📋</span>}
          </h3>
          <span className="meal-date">{formattedDate}</span>
        </div>
        <div className="meal-details">
          <div className="meal-detail">
            <span className="detail-label">Cost:</span>
            <span className="detail-value">{formatPrice(meal.totalCost, currency)}</span>
          </div>
          <div className="meal-detail">
            <span className="detail-label">Portions:</span>
            <span className="detail-value">{meal.portionsLeft} / {meal.portionsCooked}</span>
          </div>
          {meal.savings !== undefined && (
            <div className="meal-detail">
              <span className="detail-label">Savings:</span>
              <span className={`detail-value ${meal.savings >= 0 ? 'savings-positive' : 'savings-negative'}`}>
                {meal.savings >= 0 ? '+' : ''}{formatPrice(meal.savings, currency)}
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="meal-card-actions">
        {meal.isPlanned ? (
          <>
            {onMarkCooked && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onMarkCooked(meal.id);
                }}
                className="mark-cooked-button"
              >
                Mark Cooked
              </button>
            )}
            <button
              onClick={handleEdit}
              className="edit-meal-button"
            >
              Edit
            </button>
          </>
        ) : (
          <>
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
            {onRate && (
              <div className="meal-rating-inline" onClick={(e) => e.preventDefault()}>
                <StarRating
                  rating={meal.rating}
                  onRatingChange={(rating) => onRate(meal.id, rating)}
                  size="small"
                />
              </div>
            )}
          </>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(meal.id);
            }}
            className="delete-meal-button"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default MealCard;
