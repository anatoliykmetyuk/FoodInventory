import { useState, useEffect } from 'react';
import { getMeals, updateMeal } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import type { Meal } from '../types';
import MealCard from '../components/MealCard';
import CookMealDialog from '../components/CookMealDialog';
import EmptyState from '../components/EmptyState';
import './Cooking.css';

function Cooking() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isCookDialogOpen, setIsCookDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = () => {
    const allMeals = getMeals();
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

  const activeMeals = meals.filter(m => m.isActive);
  const completedMeals = meals.filter(m => !m.isActive);

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

      {activeMeals.length > 0 && (
        <section className="meals-section">
          <h2>Active Meals</h2>
          <div className="meals-grid">
            {activeMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onConsumePortion={handleConsumePortion}
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
              <MealCard key={meal.id} meal={meal} />
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
    </div>
  );
}

export default Cooking;

