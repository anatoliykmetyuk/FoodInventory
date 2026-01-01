import { useState, useEffect } from 'react';
import { getMeals, updateMeal, deleteMeal, markMealAsCooked } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import type { Meal } from '../types';
import MealCard from '../components/MealCard';
import CookMealDialog from '../components/CookMealDialog';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import './Cooking.css';

function Cooking() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isCookDialogOpen, setIsCookDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = () => {
    const allMeals = getMeals();
    // Sort meals by date in descending order (newest first)
    allMeals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeals(allMeals);
  };

  const handleCookFromScratch = () => {
    setIsCookDialogOpen(false);
    navigate('/cooking/meal/new');
  };

  const handleReuseMeal = (meal: Meal) => {
    setIsCookDialogOpen(false);
    navigate(`/cooking/meal/new?reuse=${meal.id}`);
  };

  const handleConsumePortion = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const newPortionsLeft = meal.portionsLeft - 1;
    const isActive = newPortionsLeft > 0;

    updateMeal(mealId, {
      portionsLeft: newPortionsLeft,
      isActive,
    });

    loadMeals();
  };

  const handleDeleteMeal = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    const confirmMessage = meal.isPlanned
      ? `Are you sure you want to delete "${meal.name}"?`
      : `Are you sure you want to delete "${meal.name}"? This will restore the used percentages to your fridge items.`;

    if (window.confirm(confirmMessage)) {
      deleteMeal(mealId);
      loadMeals();
    }
  };

  const handleMarkCooked = (mealId: string) => {
    const result = markMealAsCooked(mealId);
    
    if (result.success) {
      setToast({ message: 'Meal marked as cooked!', type: 'success' });
      loadMeals();
    } else {
      setToast({ message: result.errors.join('. '), type: 'error' });
    }
  };

  const plannedMeals = meals.filter(m => m.isPlanned);
  const activeMeals = meals.filter(m => m.isActive && !m.isPlanned);
  const completedMeals = meals.filter(m => !m.isActive && !m.isPlanned);

  return (
    <div className="cooking-page">
      <div className="cooking-header">
        <h1>Cooking</h1>
        <button
          onClick={() => setIsCookDialogOpen(true)}
          className="cook-meal-button"
        >
          Cook Meal
        </button>
      </div>

      {plannedMeals.length > 0 && (
        <section className="meals-section">
          <h2>Planned Meals</h2>
          <div className="meals-grid">
            {plannedMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onMarkCooked={handleMarkCooked}
                onDelete={handleDeleteMeal}
              />
            ))}
          </div>
        </section>
      )}

      {activeMeals.length > 0 && (
        <section className="meals-section">
          <h2>Active Meals</h2>
          <div className="meals-grid">
            {activeMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onConsumePortion={handleConsumePortion}
                onDelete={handleDeleteMeal}
              />
            ))}
          </div>
        </section>
      )}

      {completedMeals.length > 0 && (
        <section className="meals-section">
          <h2>Completed Meals</h2>
          <div className="meals-grid">
            {completedMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
            ))}
          </div>
        </section>
      )}

      {meals.length === 0 && (
        <EmptyState
          message="No meals yet. Start cooking to track your meals!"
          actionLabel="Cook Meal"
          onAction={() => setIsCookDialogOpen(true)}
        />
      )}

      <CookMealDialog
        isOpen={isCookDialogOpen}
        onClose={() => setIsCookDialogOpen(false)}
        onCookFromScratch={handleCookFromScratch}
        onReuseMeal={handleReuseMeal}
      />

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

export default Cooking;

