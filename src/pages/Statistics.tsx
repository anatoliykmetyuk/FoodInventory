import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aggregateData, aggregateRatings, type Granularity, type StatisticsType } from '../services/statisticsService';
import type { StatisticsDataPoint, RatingsDataPoint } from '../services/statisticsService';
import StatisticsChart from '../components/StatisticsChart';
import RatingsChart from '../components/RatingsChart';
import DateRangePicker from '../components/DateRangePicker';
import GranularitySelector from '../components/GranularitySelector';
import TypeSelector from '../components/TypeSelector';
import { formatPrice } from '../utils/currencyFormatter';
import { getCurrency } from '../services/settingsService';
import './Statistics.css';

function Statistics() {
  const navigate = useNavigate();
  const currency = getCurrency();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [type, setType] = useState<StatisticsType>('meals');
  const [data, setData] = useState<StatisticsDataPoint[]>([]);
  const [ratingsData, setRatingsData] = useState<RatingsDataPoint[]>([]);
  const [selectedDataPoint, setSelectedDataPoint] = useState<StatisticsDataPoint | null>(null);
  const [selectedRatingsDataPoint, setSelectedRatingsDataPoint] = useState<RatingsDataPoint | null>(null);

  useEffect(() => {
    if (type === 'ratings') {
      const aggregated = aggregateRatings(startDate, endDate, granularity);
      setRatingsData(aggregated);
      setSelectedRatingsDataPoint(null);
    } else {
      const aggregated = aggregateData(startDate, endDate, granularity, type);
      setData(aggregated);
      setSelectedDataPoint(null);
    }
  }, [startDate, endDate, granularity, type]);

  return (
    <div className="statistics-page">
      <h1>Statistics</h1>

      <div className="statistics-controls">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <GranularitySelector
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <TypeSelector
          type={type}
          onTypeChange={setType}
        />
      </div>

      {type === 'ratings' ? (
        ratingsData.length === 0 ? (
          <div className="no-data">
            <p>No rated meals available for the selected date range.</p>
            <p className="no-data-hint">Rate your meals to see how your body feels over time!</p>
          </div>
        ) : (
          <>
            <RatingsChart
              data={ratingsData}
              onDataPointClick={(dataPoint) => setSelectedRatingsDataPoint(dataPoint)}
            />
            {selectedRatingsDataPoint && selectedRatingsDataPoint.meals.length > 0 && (
              <div className="statistics-items-list">
                <h2>Meals for {new Date(selectedRatingsDataPoint.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</h2>
                <p className="ratings-summary">
                  Average Rating: {selectedRatingsDataPoint.averageRating.toFixed(1)} ★ 
                  ({selectedRatingsDataPoint.ratingCount} meal{selectedRatingsDataPoint.ratingCount > 1 ? 's' : ''})
                </p>
                <div className="items-grid">
                  {selectedRatingsDataPoint.meals.map((meal, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(`/cooking/meal/${meal.id}`)}
                      className="statistics-item-button"
                    >
                      <span className="item-name">{meal.name}</span>
                      <span className="item-rating">{'★'.repeat(meal.rating)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      ) : (
        data.length === 0 ? (
          <div className="no-data">
            <p>No data available for the selected date range and type.</p>
          </div>
        ) : (
          <>
            <StatisticsChart
              data={data}
              onDataPointClick={(dataPoint) => setSelectedDataPoint(dataPoint)}
            />
            {selectedDataPoint && selectedDataPoint.items.length > 0 && (
              <div className="statistics-items-list">
                <h2>Items for {new Date(selectedDataPoint.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</h2>
                <div className="items-grid">
                  {selectedDataPoint.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.type === 'meal') {
                          navigate(`/cooking/meal/${item.id}`);
                        } else {
                          navigate(`/shopping/event/${item.id}`);
                        }
                      }}
                      className="statistics-item-button"
                    >
                      <span className="item-name">{item.name}</span>
                      <span className="item-cost">{formatPrice(item.cost, currency)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

export default Statistics;

