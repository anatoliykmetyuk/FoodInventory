import { useState, useEffect } from 'react';
import { getMeals } from '../services/dataService';
import type { Meal } from '../types';
import './MealReuseSelector.css';

interface MealReuseSelectorProps {
  onSelect: (meal: Meal) => void;
  onCancel: () => void;
}

function MealReuseSelector({ onSelect, onCancel }: MealReuseSelectorProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedMeals, setDisplayedMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const allMeals = getMeals();
    // Sort by date descending
    allMeals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMeals(allMeals);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show top 10 most recent meals
      setDisplayedMeals(meals.slice(0, 10));
    } else {
      // Search all meals
      const filtered = meals.filter(meal =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDisplayedMeals(filtered.slice(0, 10));
    }
  }, [searchTerm, meals]);

  return (
    <div className="meal-reuse-selector">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search meals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          autoFocus
        />
      </div>
      <div className="meals-list">
        {displayedMeals.length === 0 ? (
          <p className="no-meals">No meals found</p>
        ) : (
          displayedMeals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => onSelect(meal)}
              className="meal-option"
            >
              <div className="meal-option-name">{meal.name}</div>
              <div className="meal-option-date">
                {new Date(meal.date).toLocaleDateString()}
              </div>
            </button>
          ))
        )}
      </div>
      <div className="selector-actions">
        <button onClick={onCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default MealReuseSelector;

