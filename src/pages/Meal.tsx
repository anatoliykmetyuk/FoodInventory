import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMeal, addMeal, updateMeal } from '../services/dataService';
import { updateFridgeAfterMeal } from '../services/dataService';
import type { Meal, MealItem } from '../types';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import MealItemEditor from '../components/MealItemEditor';
import './Meal.css';

function Meal() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [portionsCooked, setPortionsCooked] = useState(1);
  const [isEditable, setIsEditable] = useState(false);
  const currency = getCurrency();

  useEffect(() => {
    const reuseId = searchParams.get('reuse');

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
        setIsEditable(false);
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
      const newMeal = addMeal({
        name: mealName.trim(),
        date: new Date(),
        items: mealItems,
        totalCost,
        totalCalories,
        portionsCooked,
        portionsLeft: portionsCooked,
        isActive: true,
      });

      // Update fridge
      updateFridgeAfterMeal(mealItems);

      // Navigate to view mode
      navigate(`/cooking/meal/${newMeal.id}`);
    }
    // Meals are immutable after creation - no update path
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

  const loadMeal = (mealId: string) => {
    const loadedMeal = getMeal(mealId);
    if (loadedMeal) {
      setMeal(loadedMeal);
      setMealName(loadedMeal.name);
      setMealItems(loadedMeal.items);
      setPortionsCooked(loadedMeal.portionsCooked);
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
            {meal && meal.isActive && meal.portionsLeft > 0 && (
              <button onClick={handleConsumePortion} className="consume-button">
                Consume Portion
              </button>
            )}
            <button onClick={() => navigate('/cooking')} className="back-button">
              Back to Cooking
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Meal;

