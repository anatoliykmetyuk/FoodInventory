import type { StatisticsType } from '../services/statisticsService';
import './TypeSelector.css';

interface TypeSelectorProps {
  type: StatisticsType;
  onTypeChange: (type: StatisticsType) => void;
}

function TypeSelector({ type, onTypeChange }: TypeSelectorProps) {
  return (
    <div className="type-selector">
      <label>Type:</label>
      <div className="type-options">
        <button
          className={type === 'meals' ? 'active' : ''}
          onClick={() => onTypeChange('meals')}
        >
          Meals
        </button>
        <button
          className={type === 'shopping' ? 'active' : ''}
          onClick={() => onTypeChange('shopping')}
        >
          Shopping Events
        </button>
      </div>
    </div>
  );
}

export default TypeSelector;

