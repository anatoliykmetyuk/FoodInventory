import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMeal, addMeal, updateMeal, deleteMeal, markMealAsCooked, rateMeal } from '../services/dataService';
import { updateFridgeAfterMeal } from '../services/dataService';
import type { Meal as MealType, MealItem } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import MealItemEditor from '../components/MealItemEditor';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';
import './Meal.css';

function Meal() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<MealType | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [portionsCooked, setPortionsCooked] = useState(1);
  const [isEditable, setIsEditable] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const [plannedDate, setPlannedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const currency = getCurrency();

  useEffect(() => {
    const reuseId = searchParams.get('reuse');
    const editMode = searchParams.get('edit') === 'true';

    if (id === 'new') {
      // New meal
      setIsEditable(true);
      if (reuseId) {
        // Reuse existing meal
        const existingMeal = getMeal(reuseId);
        if (existingMeal) {
          setMealName(existingMeal.name);
          setMealItems(existingMeal.items.map(item => ({ ...item })));
          setPortionsCooked(existingMeal.portionsCooked);
        }
      }
    } else if (id) {
      // Existing meal
      const existingMeal = getMeal(id);
      if (existingMeal) {
        setMeal(existingMeal);
        setMealName(existingMeal.name);
        setMealItems(existingMeal.items);
        setPortionsCooked(existingMeal.portionsCooked);
        setIsPlanned(existingMeal.isPlanned || false);
        // Set planned date from existing meal
        const mealDate = new Date(existingMeal.date);
        setPlannedDate(mealDate.toISOString().split('T')[0]);
        // Allow editing if it's a planned meal and we're in edit mode
        setIsEditable(editMode && (existingMeal.isPlanned || false));
      }
    }
  }, [id, searchParams]);

  const handleMealItemsChange = (items: MealItem[]) => {
    setMealItems(items);
  };

  const handleSave = () => {
    if (!mealName.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (mealItems.length === 0) {
      alert('Please add at least one item to the meal');
      return;
    }

    // Calculate totals
    const totalCost = mealItems.reduce((sum, item) => sum + item.cost, 0);
    const totalCalories = mealItems.reduce((sum, item) => sum + item.calories, 0);

    if (id === 'new') {
      // Create new meal
      // Use planned date for planned meals, current date for regular meals
      const mealDate = isPlanned ? new Date(plannedDate + 'T12:00:00') : new Date();
      
      const newMeal = addMeal({
        name: mealName.trim(),
        date: mealDate,
        items: mealItems,
        totalCost,
        totalCalories,
        portionsCooked,
        portionsLeft: portionsCooked,
        isActive: true,
        isPlanned,
      });

      // Only update fridge if not a planned meal
      if (!isPlanned) {
        updateFridgeAfterMeal(mealItems);
      }

      // Navigate to view mode
      navigate(`/cooking/meal/${newMeal.id}`);
    } else if (id && meal?.isPlanned) {
      // Update existing planned meal
      const mealDate = new Date(plannedDate + 'T12:00:00');
      
      updateMeal(id, {
        name: mealName.trim(),
        date: mealDate,
        items: mealItems,
        totalCost,
        totalCalories,
        portionsCooked,
        portionsLeft: portionsCooked,
      });

      // Reload meal and exit edit mode
      loadMeal(id);
      setIsEditable(false);
      // Update URL to remove edit param
      navigate(`/cooking/meal/${id}`, { replace: true });
    }
  };

  const handleConsumePortion = () => {
    if (!meal || !id) return;

    const newPortionsLeft = meal.portionsLeft - 1;
    const isActive = newPortionsLeft > 0;

    updateMeal(id, {
      portionsLeft: newPortionsLeft,
      isActive,
    });

    loadMeal(id);
  };

  const handleMarkCooked = () => {
    if (!meal || !id) return;

    const result = markMealAsCooked(id);
    
    if (result.success) {
      setToast({ message: 'Meal marked as cooked!', type: 'success' });
      loadMeal(id);
    } else {
      setToast({ message: result.errors.join('. '), type: 'error' });
    }
  };

  const handleEdit = () => {
    if (!id) return;
    navigate(`/cooking/meal/${id}?edit=true`);
  };

  const handleDeleteMeal = () => {
    if (!meal || !id) return;

    if (window.confirm(`Are you sure you want to delete "${meal.name}"? This will restore the used percentages to your fridge items.`)) {
      deleteMeal(id);
      navigate('/cooking');
    }
  };

  const handleRateMeal = (rating: number) => {
    if (!id) return;

    const result = rateMeal(id, rating);
    if (result) {
      setToast({ message: `Rated meal ${rating} star${rating > 1 ? 's' : ''}!`, type: 'success' });
      loadMeal(id);
    } else {
      setToast({ message: 'Failed to rate meal', type: 'error' });
    }
  };

  const loadMeal = (mealId: string) => {
    const loadedMeal = getMeal(mealId);
    if (loadedMeal) {
      setMeal(loadedMeal);
      setMealName(loadedMeal.name);
      setMealItems(loadedMeal.items);
      setPortionsCooked(loadedMeal.portionsCooked);
      setIsPlanned(loadedMeal.isPlanned || false);
      const mealDate = new Date(loadedMeal.date);
      setPlannedDate(mealDate.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="meal-page">
      <div className="meal-header">
        {isEditable ? (
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Enter meal name"
            className="meal-name-input"
            autoFocus
          />
        ) : (
          <h1>{mealName || 'Meal'}</h1>
        )}
        {meal && (
          <span className="meal-date">
            {new Date(meal.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {isEditable && (
        <>
          <div className="portions-input-group">
            <label htmlFor="portions">Portions Cooked:</label>
            <input
              id="portions"
              type="number"
              min="1"
              value={portionsCooked}
              onChange={(e) => setPortionsCooked(parseInt(e.target.value, 10) || 1)}
              className="portions-input"
            />
          </div>
          {id === 'new' && (
            <div className="planned-checkbox-group">
              <input
                id="planned"
                type="checkbox"
                checked={isPlanned}
                onChange={(e) => setIsPlanned(e.target.checked)}
                className="planned-checkbox"
              />
              <label htmlFor="planned">Plan this meal (don't consume ingredients yet)</label>
            </div>
          )}
        </>
      )}

      {isEditable && isPlanned && (
        <div className="planned-date-group">
          <label htmlFor="planned-date">Planned Date:</label>
          <input
            id="planned-date"
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className="planned-date-input"
          />
        </div>
      )}

      <MealItemEditor
        mealItems={mealItems}
        onMealItemsChange={handleMealItemsChange}
        isEditable={isEditable}
      />

      {!isEditable && meal && (
        <div className="meal-summary">
          <div className="summary-item">
            <span className="summary-label">Total Cost:</span>
            <span className="summary-value">{formatPrice(meal.totalCost, currency)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Calories:</span>
            <span className="summary-value">{parseFloat(meal.totalCalories.toFixed(2))}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Portions:</span>
            <span className="summary-value">{meal.portionsLeft} / {meal.portionsCooked} left</span>
          </div>
        </div>
      )}

      {!isEditable && meal && !meal.isPlanned && (
        <div className="meal-rating-section">
          <h3>How did this meal make you feel?</h3>
          <StarRating
            rating={meal.rating}
            onRatingChange={handleRateMeal}
            size="large"
          />
          {meal.rating && (
            <p className="rating-description">
              {meal.rating === 1 && "Poor - didn't feel good after eating"}
              {meal.rating === 2 && "Below average - some discomfort"}
              {meal.rating === 3 && "Average - felt okay"}
              {meal.rating === 4 && "Good - felt satisfied"}
              {meal.rating === 5 && "Excellent - felt great!"}
            </p>
          )}
        </div>
      )}

      {!isEditable && meal?.isPlanned && (
        <div className="planned-badge">
          <span className="planned-icon">📋</span>
          <span>This meal is planned but not yet cooked</span>
        </div>
      )}

      <div className="meal-actions">
        {isEditable ? (
          <>
            <button onClick={() => navigate('/cooking')} className="cancel-button">
              Cancel
            </button>
            <button onClick={handleSave} className="save-button">
              Save Meal
            </button>
          </>
        ) : (
          <>
            {meal?.isPlanned ? (
              <>
                <button onClick={handleMarkCooked} className="mark-cooked-button">
                  Mark Cooked
                </button>
                <button onClick={handleEdit} className="edit-button">
                  Edit
                </button>
              </>
            ) : (
              meal && meal.isActive && meal.portionsLeft > 0 && (
                <button onClick={handleConsumePortion} className="consume-button">
                  Consume Portion
                </button>
              )
            )}
            <button onClick={handleDeleteMeal} className="delete-button">
              Delete Meal
            </button>
            <button onClick={() => navigate('/cooking')} className="back-button">
              Back to Cooking
            </button>
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Meal;

