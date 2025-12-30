import { useState } from 'react';
import type { Meal } from '../types';
import MealReuseSelector from './MealReuseSelector';
import './CookMealDialog.css';

interface CookMealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCookFromScratch: () => void;
  onReuseMeal: (meal: Meal) => void;
}

function CookMealDialog({ isOpen, onClose, onCookFromScratch, onReuseMeal }: CookMealDialogProps) {
  const [showReuseSelector, setShowReuseSelector] = useState(false);

  if (!isOpen) return null;

  const handleReuse = (meal: Meal) => {
    onReuseMeal(meal);
    setShowReuseSelector(false);
  };

  if (showReuseSelector) {
    return (
      <div className="dialog-overlay" onClick={onClose}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          <h2>Select Meal to Reuse</h2>
          <MealReuseSelector
            onSelect={handleReuse}
            onCancel={() => setShowReuseSelector(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>Cook Meal</h2>
        <p className="dialog-description">How would you like to cook this meal?</p>
        <div className="cook-options">
          <button onClick={onCookFromScratch} className="option-button">
            Cook from Scratch
          </button>
          <button onClick={() => setShowReuseSelector(true)} className="option-button">
            Reuse Previous Meal
          </button>
        </div>
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CookMealDialog;

