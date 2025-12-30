import type { Granularity } from '../services/statisticsService';
import './GranularitySelector.css';

interface GranularitySelectorProps {
  granularity: Granularity;
  onGranularityChange: (granularity: Granularity) => void;
}

function GranularitySelector({ granularity, onGranularityChange }: GranularitySelectorProps) {
  return (
    <div className="granularity-selector">
      <label>Granularity:</label>
      <div className="granularity-options">
        <button
          className={granularity === 'day' ? 'active' : ''}
          onClick={() => onGranularityChange('day')}
        >
          Day
        </button>
        <button
          className={granularity === 'week' ? 'active' : ''}
          onClick={() => onGranularityChange('week')}
        >
          Week
        </button>
      </div>
    </div>
  );
}

export default GranularitySelector;

